import express from "express";
import fs from "fs";
import path from "path";
import net from "net";
import os from "os";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { db, Slide } from "./server/db";
import { supabase, getSupabaseStatus } from "./server/supabase";
import { generateSlideContent, themeTemplates, generateImageFromPrompt, generateSvgFromPrompt } from "./server/ai";
import { buildPptxBuffer } from "./server/pptx";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "slide_ai_secret_encryption_9aef32";
const app = express();

app.use(express.json());

// Express Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing or invalid" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Token is expired or invalid" });
    }
    req.user = user;
    next();
  });
}

// Check for system health
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// --- AUTHENTICATION ROUTES ---

// Supabase Connection Status Diagnostic endpoint
app.get("/api/supabase/status", async (req, res) => {
  try {
    const status = await getSupabaseStatus();
    res.json(status);
  } catch (err) {
    res.json({ initialized: true, tableAvailable: false });
  }
});

app.post("/api/auth/register", async (req, res) => {
  const name = req.body.name || req.body.email;
  const { password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Name and password are required" });
  }

  const cleanName = name.trim();
  const pseudoEmail = cleanName.includes('@') ? cleanName.toLowerCase() : `${cleanName.toLowerCase()}@local.com`;

  // 1. Try Supabase Auth First
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: pseudoEmail,
      password,
    });

    if (!authError && authData?.user) {
      const newUser = {
        id: authData.user.id,
        name: cleanName,
        passwordHash: "",
        createdAt: new Date().toISOString()
      };
      await db.createUser(newUser); // Syncs with Supabase public.users if enabled, and local registry fallback
      const token = jwt.sign({ id: newUser.id, name: cleanName }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user: { id: newUser.id, name: cleanName } });
    } else if (authError) {
      console.warn("Supabase Auth registration yielded an error, falling back to local database...", authError.message);
    }
  } catch (supabaseErr) {
    console.warn("Supabase Auth registration failed/unconfigured, falling back to local database...", supabaseErr);
  }

  // 2. Local Database Fallback
  try {
    const existing = await db.findUserByName(cleanName);
    if (existing) {
      return res.status(400).json({ error: "This name is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = {
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      name: cleanName,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    await db.createUser(newUser);

    const token = jwt.sign({ id: newUser.id, name: cleanName }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser.id, name: cleanName } });
  } catch (err: any) {
    res.status(500).json({ error: "Authentication registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const name = req.body.name || req.body.email;
  const { password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Name and password are required" });
  }

  const cleanName = name.trim();
  const pseudoEmail = cleanName.includes('@') ? cleanName.toLowerCase() : `${cleanName.toLowerCase()}@local.com`;

  // 1. Try Supabase Auth First
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: pseudoEmail,
      password,
    });

    if (!authError && authData?.user) {
      // Create user row in public.users if it doesn't exist yet (robust healing)
      const existing = await db.findUserByName(cleanName);
      if (!existing) {
        await db.createUser({
          id: authData.user.id,
          name: cleanName,
          passwordHash: "",
          createdAt: authData.user.created_at || new Date().toISOString()
        });
      }
      const token = jwt.sign({ id: authData.user.id, name: cleanName }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: authData.user.id, name: cleanName } });
    } else if (authError) {
      console.warn("Supabase Auth login yielded an error, executing legacy local fallback check:", authError.message);
    }
  } catch (supabaseErr) {
    console.warn("Supabase auth login unconfigured/timeout, checking local fallback store:", supabaseErr);
  }

  // 2. Local Database Fallback
  try {
    const user = await db.findUserByName(cleanName);
    if (!user) {
      return res.status(400).json({ error: "Invalid name or password" });
    }

    // If password hash is empty but Supabase user exists and has connected (meaning password was created via supabase auth)
    if (!user.passwordHash && user.id) {
      return res.status(400).json({ error: "Please login with your Supabase credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ error: "Invalid name or password" });
    }

    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: "Authentication login failed" });
  }
});

app.get("/api/auth/me", authenticateToken, (req: any, res) => {
  const user = req.user;
  res.json({ user: { id: user.id, name: user.name } });
});

// --- PRESENTATIONS ROUTES ---

// List all 8 themes/templates
app.get("/api/presentations/templates", (req, res) => {
  const list = Object.entries(themeTemplates).map(([key, value]) => ({
    category: key,
    name: value.name,
    colors: value.colors,
    fontTitle: value.fontTitle,
    fontBody: value.fontBody
  }));
  res.json({ templates: list });
});

// Retrieve all presentations for authenticated user
app.get("/api/presentations", authenticateToken, async (req: any, res) => {
  const list = await db.getPresentationsByUser(req.user.id);
  // Sort by created descending
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ presentations: list });
});

// Retrieve one full presentation details
app.get("/api/presentations/:id", authenticateToken, async (req: any, res) => {
  const presentation = await db.getPresentationById(req.params.id);
  if (!presentation) {
    return res.status(404).json({ error: "Presentation content not found" });
  }
  if (presentation.userId !== req.user.id) {
    return res.status(403).json({ error: "Access denied to third party presentation" });
  }
  res.json(presentation);
});

// Delete a presentation
app.delete("/api/presentations/:id", authenticateToken, async (req: any, res) => {
  const presentation = await db.getPresentationById(req.params.id);
  if (!presentation) {
    return res.status(404).json({ error: "Presentation not found" });
  }
  if (presentation.userId !== req.user.id) {
    return res.status(403).json({ error: "Access denied" });
  }

  await db.deletePresentation(req.params.id);
  res.json({ success: true, message: "Presentation deleted successfully" });
});

// AI Image Generation Endpoint
app.post("/api/images/generate", authenticateToken, async (req: any, res) => {
  const { prompt, aspectRatio = "1:1" } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: "Image generation description prompt is required." });
  }

  try {
    const imageUrl = await generateImageFromPrompt(prompt, aspectRatio);
    res.json({ imageUrl });
  } catch (err: any) {
    console.error("Express image generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate visual asset using Gemini. Check API billing/setup." });
  }
});

// AI SVG Diagram/Illustration Generation Endpoint
app.post("/api/svgs/generate", authenticateToken, async (req: any, res) => {
  const { prompt, title = "", colors = {} } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: "SVG visual graphic topic description is required." });
  }

  try {
    const svg = await generateSvgFromPrompt(prompt, title, colors);
    res.json({ svg });
  } catch (err: any) {
    console.error("Express SVG generation error:", err);
    res.status(500).json({ error: err.message || "Failed to generate vector SVG illustration." });
  }
});

// AI Slide Generation Endpoint
app.post("/api/presentations/generate", authenticateToken, async (req: any, res) => {
  const {
    prompt,
    extraData,
    numSlides = 6,
    templateCategory = "auto",
    stylePreference = "professional",
    audienceType = "general",
    includeAgenda = true,
    includeSummary = true
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: "Presentation prompt concept is required" });
  }

  try {
    // Generate slideshow structure using Google Gemini 3.5 Flash Model API (server side)
    const aiResult = await generateSlideContent({
      prompt,
      extraData,
      numSlides: Math.max(3, Math.min(12, numSlides)),
      templateCategory,
      stylePreference,
      audienceType,
      includeAgenda,
      includeSummary
    });

    const category = aiResult.themeCategory || "general";
    const selectedTemplate = themeTemplates[category] || themeTemplates.general;

    // Map AI result to our formal DB schema
    const newPresentation = {
      id: "pptx_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      userId: req.user.id,
      title: aiResult.title || prompt.substring(0, 50),
      prompt,
      extraData,
      numSlides: aiResult.slides.length,
      slideData: aiResult.slides.map((s: any, index: number) => ({
        id: `slide_${index + 1}_${Math.random().toString(36).substring(2, 6)}`,
        type: s.type || 'content',
        title: s.title || `Slide ${index + 1}`,
        subtitle: s.subtitle || "",
        bullets: Array.isArray(s.bullets) ? s.bullets : []
      })),
      theme: category,
      colors: selectedTemplate.colors,
      fontTitle: selectedTemplate.fontTitle,
      fontBody: selectedTemplate.fontBody,
      status: "done",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.addPresentation(newPresentation);
    res.status(201).json(newPresentation);
  } catch (err: any) {
    console.error("Presentation generation failed:", err);
    res.status(500).json({
      error: "Failed to generate AI slideshow content. Please try another outline or check your input prompt concept."
    });
  }
});

// Update or Save Edited Slides
app.patch("/api/presentations/:id", authenticateToken, async (req: any, res) => {
  const presentation = await db.getPresentationById(req.params.id);
  if (!presentation) {
    return res.status(404).json({ error: "Presentation not found" });
  }
  if (presentation.userId !== req.user.id) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { title, slideData, theme, colors, fontTitle, fontBody } = req.body;
  const updates: Partial<typeof presentation> = {};

  if (title !== undefined) updates.title = title;
  if (slideData !== undefined) {
    updates.slideData = slideData;
    updates.numSlides = slideData.length;
  }
  if (theme !== undefined) {
    updates.theme = theme;
    // Auto sync colors/fonts if they switch theme inside editor
    if (themeTemplates[theme] && !colors) {
      updates.colors = themeTemplates[theme].colors;
      updates.fontTitle = themeTemplates[theme].fontTitle;
      updates.fontBody = themeTemplates[theme].fontBody;
    }
  }
  if (colors !== undefined) updates.colors = colors;
  if (fontTitle !== undefined) updates.fontTitle = fontTitle;
  if (fontBody !== undefined) updates.fontBody = fontBody;

  const updated = await db.updatePresentation(req.params.id, updates);
  res.json(updated);
});

// Download .pptx file built on the fly using python pptx substitute
app.get("/api/presentations/:id/download", annotateDownloadHeaders, (req: any, res) => {
  // Wait, we need auth, but browser download clicks might not send easily JWT.
  // We can support token in query parameter `?token=XYZ`
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ error: "Authentication token parameter required to download PPTX" });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Token is expired or invalid for download key" });
    }

    const presentation = await db.getPresentationById(req.params.id);
    if (!presentation) {
      return res.status(404).json({ error: "Presentation database row not found" });
    }
    if (presentation.userId !== user.id) {
      return res.status(403).json({ error: "Access denied. Private asset presentation" });
    }

    try {
      // Build presentation buffer on the server securely
      const buffer = await buildPptxBuffer(presentation);

      // Sanitize title for file name
      const safeTitle = presentation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || "presentation";
      
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pptx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer);
    } catch (buildErr) {
      console.error("PPTX Buffer building failed:", buildErr);
      res.status(500).json({ error: "Unable to create presentation file output format on server." });
    }
  });
});

function annotateDownloadHeaders(req: any, res: any, next: any) {
  next();
}

// Ensure database config variables exist
const envExamplePath = path.join(process.cwd(), '.env.example');
if (!fs.existsSync(envExamplePath)) {
  fs.writeFileSync(envExamplePath, `GEMINI_API_KEY=\nJWT_SECRET=\n`, 'utf-8');
}

// Automatic bootstrap procedure for preloaded functional dummy account
async function bootstrapDummyAccount() {
  const dummyName = "demo";
  const dummyEmail = "demo@supabase.com";
  const dummyPassword = "password123";

  // 1. Try Supabase Auth registry
  try {
    const { data, error } = await supabase.auth.signUp({
      email: dummyEmail,
      password: dummyPassword,
    });
    if (!error && data?.user) {
      console.log("Successfully auto-registered dummy Supabase Auth account:", dummyName);
      const newUser = {
        id: data.user.id,
        name: dummyName,
        passwordHash: "",
        createdAt: new Date().toISOString()
      };
      db.addUser(newUser);
    } else if (error) {
      console.log("Supabase Auth dummy signup status:", error.message);
    }
  } catch (err) {
    console.warn("Could not connect to Supabase Auth during dummy credentials registration:", err);
  }

  // 2. Local Fallback Database registry
  try {
    const users = db.getUsers();
    if (!users.find(u => (u.name || (u as any).email || '').toLowerCase() === dummyName.toLowerCase())) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(dummyPassword, salt);
      const newUser = {
        id: "dummy_user_1",
        name: dummyName,
        passwordHash,
        createdAt: new Date().toISOString()
      };
      db.addUser(newUser);
      console.log("Registered dummy account in hybrid local fallback database:", dummyName);
    }
  } catch (err) {
    console.warn("Local database fallback registry failed:", err);
  }
}

// Helper to find an available port starting from a preferred port
function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        resolve(startPort);
      }
    });
    server.once('listening', () => {
      server.close(() => {
        resolve(startPort);
      });
    });
    server.listen(startPort, '0.0.0.0');
  });
}

// Helper to retrieve local non-loopback IPv4 network addresses
function getLocalIPs(): string[] {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];
  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;
    for (const info of iface) {
      if (info.family === 'IPv4' && !info.internal) {
        ips.push(info.address);
      }
    }
  }
  return ips;
}

// --- VITE MIDDLEWARE INTERACTION ---
async function startServer() {
  await bootstrapDummyAccount();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve HTML page
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const startPort = parseInt(process.env.PORT || "3000", 10);
  const actualPort = await findAvailablePort(startPort);

  app.listen(actualPort, "0.0.0.0", () => {
    console.log(`\n🚀 Server actively running:`);
    console.log(`   - Local:            http://localhost:${actualPort}`);
    const localIPs = getLocalIPs();
    for (const ip of localIPs) {
      console.log(`   - Network (IP):     http://${ip}:${actualPort}`);
    }
    console.log();
  });
}

startServer();

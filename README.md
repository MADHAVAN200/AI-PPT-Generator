# AI PPT Presentation Generator ─ Single Source of Documentation

Welcome to the **AI PPT Presentation Generator** codebase. This comprehensive artifact serves as the authoritative, single source of documentation, describing the software architecture, design decisions, data workflows, API patterns, and build system configuration of this full-stack application.

The platform allows users to instantly brainstorm, customize, visually format, present, and download beautiful, publication-ready PowerPoint presentations (`.pptx`) with on-the-fly AI vector graphs, premium generated illustrations, and theme styling templates.

---

## High-Level System Architecture

The project is structured as a robust **Full-Stack hybrid SPA/API architecture** built entirely on **TypeScript**. 

```
                                              ┌────────────────────────┐
                                              │      Google Drive       │
                                              │    (Google Slides)     │
                                              └───────────▲────────────┘
                                                          │ (Popup OAuth)
                                                          │
┌─────────────────────────────────┐           ┌───────────▼────────────┐
│                                 │           │                        │
│         React 19 client         ◄───────────►   Firebase Client Auth │
│   (Vite SPA + Tailwind v4 CSS)  │           │     & API Token Cash   │
│                                 │           │                        │
└────────────────▲────────────────┘           └────────────────────────┘
                 │
                 │ Axios API Calls (JSON with Auth JWT Bearer Headers)
                 │
┌────────────────▼─────────────────────────────────────────────────────┐
│                                                                      │
│                    Express.js REST API Server                        │
│                    └─── Node.js Native Runtime                       │
│                                                                      │
└────────▲──────────────────▲──────────────────▲──────────────────▲────┘
         │                  │                  │                  │
         │ (AI Synthesizer) │ (Asset Engine)   │ (DB Fallbacks)   │ (XML Compiler)
         │                  │                  │                  │
┌────────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐ ┌───────▼────────┐
│   Groq + Llama  │ │  Gemini Flash  │ │   Supabase     │ │   pptxgenjs    │
│   (Outline Gen) │ │  Client SDK    │ │   PostgreSQL   │ │   PowerPoint   │
│                 │ │  (Images, SVG) │ │   or db.json   │ │   Builder      │
└─────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘
```

---

## Codebase Directory Index

A high-level outline of the physical directory layouts:

```
├── server.ts                       # Dual-mode Express.js application entry point
├── metadata.json                   # Platform descriptors, permissions, and app identity
├── package.json                    # Compilation scripts and dependencies configuration
├── tsconfig.json                   # Project TypeScript compiler rules
├── vite.config.ts                  # Vite SPA packager definitions
├── db.json                         # Local filesystem flat database fallback file
├── server/                         # Backend Application Modules
│   ├── ai.ts                       # LLM clients (Gemini, Groq) and design style themes
│   ├── db.ts                       # Database controller with Hybrid Supabase mapping
│   ├── supabase.ts                 # Supabase client wrapper and verification routines
│   └── pptx.ts                     # XML-based PowerPoint binary code compiler
└── src/                            # Frontend Application Modules
    ├── main.tsx                    # Direct React DOM mounting point
    ├── index.css                   # Global CSS rules including Tailwind v4 imports
    ├── App.tsx                     # Core Client Router wrapper and theme context
    ├── types.ts                    # Declared global TypeScript models
    └── components/                 # Extracted UI component suites
        ├── LoginRegister.tsx       # Auth form and user access suite
        ├── Dashboard.tsx           # user deck archives dashboard
        ├── Generator.tsx           # Configure generation properties (slides, style, topic)
        └── Editor.tsx              # Slidework editor, Visualizer Canvas, & Present Panel
```

---

## Technical Domain & Integration Mapping

### 1. The Frontend Engine (SPA Suite)
- **Framework & Sizing**: Built with **React 19** and compiled via **Vite 6** to ensure zero-overhead page bundling.
- **Micro-Animations**: Transitions, fade-ins, and animated slide thumbnails are orchestrated via **`motion` (React)** (`motion/react`) for fluid interactive gestures.
- **Styling Archetype**: Driven by **Tailwind CSS v4**'s advanced `@theme` framework, entirely avoiding external `.css` wrappers.
- **Responsive Geometry**: Handles widescreen templates fluidly through a decoupled Aspect-Ratio Canvas architecture which remains isolated from viewport scaling glitches.

### 2. The AI Generation layer (Deep-Text + Graphic Vectors)
When a user requests a deck topic, the orchestrator triggers parallel pathways:
- **Presentation Outline Synthesis**: The server initiates text generation with **Groq (`llama-3.3-70b-versatile`)** for lightning-fast structured responses. If Groq is unconfigured, it fails over gracefully to server-side **Google Gemini (`gemini-3.5-flash`)** using strict `responseSchema` definitions. This returns a beautifully tailored slide presentation structure containing titles, contextual details, and semantic lists.
- **Slide Graphic Assets**: Built-in visual triggers allow generating tailored images using **Gemini (`gemini-2.5-flash-image`)** or programmatic standalone **vector graphics (SVG)** generated using **Gemini (`gemini-3.5-flash`)** returning beautiful, fully colored XML modules on the fly.

### 3. The Dual-Database Hybrid Persistence Layer
To guarantee 100% operational uptime, the codebase maintains an active **Hybrid Database System**:
- **Production Persistence**: If valid Supabase configurations are detected, user profile schemas and slide details read / write from tables mapping snake_case database records into nested camelCase application objects.
- **Resilient Fallback Local Persistence**: If Supabase is unconfigured, database operations automatically fall back to **`db.json`**, reading and writing using local JSON file operations (`fs.readFileSync` and `fs.writeFileSync`). No database errors are shown to the user.

### 4. The PowerPoint Compiler Engine (`.pptx` Compiler)
The app is entirely free from cloud-dependent formats when downloading:
- Uses `pptxgenjs` to directly translate JSON configurations into pure Microsoft Open Office XML `.pptx` documents on the backend.
- Incorporates exact typographic constraints matching the UI themes:
  - Font families (Inter, Space Grotesk, Playfair Display, JetBrains Mono, Lora, Outfit).
  - Hex color constants (Primary, Secondary, Accent highlight colors, text colors).
  - Widescreen 16:9 layout margins, layout alignments, geometric section blocks, and embedded custom visual attachments.

---

## Creative Theme Directory & Design Archetypes

Each presentation is automatically assigned or customized using highly deliberate design palettes configured in `/server/ai.ts`:

| Theme Category | Visual Palette (BG, Primary, Accent) | Font Pairings (Title | Body) | Tone Characteristics |
| :--- | :--- | :--- | :--- |
| **Business Strategy** | `#FFFFFF` | `#0B3C5D` | `#D9B310` | Space Grotesk | Inter | Corporate, trustworthy, structured |
| **Tech & Innovation** | `#0B0F19` | `#6366F1` | `#10B981` | JetBrains Mono | Inter | Immersive dark mode, neon highlights |
| **Academic Learn** | `#F4F7F6` | `#1B3B32` | `#82C1A6` | Space Grotesk | Inter | Soft organic greens, clean blackboard |
| **Medical & Health**| `#F0FDF4` | `#0D9488` | `#34D399` | Inter | Inter | Safe, hygienic, highly legible |
| **Creative Campaign**| `#FFFBEB` | `#DC2626` | `#EF4444` | Space Grotesk | Inter | Dynamic high-contrast amber and crimson |
| **Investor Deck**   | `#111827` | `#F59E0B` | `#10B981` | Inter | Inter | Clean charcoal dark, modern luxury cues |
| **Portfolio Design**| `#FAF5FF` | `#7C3AED` | `#F43F5E` | Space Grotesk | Inter | Playful purples, geometric shapes |
| **Cosmic Space**     | `#090915` | `#8B5CF6` | `#EC4899` | Outfit | Inter | Tech-forward, atmospheric space dark |
| **Editorial Serif** | `#FBF9F4` | `#0F5132` | `#78350F` | Playfair Display | Lora | Luxurious serif, paper texture vibe |
| **Swiss Brutalist** | `#000000` | `#FF5A00` | `#FF5A00` | JetBrains Mono | Mono | Stripped down high-contrast grid layouts |
| **Forest Glow**     | `#061C15` | `#10B981` | `#F59E0B` | Outfit | Inter | Golden ratio accents, twilight green accent |

---

## REST API Endpoint Documentation Map

All programmatic requests utilize JWT token authorization. Headers must contain standard: `Authorization: Bearer <token>` keys.

### Authentication Endpoints
- **Register User** (`POST /api/auth/register`)
  - Body: `{ email, password }`
  - Response: `{ token, user: { id, email } }`
- **Login User** (`POST /api/auth/login`)
  - Body: `{ email, password }`
  - Response: `{ token, user: { id, email } }`
- **Verify Self Identity** (`GET /api/auth/me`)
  - Response: `{ user: { id, email } }`
- **Database Status Diagnostic** (`GET /api/supabase/status`)
  - Response: `{ initialized: true, tableAvailable: boolean, usersTableAvailable: boolean }`

### Presentations Endpoints
- **List All Themes/Configurations** (`GET /api/presentations/templates`)
  - Response: `{ templates: [...] }`
- **Query User Slideshow Deck List** (`GET /api/presentations`)
  - Response: `{ presentations: [ Presentation[] ] }`
- **Retrieve Specific Slideshow Deck** (`GET /api/presentations/:id`)
  - Response: `Presentation Object Schema`
- **AI Slideshow Generator Integration** (`POST /api/presentations/generate`)
  - Body:
    ```json
    {
      "prompt": "Artificial intelligence in agriculture",
      "extraData": "additional raw text or numbers context to bake",
      "numSlides": 6,
      "templateCategory": "technology",
      "stylePreference": "professional",
      "audienceType": "investors"
    }
    ```
- **Update/Overwrite Deck Elements** (`PATCH /api/presentations/:id`)
  - Body: Partial presentation updates (`title`, `slideData`, `theme`, `colors`, etc.)
- **Delete Slideshow Presentation** (`DELETE /api/presentations/:id`)
  - Response: `{ success: true }`
- **Download Compilable Presentation** (`GET /api/presentations/:id/download?token=<JWT_TOKEN>`)
  - Direct Binary HTTP Steam attachment response.

### AI Media Creation Endpoints
- **AI Aspect-Ratio Image Generation** (`POST /api/images/generate`)
  - Body: `{ prompt, aspectRatio: "1:1" | "4:3" | "16:9" }`
  - Response: `{ imageUrl: "<base64_src_data>" }`
- **AI Programmatic SVG Generation** (`POST /api/svgs/generate`)
  - Body: `{ prompt, title, colors: {} }`
  - Response: `{ svg: "<svg_xml_code>" }`

---

## Compilation, Build & Run Guidelines

This guide walks you through setting up and running the AI Presentation Generator from scratch in a local environment or server.

### Prerequisites
Before starting, ensure you have the following installed on your system:
- **Node.js**: Version 18.x or higher is recommended.
- **npm** (Node Package Manager): Usually bundled with Node.js.

---

### Step 1: Install codebase dependencies
To install all required package dependencies defined in `package.json` (such as React, Express, esbuild, Tailwind CSS, jwt, and pptx builders), run:

```bash
npm install
```

---

### Step 2: Configure Environment Variables
The application keeps sensitive keys secure on the backend. Create a `.env` file in the root directory of the project and populate it with your specific API credentials:

```bash
# Create local environment config
touch .env
```

Add the following environment variables to your `.env` file:

```env
# Google Gemini API key used for outline generation, graphic assets, and vector SVGs
GEMINI_API_KEY=your_gemini_api_key_here

# Groq API Key (Optional: Falls back to Gemini-3.5-flash if not provided)
GROQ_API_KEY=your_groq_api_key_here

# JSON Web Signature cryptography salt secret
JWT_SECRET=any_complex_cryptographic_string_here

# Supabase Credentials (Optional: Automatically falls back to local db.json if not provided)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

---

### Step 3: Setup Persistence Storage
- **Resilient Fallback Mode**: If Supabase configuration is unconfigured or absent, you do not need to do any database setup. The system automatically creates a local **`db.json`** file dynamically in your workspace root, serving as a clean, fully functional local flat database file!
- **Supabase Production Mode**: If you configure Supabase variables, ensure your database has a `presentations` table and a `users` table corresponding to the mappings detailed in `/server/supabase.ts`.

---

### Step 4: Choose Your Execution Mode

#### Run in Development Mode (with Active HMR Hot-Reloading)
During local hot-reload development campaigns, Node executes code through `tsx` on port `3000` to stream real-time updates directly. Run:

```bash
npm run dev
```
Open your browser and navigate to: `http://localhost:3000`

#### Run in Production Mode (Pre-compiled Bundle)
For optimized performance, high-throughput container builds, or server deployments, compile assets into clean self-contained files:

1. **Bundle Assets & Compile**:
   This packages the React SPA frontend via Vite, then bundles `server.ts` into a fast, standalone CommonJS module (`dist/server.cjs`) using `esbuild` to optimize cold-starts:
   ```bash
   npm run build
   ```

2. **Start Server**:
   Launch the compiled high-efficiency Node.js production web server directly:
   ```bash
   npm run start
   ```
Go to `http://localhost:3000` to explore your fully production-ready, high-speed instance.

---

## Security Architectures
- **Secret Encryption**: The JWT token contains a cryptographic block salted with `JWT_SECRET` keys kept hidden behind server API environments.
- **Client Security**: API key credentials (e.g. `GEMINI_API_KEY`, `GROQ_API_KEY`) reside exclusively in server env profiles. Frontends communicate purely with backend proxy routes to completely eliminate the threat of client-side key leaks.

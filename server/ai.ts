import { GoogleGenAI, Type } from "@google/genai";

// Shared Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey ? new GoogleGenAI({
  apiKey: geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Groq direct completion using native fetch to remain lightweight and robust
async function queryGroq(instructionText: string, systemPrompt: string): Promise<any> {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY environment variable is not configured");
  }
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${groqApiKey}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\nYou MUST return a single, valid JSON object strictly matching this schema:
{
  "title": "string representing overall beautiful title for the presentation structure",
  "themeCategory": "assigned category: business, technology, education, healthcare, marketing, finance, creative, or general",
  "slides": [
    {
      "type": "title | agenda | content | conclusion | section",
      "title": "string slide title",
      "subtitle": "optional string subtitle under heading",
      "bullets": ["string bullet point 1", "string bullet point 2"]
    }
  ]
}
Do not write any markdown blocks outside of the JSON.`
        },
        {
          role: "user",
          content: instructionText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API returned an error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const textContent = data.choices[0].message.content;
  return JSON.parse(textContent);
}

export const themeTemplates: Record<string, {
  name: string;
  colors: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    heading: string;
    muted: string;
  };
  fontTitle: string;
  fontBody: string;
}> = {
  business: {
    name: 'Business Strategy',
    colors: {
      bg: '#FFFFFF',
      primary: '#0B3C5D',
      secondary: '#328CC1',
      accent: '#D9B310',
      text: '#1D2731',
      heading: '#0B3C5D',
      muted: '#666666'
    },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  technology: {
    name: 'Tech & Innovation',
    colors: {
      bg: '#0B0F19',
      primary: '#6366F1',
      secondary: '#4F46E5',
      accent: '#10B981',
      text: '#9CA3AF',
      heading: '#FFFFFF',
      muted: '#4B5563'
    },
    fontTitle: 'JetBrains Mono',
    fontBody: 'Inter'
  },
  education: {
    name: 'Academic / Learn',
    colors: {
      bg: '#F4F7F6',
      primary: '#1B3B32',
      secondary: '#3D8B7A',
      accent: '#82C1A6',
      text: '#2E3B36',
      heading: '#1B3B32',
      muted: '#718982'
    },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  healthcare: {
    name: 'Medical & Health',
    colors: {
      bg: '#F0FDF4',
      primary: '#0D9488',
      secondary: '#0F766E',
      accent: '#34D399',
      text: '#1F2937',
      heading: '#111827',
      muted: '#6B7280'
    },
    fontTitle: 'Inter',
    fontBody: 'Inter'
  },
  marketing: {
    name: 'Creative Campaign',
    colors: {
      bg: '#FFFBEB',
      primary: '#DC2626',
      secondary: '#F59E0B',
      accent: '#EF4444',
      text: '#1F2937',
      heading: '#111827',
      muted: '#6B7280'
    },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  finance: {
    name: 'Investor Deck',
    colors: {
      bg: '#111827',
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#10B981',
      text: '#D1D5DB',
      heading: '#F9FAFB',
      muted: '#9CA3AF'
    },
    fontTitle: 'Inter',
    fontBody: 'Inter'
  },
  creative: {
    name: 'Portfolio / Design',
    colors: {
      bg: '#FAF5FF',
      primary: '#7C3AED',
      secondary: '#EC4899',
      accent: '#F43F5E',
      text: '#374151',
      heading: '#111827',
      muted: '#6B7280'
    },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  general: {
    name: 'Minimal Clean',
    colors: {
      bg: '#F8FAFC',
      primary: '#1E293B',
      secondary: '#3B82F6',
      accent: '#06B6D4',
      text: '#334155',
      heading: '#0F172A',
      muted: '#64748B'
    },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  cosmic: {
    name: 'Cosmic Space',
    colors: {
      bg: '#090915',
      primary: '#8B5CF6',
      secondary: '#D946EF',
      accent: '#EC4899',
      text: '#94A3B8',
      heading: '#FFFFFF',
      muted: '#475569'
    },
    fontTitle: 'Outfit',
    fontBody: 'Inter'
  },
  editorial: {
    name: 'Editorial Serif',
    colors: {
      bg: '#FBF9F4',
      primary: '#B45309',
      secondary: '#0F5132',
      accent: '#78350F',
      text: '#2D2D2D',
      heading: '#0F5132',
      muted: '#5D5D5D'
    },
    fontTitle: 'Playfair Display',
    fontBody: 'Lora'
  },
  brutalist: {
    name: 'Swiss Brutalist',
    colors: {
      bg: '#000000',
      primary: '#FF5A00',
      secondary: '#E2E8F0',
      accent: '#FF5A00',
      text: '#CBD5E1',
      heading: '#FFFFFF',
      muted: '#94A3B8'
    },
    fontTitle: 'JetBrains Mono',
    fontBody: 'JetBrains Mono'
  },
  charcoal: {
    name: 'Charcoal Bronze',
    colors: {
      bg: '#1A1D20',
      primary: '#CD7F32',
      secondary: '#A3704C',
      accent: '#CD7F32',
      text: '#D1D5DB',
      heading: '#FFFFFF',
      muted: '#8E959E'
    },
    fontTitle: 'Playfair Display',
    fontBody: 'Inter'
  },
  forest: {
    name: 'Forest Glow',
    colors: {
      bg: '#061C15',
      primary: '#10B981',
      secondary: '#F59E0B',
      accent: '#F59E0B',
      text: '#A7F3D0',
      heading: '#FFFFFF',
      muted: '#047857'
    },
    fontTitle: 'Outfit',
    fontBody: 'Inter'
  },
  neon: {
    name: 'Neon Cyberpunk',
    colors: {
      bg: '#05050C',
      primary: '#FB7185',
      secondary: '#38BDF8',
      accent: '#FB7185',
      text: '#94A3B8',
      heading: '#FFFFFF',
      muted: '#475569'
    },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  sunset: {
    name: 'Warm Sunset',
    colors: {
      bg: '#FDFBF7',
      primary: '#9C4221',
      secondary: '#D9A752',
      accent: '#D9A752',
      text: '#4E3629',
      heading: '#9C4221',
      muted: '#8C7365'
    },
    fontTitle: 'Playfair Display',
    fontBody: 'Inter'
  },
  sand: {
    name: 'Sage Garden',
    colors: {
      bg: '#F4F6F4',
      primary: '#2C3E35',
      secondary: '#6B8E7D',
      accent: '#C06C5C',
      text: '#384A41',
      heading: '#2C3E35',
      muted: '#7B8C83'
    },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  royal: {
    name: 'Royal Gold',
    colors: {
      bg: '#0B132B',
      primary: '#E0A96D',
      secondary: '#3A506B',
      accent: '#E0A96D',
      text: '#B0C4DE',
      heading: '#FFFFFF',
      muted: '#5C6B73'
    },
    fontTitle: 'Playfair Display',
    fontBody: 'Inter'
  },
  nord: {
    name: 'Nordic Frost',
    colors: {
      bg: '#ECEFF4',
      primary: '#2E3440',
      secondary: '#4C566A',
      accent: '#88C0D0',
      text: '#3B4252',
      heading: '#2E3440',
      muted: '#4C566A'
    },
    fontTitle: 'Space Grotesk',
    fontBody: 'Inter'
  },
  ocean: {
    name: 'Pacific Blue',
    colors: {
      bg: '#F0F8FF',
      primary: '#1E3A8A',
      secondary: '#3B82F6',
      accent: '#34D399',
      text: '#1E293B',
      heading: '#0F172A',
      muted: '#64748B'
    },
    fontTitle: 'Outfit',
    fontBody: 'Inter'
  }
};

export async function generateSlideContent(params: {
  prompt: string;
  extraData?: string;
  numSlides: number;
  templateCategory?: string;
  stylePreference?: string;
  audienceType?: string;
  includeAgenda?: boolean;
  includeSummary?: boolean;
}) {
  const {
    prompt,
    extraData = "",
    numSlides,
    templateCategory = "auto",
    stylePreference = "professional",
    audienceType = "general",
    includeAgenda = true,
    includeSummary = true
  } = params;

  const systemPrompt = `You are a world-class, elite presentation structural architect and industry analyst.
Your job is to generate highly structured, deeply informative, cohesive, and content-rich slide contents in JSON format.
The current presentations have been criticized for looking too vague, thin, and empty. To fix this, you MUST pack every single slide (headers, descriptions, subtitles, bullet points, statistics) with dense, precise, highly professional, and informative factual data.

Strict Guidelines to absolutely avoid empty or vague slides:
1. NO VAGUE, REPETITIVE, OR LAZY BULLET POINTS: Every single bullet point must be a fully-formed, professional-grade narrative sentence (between 15 to 30 words). It must contain actual, domain-specific insights, concrete real-world examples, precise metrics/KPIs, frameworks, or actionable steps. Never output 2-5 word bullets.
2. SUBTITLES AND DESCRIPTION LINES ARE MANDATORY: Every slide (except section screens) MUST have a highly descriptive, context-setting, and elegant subtitle (between 8 and 18 words) that clarifies the narrative purpose of that slide. Do not leave the subtitle empty or use simple text like "Overview" or "Next steps".
3. DENSE PRESENTATION OUTLINE FLOW (exactly ${numSlides} slides):
   - First slide MUST be 'title' layout. Create a brilliant, industry-disrupting title and a comprehensive, detailed subtitle explaining the strategic lens of this deck.
   - If includeAgenda is true, include an 'agenda' layout slide next containing 4-5 key strategic focus areas with detailed summaries.
   - Standard 'content' slide layouts MUST have exactly 4 to 5 highly detailed, substantive bullet points, covering analytical takeaways.
   - 'two-column' slides MUST provide exactly 4 or 6 detailed bullets (where the first half correspond to Column 1, and the second half correspond to Column 2). For example, Column 1 details 2-3 specific entries, and Column 2 details 2-3 specific entries. Each entry must be fully explained.
   - 'stat' slides MUST emphasize concrete, shocking, or realistic high-impact metrics (e.g. '84.6% CARG Growth', '$14.2M Seed Injection', '4.8x Efficiency Yield'). Bullet 1 is the large metric itself. Bullet 2 is an extensive, multi-sentence analytical description (25 to 50 words) detailing the source, methodology, contextual impact, and operational meaning of that metric.
   - 'quote' slides MUST have exactly 2 bullets: Bullet 1 is an inspirational or highly authoritative industry quote (15 to 35 words). Bullet 2 is the full citation, including the full name, credential, and exact corporate or academic organization (e.g., 'Dr. Aris Vance, Chief AI Futurist at NeuralCore Labs').
   - 'timeline' slides MUST contain exactly 4 to 5 key chronologically progressive sequence bullets. Each chronological bullet point must start with an explicit phase/date prefix followed by a comprehensive milestone summary (e.g. 'Phase 1 (Q3): Full architectural blueprint rollout and cloud service staging...').
   - 'section' slides are strong transition slides. Subtitle must introduce the subsequent chapter beautifully.
   - The final slide MUST be a polished 'conclusion' layout containing 3-4 powerful forward-looking strategic action items.

4. ELITE STRATEGY TONE: Act as an expert consulting principal (e.g., McKinsey/Gartner style). Use precise industry terms, clear technical language, and deep insights. Make it read like a comprehensive executive brief.

Theme Auto-Detection Rules:
Read the prompt and auto-detect the best category of: 'business', 'technology', 'education', 'healthcare', 'marketing', 'finance', 'creative', 'general', 'cosmic', 'editorial', 'brutalist', 'charcoal', 'forest', 'neon', 'sunset', 'sand', 'royal', 'nord', 'ocean'.
If specified templateCategory is NOT 'auto', prioritize using that specified category instead.`;

  const instructionText = `Topic/Prompt: "${prompt}"
${extraData ? `Additional Context/Data:\n${extraData}\n` : ""}
Slide Count constraint: Generate exactly ${numSlides} slides.
Style Mode: ${stylePreference}
Target Audience: ${audienceType}
Agenda Slide requested: ${includeAgenda}
Summary/Conclusion Slide requested: ${includeSummary}
Theme Category Override: ${templateCategory === 'auto' ? 'Auto-detect' : templateCategory}

Task: Synthesize a highly-packed, content-rich, and rigorous slide deck of exactly ${numSlides} slides on this topic. 
Every slide must contain fully elaborated, informative sentences (15-30 words per bullet). Fill each slide with rich content, and leave NO block vague or empty.

Provide the response matching the specified JSON schema structure. Make sure all text boxes are deeply formulated.`;

  try {
    // Try Groq first since it is requested as a primary LLM service
    try {
      console.log("Attempting slide generation with Groq API (llama-3.3-70b-versatile)...");
      const groqResult = await queryGroq(instructionText, systemPrompt);
      if (groqResult && groqResult.title && Array.isArray(groqResult.slides)) {
        return groqResult;
      }
      throw new Error("Invalid structure returned from Groq API");
    } catch (groqError) {
      console.warn("Groq slide generation failed or unconfigured. Falling back to Gemini...", groqError);
      if (!ai) {
        throw new Error("Groq failed and Gemini API is not configured (missing key).");
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: instructionText,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Overarching beautiful title for the presentation structure" },
              themeCategory: {
                type: Type.STRING,
                description: "Assigned category based on auto-detection or override: 'business', 'technology', 'education', 'healthcare', 'marketing', 'finance', 'creative', 'general', 'cosmic', 'editorial', 'brutalist', 'charcoal', 'forest', 'neon', 'sunset', 'sand', 'royal', 'nord', 'ocean'"
              },
              slides: {
                type: Type.ARRAY,
                description: `List of exactly ${numSlides} slide objects.`,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: "Slide type layout: 'title', 'agenda', 'content', 'conclusion', 'section', 'two-column', 'stat', 'quote', 'timeline'"
                    },
                    title: { type: Type.STRING, description: "Clean title for this individual slide" },
                    subtitle: { type: Type.STRING, description: "A highly descriptive, mandatory subtitle line (8 to 18 words) highlighting background context" },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Highly polished, content-rich, fully-formed narrative sentences (15 to 30 words per bullet, 3 to 5 bullets, fully detail-rich to guarantee slides never look empty or vague)"
                    }
                  },
                  required: ["type", "title", "bullets"]
                }
              }
            },
            required: ["title", "themeCategory", "slides"]
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      return parsed;
    }
  } catch (error) {
    console.error("AI slide generation failed completely:", error);
    throw new Error("Unable to synthesize AI presentations. Please verify your prompt details or try again later.");
  }
}

export async function generateImageFromPrompt(prompt: string, aspectRatio: "1:1" | "4:3" | "16:9" | "9:16" = "1:1"): Promise<string> {
  if (!ai) {
    throw new Error("Gemini API key is required to use AI Image generation.");
  }

  try {
    console.log(`Generating custom image using gemini-2.5-flash-image for: "${prompt}"...`);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `High-quality professionally designed presentation slide asset, flat modern minimalistic icon/graphic, or clean illustration showing: ${prompt}. Studio lighting, clean clear background context, vector style rendering, ultra premium modern art outline. No chaotic realism or text logos.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const base64 = part.inlineData.data;
          return `data:image/png;base64,${base64}`;
        }
      }
    }
    throw new Error("No image data part was returned in the Gemini API response candidates.");
  } catch (err: any) {
    console.error("Gemini Image generation failed:", err);
    throw err;
  }
}

export async function generateSvgFromPrompt(prompt: string, title: string, colors: { primary: string; secondary: string; accent: string; text: string; heading: string; bg: string }): Promise<string> {
  const systemPrompt = `You are an expert vector graphics (SVG) architect. Your goal is to design clean, modern, minimalist standalone SVG vectors matching a presentation layout.`;
  const instructionText = `Generate a gorgeous standalone SVG vector graphic/illustration/icon representing the topic: "${prompt}" and slide title: "${title}".
We need to use these color themes of our presentation:
- Primary Color: ${colors.primary || '#000000'}
- Secondary Color: ${colors.secondary || '#666666'}
- Accent Highlight Color: ${colors.accent || '#4F46E5'}
- Text Color: ${colors.text || '#333333'}

Requirements:
1. Return ONLY raw executable SVG code starting with '<svg' and ending with '</svg>'.
2. Absolutely NO markdown block formatting (do not wrap with \`\`\`xml or \`\`\`svg), no surrounding text, no conversational explanations.
3. Ensure it has viewBox="0 0 200 200" and styles/colors match our presentation parameters.
4. Keep the outer background transparent or a subtle matching hue so it displays cleanly in a card container.`;

  try {
    if (ai) {
      console.log("Generating custom SVG illustration via Gemini 3.5 Flash...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: instructionText,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.5
        }
      });
      let text = response.text || "";
      text = text.replace(/```[a-z]*\s*/gi, '').replace(/```\s*$/g, '').trim();
      return text;
    }
    throw new Error("Gemini AI Client not initialized.");
  } catch (err) {
    console.warn("SVG prompt generation failed, using structured fallback graphic code block:", err);
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="10" y="10" width="180" height="180" rx="20" fill="${colors.primary}10" stroke="${colors.primary}" stroke-width="2" />
      <circle cx="100" cy="85" r="35" fill="${colors.accent}20" stroke="${colors.accent}" stroke-width="3" />
      <path d="M60 150 Q100 110 140 150" stroke="${colors.secondary}" stroke-width="3" fill="none" />
      <text x="100" y="180" font-family="sans-serif" font-size="10" font-weight="bold" fill="${colors.text}" text-anchor="middle">${title || 'Concept'}</text>
    </svg>`;
  }
}


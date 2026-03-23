import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface UIElement {
  type: string;
  label: string;
  position: string;
}

export const analyzeScreenshot = async (base64Image: string): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze the attached UI screenshot. List all elements (buttons, inputs, labels, navigation items) and describe their positions and hierarchy in detail. 
  Focus on layout integrity so we can recreate it. Output the analysis as a descriptive text.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image.split(",")[1] || base64Image,
            },
          },
        ],
      },
    ],
  });

  return response.text || "No analysis generated.";
};

export type DesignStyle = "mast" | "neumorphism" | "brutalism" | "cyberpunk" | "story" | "artist";

const getStylePrompt = (style: DesignStyle) => {
  switch (style) {
    case "neumorphism":
      return `Style: Neumorphism (Soft UI). Use soft, extruded elements that look like they're coming out of the background. Focus on subtle shadows (light and dark) to create depth. Use a monochromatic or very soft color palette (e.g., light grays, soft blues). Elements should look tactile and organic.`;
    case "brutalism":
      return `Style: Neo-Brutalism. Use bold, high-contrast colors (neon yellow, bright pink, electric blue). Incorporate thick black borders, hard shadows, and oversized typography. The design should feel raw, unpolished, and energetic. Use visible grids and asymmetrical layouts.`;
    case "cyberpunk":
      return `Style: Cyberpunk / Futuristic. Use a dark background with neon accents (cyan, magenta, lime). Incorporate glitch effects, digital HUD elements, and glowing borders. The design should feel high-tech, immersive, and atmospheric. Use monospace fonts for data elements.`;
    case "story":
      return `Style: Storytelling / Editorial. Use immersive, narrative-driven layouts. Incorporate large, elegant serif typography, generous whitespace, and cinematic imagery. The design should feel like a high-end digital magazine or an interactive story. Use smooth parallax effects and subtle animations in the visual representation.`;
    case "artist":
      return `Style: Creative Artist / Portfolio. Use expressive, unconventional layouts. Incorporate abstract shapes, hand-drawn elements, and bold, artistic color palettes. The design should feel like a piece of digital art itself. Focus on unique transitions and creative placements of UI elements that break the standard grid.`;
    case "mast":
    default:
      return `Style: Use a mix of Glassmorphism and Minimalist trends. Incorporate smooth gradients, soft shadows (depth), and vibrant but professional color palettes. The design should feel buttery smooth, futuristic, and highly polished.`;
  }
};

export const generateMastDesign = async (analysis: string, style: DesignStyle = "mast"): Promise<string> => {
  const model = "gemini-3.1-flash-image-preview";
  
  const styleDescription = getStylePrompt(style);

  const masterPrompt = `
    Role: You are a World-Class UI/UX Designer and Digital Artist with expertise in modern aesthetics and fluid interfaces.
    Task: Based on the following UI element analysis, create a premium, creative, and professional version of this interface.
    
    Analysis of original elements:
    ${analysis}
    
    Core Guidelines:
    1. Layout Integrity: Maintain the original placement of buttons, text, and navigation, but elevate their visual appeal.
    2. ${styleDescription}
    3. Typography: Use high-end, modern fonts (Sans-Serif or Mono depending on style) with perfect hierarchy and spacing.
    4. Visual Elements: Add high-quality icons or abstract artistic elements inspired by the original context to make it look "Artist-Level."
    5. Feel: The final design must be high-resolution, pixel-perfect, and visually stunning.
    
    Constraint: Output should be a high-resolution, pixel-perfect UI mockup. No wireframes, only the final finished masterpiece.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: masterPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1", // Defaulting to 1:1 for now, could be 16:9 if needed
        imageSize: "1K",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image.");
};

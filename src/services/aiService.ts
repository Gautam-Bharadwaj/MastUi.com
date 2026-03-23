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

export const generateMastDesign = async (analysis: string): Promise<string> => {
  const model = "gemini-3.1-flash-image-preview";
  
  const masterPrompt = `
    Role: You are a World-Class UI/UX Designer and Digital Artist with expertise in modern aesthetics and fluid interfaces.
    Task: Based on the following UI element analysis, create a premium, creative, and "Mast" version of this interface.
    
    Analysis of original elements:
    ${analysis}
    
    Core Guidelines:
    1. Layout Integrity: Maintain the original placement of buttons, text, and navigation, but elevate their visual appeal.
    2. Style: Use a mix of Glassmorphism and Minimalist trends. Incorporate smooth gradients, soft shadows (depth), and vibrant but professional color palettes.
    3. Typography: Use high-end, modern Sans-Serif fonts with perfect hierarchy and spacing.
    4. Visual Elements: Add high-quality 3D icons or abstract artistic elements inspired by the original context to make it look "Artist-Level."
    5. Feel: The final design must feel buttery smooth, futuristic, and highly polished.
    
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

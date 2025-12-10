import { GoogleGenAI } from "@google/genai";
import { Character } from "../types";

export const checkApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio;
  if (aistudio && aistudio.hasSelectedApiKey) {
    return await aistudio.hasSelectedApiKey();
  }
  return false;
};

export const promptForApiKey = async (): Promise<void> => {
  const aistudio = (window as any).aistudio;
  if (aistudio && aistudio.openSelectKey) {
    await aistudio.openSelectKey();
  }
};

export const generateImageWithGemini = async (
  prompt: string,
  characters: Character[],
  aspectRatio: string,
  customAspectRatio: string
): Promise<string> => {
  // Always instantiate a new client to ensure fresh API key usage if changed
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const parts: any[] = [];

  // 1. Add Reference Images
  characters.forEach((char) => {
    if (char.selected && char.base64 && char.mimeType) {
      parts.push({
        inlineData: {
          data: char.base64,
          mimeType: char.mimeType,
        },
      });
      parts.push({
        text: `Reference image for character named "${char.name}". Maintain the appearance of this character.`,
      });
    }
  });

  // 2. Add the main prompt and custom AR instruction if needed
  let fullPrompt = prompt;
  if (aspectRatio === 'Custom') {
    fullPrompt += ` (Aspect Ratio: ${customAspectRatio})`;
  }
  parts.push({ text: fullPrompt });

  // 3. Map Aspect Ratio to API supported values
  // 'gemini-3-pro-image-preview' supports: "1:1", "3:4", "4:3", "9:16", "16:9"
  let apiAspectRatio = aspectRatio;
  if (aspectRatio === 'Custom') {
    apiAspectRatio = '1:1'; // Default fallback for custom, as API is strict
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          imageSize: '4K',
          aspectRatio: apiAspectRatio as any, // Cast to any to satisfy specific enum types if strict
        },
      },
    });

    // Extract image
    const responseParts = response.candidates?.[0]?.content?.parts;
    if (responseParts) {
      for (const part of responseParts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // Handle the specific error for missing key to prompt user
    if (error.message && error.message.includes("Requested entity was not found")) {
        throw new Error("API_KEY_MISSING");
    }
    throw error;
  }
};
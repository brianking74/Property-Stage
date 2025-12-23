
import { GoogleGenAI } from "@google/genai";

/**
 * Transforms a property image using Gemini 3 Pro Vision model.
 * Handles the "API Key selection" requirement for high-quality models.
 */
export const transformPropertyImage = async (
  base64Image: string,
  prompt: string,
  aspectRatio: string = '4:3',
  roomType: string = 'Living Room',
  modelName: string = 'gemini-3-pro-image-preview',
  imageSize: string = '1K'
): Promise<string | null> => {
  try {
    // ALWAYS get the key right before the call to handle dynamic injection
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        // If key is missing but bridge is present, prompt selection
        await aistudio.openSelectKey();
        throw new Error("API Key was missing. I've opened the selection dialog—please select a key and try again.");
      }
      throw new Error("API Configuration Error: API_KEY not found in environment.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/jpeg',
            },
          },
          {
            text: `Role: Expert AI Real Estate Stager & Interior Designer.
Context: This is a ${roomType}.
Task: ${prompt}

CRITICAL EXECUTION RULES:
1. SPATIAL ACCURACY: Do not move walls, windows, doors, or architectural features. The room layout must remain 100% identical to the input.
2. FURNITURE SCALE: Ensure furniture is realistically scaled for a ${roomType}.
3. LIGHTING: Synthesize shadows and highlights that match the existing light sources (windows/lamps) in the original photo.
4. QUALITY: Deliver a photorealistic, high-end real estate marketing photo.

Output: One single transformed image.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: imageSize,
        }
      }
    });

    const candidate = response.candidates?.[0];

    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("The AI model returned text instead of an image. Please try a different style.");

  } catch (error: any) {
    console.error("Gemini Staging Error:", error);
    
    // Per documentation: "If the request fails with an error message containing 'Requested entity was not found.', 
    // reset the key selection state and prompt the user to select a key again via openSelectKey()."
    if (error.message?.includes("Requested entity was not found") || error.message?.includes("API key not valid")) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        throw new Error("Your API Key session has expired or is invalid. Please select a valid key from the dialog.");
      }
    }
    
    throw error;
  }
};

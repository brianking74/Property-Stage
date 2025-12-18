
import { GoogleGenAI } from "@google/genai";

export const transformPropertyImage = async (
  base64Image: string,
  prompt: string,
  aspectRatio: string = '4:3',
  roomType: string = 'Living Room',
  modelName: string = 'gemini-3-pro-image-preview',
  imageSize: string = '1K'
): Promise<string | null> => {
  try {
    // Guidelines: Create a new instance right before making an API call to ensure it uses the latest key
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please select a valid API key via the setup dialog.");
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

    throw new Error("No image data found in response");

  } catch (error: any) {
    console.error("Error transforming image:", error);
    // Guidelines: If requested entity not found, reset key state
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API Key invalid or not found. Please re-select your key.");
    }
    throw error;
  }
};

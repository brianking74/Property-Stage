import { GoogleGenAI } from "@google/genai";

export const transformPropertyImage = async (
  base64Image: string,
  prompt: string,
  aspectRatio: string = '4:3',
  modelName: string = 'gemini-3-pro-image-preview'
): Promise<string | null> => {
  try {
    // Initialize inside the function to ensure we capture the latest process.env.API_KEY
    // after the user performs the key selection flow.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Clean base64 string if it contains headers
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
            text: `Role: Professional Real Estate Photographer & Interior Designer.
Task: ${prompt}
STRICT IMAGE EDITING INSTRUCTIONS:
1. OUTPUT GEOMETRY MUST MATCH INPUT: You are editing the existing room, not generating a new one. The walls, ceiling, floor, windows, and doors must be in the EXACT same position and perspective as the input image.
2. DO NOT CROP OR ZOOM: The field of view must be identical to the provided image.
3. PRESERVE STRUCTURAL DETAILS: Keep original architectural features (moldings, window frames, door handles) intact unless specifically asked to renovate them.
4. LIGHTING CONSISTENCY: Maintain the direction and quality of natural light from the windows.
5. REALISM: Output must be photorealistic 4k quality.
Return ONLY the transformed image data.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    const candidate = response.candidates?.[0];

    // Check if the model explicitly stopped due to safety or other reasons
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      // If there is no content parts, it's a hard block
      if (!candidate.content?.parts?.length) {
         throw new Error(`Generation failed. The model stopped due to: ${candidate.finishReason}. This often happens if the image contains people or sensitive content.`);
      }
    }

    // Check for inline data (image response)
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
      
      // If we are here, we might have gotten text back instead of an image
      const textPart = candidate.content.parts.find(p => p.text);
      if (textPart?.text) {
        // Sometimes the model refuses and explains why in text
        throw new Error(`Model returned text instead of image: "${textPart.text.substring(0, 100)}..."`);
      }
    }

    console.warn("No image data found in response");
    throw new Error("The AI generation completed but returned no image data. Please try again.");

  } catch (error: any) {
    console.error("Error transforming image:", error);
    
    // Transform common SDK/API errors into user-friendly messages
    const errString = error.toString();
    if (errString.includes("403") || errString.includes("permission denied")) {
        throw new Error("Permission denied. Please check your API key.");
    }
    if (errString.includes("429") || errString.includes("quota")) {
        throw new Error("System is busy (Rate Limit). Please wait a minute before trying again.");
    }
    if (errString.includes("503") || errString.includes("overloaded")) {
        throw new Error("AI Service is currently overloaded. Please try again in a moment.");
    }
    
    throw error;
  }
};
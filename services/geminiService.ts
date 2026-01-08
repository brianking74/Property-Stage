
import { GoogleGenAI } from "@google/genai";

/**
 * Transforms a property image using either Standard (Flash) or Premium (Pro) models.
 * Standard (1K) uses gemini-2.5-flash-image.
 * Premium (2K/4K) uses gemini-3-pro-image-preview.
 */
export const transformPropertyImage = async (
  base64Image: string,
  prompt: string,
  aspectRatio: string = '4:3',
  roomType: string = 'Living Room',
  modelName: string = 'gemini-2.5-flash-image',
  imageSize: string = '1K'
): Promise<string | null> => {
  try {
    const isProModel = modelName.includes('pro');
    
    // Check key right before initialization
    let apiKey = process.env.API_KEY;
    
    // If key is missing, attempt to trigger the selector automatically
    if (!apiKey) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        throw new Error("AI Activation Required: Please select your Google AI API key from the dialog.");
      }
      throw new Error("Missing API Key: Access to the Google AI Studio bridge is required. Please open this app within AI Studio.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const refinedPrompt = `
      CRITICAL ROLE: You are a Professional Architectural Photo Compositor.
      
      CORE DIRECTIVE: You MUST NOT change the room's physical structure. The input photo is a MASTER TEMPLATE.
      
      STAGE 1: ARCHITECTURAL CLONING (ZERO DRIFT)
      - Identify all walls, ceilings, windows, and structural pillars.
      - CLONE these pixels exactly. The position, thickness, and boundary of every wall must be PIXEL-PERFECT to the source.
      - NEVER modify the windows. The frames, glass, and skyline view must remain 100% UNCHANGED.
      
      STAGE 2: CHROMA-LOCK (NO COLOR SHIFT)
      - Extract the exact color and texture of the ceiling and walls from the source. Do NOT repaint them.
      
      STAGE 3: ADDITIVE VIRTUAL STAGING
      - ONLY add furniture and decor in the style: ${prompt}.
      - Enhance image clarity and sharpness.
      
      ROOM CONTEXT: ${roomType}
      USER REQUEST: ${prompt}
      
      Output ONLY the final, high-fidelity composited image.
    `.trim();

    // Prepare config. Standard model (Flash) doesn't support imageSize param.
    const generationConfig: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    };

    if (isProModel) {
      generationConfig.imageConfig.imageSize = imageSize;
    }

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
            text: refinedPrompt,
          },
        ],
      },
      config: generationConfig
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("The AI engine failed to return an image. Please try again with a simpler request.");

  } catch (error: any) {
    console.error("Gemini Staging Error:", error);
    
    // Specifically handle common bridge/auth errors by triggering the key picker again
    if (
      error.message?.includes("Requested entity was not found") || 
      error.message?.includes("API key not valid") ||
      error.message?.includes("403") ||
      error.message?.includes("401")
    ) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        throw new Error("Your session expired. Please re-select your Google AI API key to continue.");
      }
    }
    throw error;
  }
};

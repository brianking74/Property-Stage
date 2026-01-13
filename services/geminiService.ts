
import { GoogleGenAI } from "@google/genai";

/**
 * Transforms a property image using either Standard (Flash) or Premium (Pro) models.
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
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        // Automatically try to open the key selector instead of failing with a technical message
        await aistudio.openSelectKey();
        throw new Error("Finalizing secure connection... Please confirm the request in the dialog and click Generate again.");
      }
      throw new Error("Unable to start the staging process. Please ensure the app is properly connected to the service.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const refinedPrompt = `
      CRITICAL ROLE: You are a Professional Architectural Photo Compositor.
      CORE DIRECTIVE: You MUST NOT change the room's physical structure. The input photo is a MASTER TEMPLATE.
      STAGE 1: ARCHITECTURAL CLONING (ZERO DRIFT) - Identify all walls, ceilings, windows, and structural pillars. CLONE these pixels exactly.
      STAGE 2: CHROMA-LOCK (NO COLOR SHIFT) - Keep wall and ceiling colors 100% UNCHANGED.
      STAGE 3: ADDITIVE VIRTUAL STAGING - ONLY add furniture and decor in style: ${prompt}.
      ROOM CONTEXT: ${roomType}
      USER REQUEST: ${prompt}
      Output ONLY the final image.
    `.trim();

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

    throw new Error("The process failed to generate a result. Please try again.");
  } catch (error: any) {
    console.error("Staging Error:", error);
    // If it's an auth error, trigger the key picker silently
    if (error.message?.includes("403") || error.message?.includes("401") || error.message?.includes("entity was not found")) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        throw new Error("Connection refresh required. Please try clicking Generate again.");
      }
    }
    throw error;
  }
};

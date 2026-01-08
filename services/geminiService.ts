
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
    
    // Check if key is available in environment
    let apiKey = process.env.API_KEY;
    
    // If key is missing, try to pop the bridge selector immediately
    if (!apiKey) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        // Pop the bridge selector
        await aistudio.openSelectKey();
        // Bridge race condition mitigation: we prompt the user to try again
        throw new Error("AI Activation: Please select your API Key in the window that just opened, then click 'Generate' again.");
      }
      throw new Error("The AI Engine is currently disconnected. Please refresh the page within Google AI Studio.");
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
    
    // Automatic recovery for bridge/auth errors
    if (
      error.message?.includes("Requested entity was not found") || 
      error.message?.includes("API key not valid") ||
      error.message?.includes("403") ||
      error.message?.includes("401")
    ) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        throw new Error("Your AI session timed out. Please select your API Key again in the picker that appeared.");
      }
    }
    throw error;
  }
};

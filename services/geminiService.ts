
import { GoogleGenAI } from "@google/genai";

/**
 * Transforms a property image using Gemini 3 Pro Vision model.
 * Strictly enforces structural preservation of the room architecture and surface aesthetics.
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
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        throw new Error("Setting up AI engine. Please select your API key and try again.");
      }
      throw new Error("Missing API Key. Please link your Google AI account in settings.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    /**
     * ZERO-HALLUCINATION COMPOSITING PROTOCOL (ZHCP) - VERSION 4.0
     * This prompt forces a two-stage conceptual process within the generation:
     * 1. CLONE ARCHITECTURE (Walls, Windows, Ceilings, View)
     * 2. ADD STAGING (Furniture, Decor)
     */
    const refinedPrompt = `
      CRITICAL ROLE: You are a Professional Architectural Photo Compositor.
      
      CORE DIRECTIVE: You MUST NOT change the room's physical structure. The input photo is a MASTER TEMPLATE.
      
      STAGE 1: ARCHITECTURAL CLONING (ZERO DRIFT)
      - Identify all walls, ceilings, windows, and structural pillars.
      - CLONE these pixels exactly. The position, thickness, and boundary of every wall must be PIXEL-PERFECT to the source.
      - NEVER add new walls. If a space is open in the source, it MUST remain open.
      - NEVER modify the windows. The frames, glass, and skyline view must remain 100% UNCHANGED.
      
      STAGE 2: CHROMA-LOCK (NO COLOR SHIFT)
      - Extract the exact color and texture of the ceiling and walls from the source.
      - Do NOT repaint them. White ceilings MUST stay the same shade of white. 
      - Do NOT allow lighting to "tint" or "wash out" the original surface colors.
      
      STAGE 3: ADDITIVE VIRTUAL STAGING
      - ONLY add furniture and decor in the style: ${prompt}.
      - These items must be placed ON TOP of the original floor.
      - Shadows from new furniture must be cast onto the ORIGINAL floor surface.
      - Enhance image clarity and sharpness, but do not re-render the background elements.
      
      ROOM CONTEXT: ${roomType}
      USER REQUEST: ${prompt}
      
      STRICT FAILURE CONDITIONS:
      - Any change to the window-to-wall ratio.
      - Addition of a wall that wasn't there.
      - Shifting the ceiling color to a different hue or value.
      
      Output ONLY the final, high-fidelity composited image.
    `.trim();

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
        if (part.inlineData?.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("The AI engine failed to maintain structural integrity. Retrying with stricter constraints is recommended.");

  } catch (error: any) {
    console.error("Gemini Staging Error:", error);
    if (
      error.message?.includes("Requested entity was not found") || 
      error.message?.includes("API key not valid")
    ) {
      const aistudio = (window as any).aistudio;
      if (aistudio) {
        await aistudio.openSelectKey();
        throw new Error("Your API Key is invalid. Please select a valid key.");
      }
    }
    throw error;
  }
};

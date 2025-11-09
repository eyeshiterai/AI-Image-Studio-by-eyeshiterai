import { GoogleGenAI, Modality } from "@google/genai";
import { AspectRatio, ImageData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (
    prompt: string, 
    aspectRatio: AspectRatio, 
    numberOfImages: number,
    referenceImages?: ImageData[]
): Promise<string[]> => {
    try {
        if (referenceImages && referenceImages.length > 0) {
            // Use gemini-2.5-flash-image for multimodal generation.
            // This model is optimized for generating a single image from combined text and image prompts.
            const imageParts = referenceImages.map(image => ({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType,
                },
            }));

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        ...imageParts,
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    // Return an array with the single generated image
                    return [`data:${mimeType};base64,${base64ImageBytes}`];
                }
            }
            throw new Error("No image was generated from the reference.");

        } else {
            // Use imagen-4.0 for high-quality text-to-image generation
            if (numberOfImages < 1 || numberOfImages > 8) {
                throw new Error("Number of images must be between 1 and 8.");
            }

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt,
                config: {
                    numberOfImages,
                    outputMimeType: 'image/jpeg',
                    aspectRatio,
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                return response.generatedImages.map(image => `data:image/jpeg;base64,${image.image.imageBytes}`);
            }
            throw new Error("No images were generated.");
        }
    } catch (error) {
        console.error("Error generating images:", error);
        throw new Error(error instanceof Error ? error.message : "Failed to generate images. Please check your prompt and try again.");
    }
};

export const editImage = async (prompt: string, imageData: ImageData): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageData.base64,
                            mimeType: imageData.mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No edited image was returned.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. Please try again.");
    }
};
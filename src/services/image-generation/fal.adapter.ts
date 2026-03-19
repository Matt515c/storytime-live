import type { ImageGenerationAdapter } from './image-generation.interface';
import type { ImageGenerationRequest, ImageResult } from './types';

export function createFalAdapter(apiKey: string): ImageGenerationAdapter {
  const generate = async (request: ImageGenerationRequest): Promise<ImageResult> => {
    const startTime = performance.now();

    const body: Record<string, unknown> = {
      prompt: request.prompt,
      image_size: {
        width: request.width ?? 1024,
        height: request.height ?? 1024,
      },
      num_images: 1,
      enable_safety_checker: true,
    };

    if (request.referenceImageUrl) {
      body.image_url = request.referenceImageUrl;
    }

    const response = await fetch(
      'https://fal.run/fal-ai/flux/schnell',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`fal.ai API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      images: Array<{ url: string }>;
    };

    const durationMs = performance.now() - startTime;

    if (!data.images?.[0]?.url) {
      throw new Error('No image returned from fal.ai');
    }

    console.info(`[ImageGen] Generated in ${durationMs.toFixed(0)}ms`);

    return {
      url: data.images[0].url,
      durationMs,
    };
  };

  return { generate };
}

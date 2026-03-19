import type { ImageGenerationAdapter } from './image-generation.interface';
import type { ImageGenerationRequest, ImageResult } from './types';

export function createReplicateAdapter(apiToken: string): ImageGenerationAdapter {
  const generate = async (request: ImageGenerationRequest): Promise<ImageResult> => {
    const startTime = performance.now();

    const input: Record<string, unknown> = {
      prompt: request.prompt,
      aspect_ratio: '1:1',
    };

    if (request.referenceImageUrl) {
      input.image_url = request.referenceImageUrl;
    }

    const response = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
          Prefer: 'wait',
        },
        body: JSON.stringify({ input }),
      },
    );

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      output: string | string[] | null;
      status: string;
      error: string | null;
    };

    if (data.error) {
      throw new Error(`Replicate prediction error: ${data.error}`);
    }

    const outputUrl = Array.isArray(data.output) ? data.output[0] : data.output;

    if (!outputUrl) {
      throw new Error('No image returned from Replicate');
    }

    const durationMs = performance.now() - startTime;
    console.info(`[ImageGen:Replicate] Generated in ${durationMs.toFixed(0)}ms`);

    return {
      url: outputUrl,
      durationMs,
    };
  };

  return { generate };
}

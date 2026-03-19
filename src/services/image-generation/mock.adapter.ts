import type { ImageGenerationAdapter } from './image-generation.interface';
import type { ImageGenerationRequest, ImageResult } from './types';

interface MockImageAdapterOptions {
  delayMs?: number;
  imageUrl?: string;
}

export function createMockImageAdapter(
  options: MockImageAdapterOptions = {},
): ImageGenerationAdapter {
  const { delayMs = 100, imageUrl = 'https://placeholder.test/image.png' } = options;
  let generateCount = 0;

  const generate = async (_request: ImageGenerationRequest): Promise<ImageResult> => {
    generateCount++;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return {
      url: `${imageUrl}?n=${generateCount}`,
      durationMs: delayMs,
    };
  };

  return { generate };
}

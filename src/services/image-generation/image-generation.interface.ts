import type { ImageGenerationRequest, ImageResult } from './types';

export interface ImageGenerationAdapter {
  generate: (request: ImageGenerationRequest) => Promise<ImageResult>;
}

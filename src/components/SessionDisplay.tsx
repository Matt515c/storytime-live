'use client';

import Image from 'next/image';

interface SessionDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
}

export function SessionDisplay({ imageUrl, isLoading }: SessionDisplayProps): React.ReactElement {
  if (!imageUrl) {
    return (
      <div
        data-testid="session-display-empty"
        className="relative h-screen w-screen bg-black"
        aria-label="Waiting for story to begin"
      />
    );
  }

  return (
    <div data-testid="session-display" className="relative h-screen w-screen bg-black">
      <Image
        src={imageUrl}
        alt="Story scene"
        fill
        className={`object-contain transition-opacity duration-500 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority
        sizes="100vw"
      />
    </div>
  );
}

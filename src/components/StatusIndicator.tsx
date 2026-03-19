'use client';

import type { SessionStatus } from '@/types/session';

interface StatusIndicatorProps {
  status: SessionStatus;
}

const STATUS_CONFIG: Record<SessionStatus, { color: string; label: string; pulse: boolean }> = {
  idle: { color: 'bg-gray-400', label: 'Idle', pulse: false },
  listening: { color: 'bg-green-500', label: 'Listening', pulse: true },
  processing: { color: 'bg-yellow-500', label: 'Processing', pulse: false },
  generating: { color: 'bg-blue-500', label: 'Generating', pulse: false },
};

export function StatusIndicator({ status }: StatusIndicatorProps): React.ReactElement {
  const config = STATUS_CONFIG[status];

  return (
    <div data-testid="status-indicator" className="flex items-center gap-2">
      <span
        data-testid="status-dot"
        className={`inline-block h-3 w-3 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}
      />
      <span className="text-sm text-white">{config.label}</span>
    </div>
  );
}

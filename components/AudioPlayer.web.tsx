import React from 'react';

export function AudioPlayer({ audioUrl }: { audioUrl: string; [key: string]: unknown }) {
  return <audio aria-label="Stage audio" controls preload="metadata" src={audioUrl} style={{ width: '100%' }} />;
}

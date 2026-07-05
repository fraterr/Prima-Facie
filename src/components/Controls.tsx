import React from 'react';

interface ControlsProps {
  isPlaying: boolean;
  currentIndex: number;
  totalWords: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (index: number) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  currentIndex,
  totalWords,
  onPlay,
  onPause,
  onStop,
  onSeek
}) => {
  return (
    <div className="glass-panel controls-container">
      <div className="playback-controls">
        <button 
          className="btn" 
          onClick={onStop}
          disabled={totalWords === 0}
          title="Stop reading and reset to beginning"
        >
          Stop
        </button>
        {isPlaying ? (
          <button className="btn btn-primary" onClick={onPause} title="Pause (Space)">
            Pause
          </button>
        ) : (
          <button 
            className="btn btn-primary" 
            onClick={onPlay}
            disabled={totalWords === 0 || currentIndex >= totalWords}
            title="Play (Space)"
          >
            Play
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {currentIndex}
        </span>
        <input 
          type="range" 
          className="timeline"
          min={0}
          max={Math.max(0, totalWords - 1)}
          value={currentIndex}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={totalWords === 0}
        />
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {totalWords}
        </span>
      </div>
    </div>
  );
};

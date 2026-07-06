import React from 'react';

interface ControlsProps {
  isPlaying: boolean;
  currentIndex: number;
  totalWords: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (index: number) => void;
  onBookmark: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  currentIndex,
  totalWords,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onBookmark
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
        <input 
          type="number"
          value={currentIndex}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val)) {
              onSeek(Math.min(Math.max(0, val), totalWords > 0 ? totalWords - 1 : 0));
            }
          }}
          style={{ 
            width: '60px', 
            fontSize: '0.875rem', 
            color: 'var(--text-color, #fff)',
            background: 'transparent',
            border: '1px solid var(--border-color, #333)',
            borderRadius: '4px',
            padding: '2px 4px',
            textAlign: 'center'
          }}
          disabled={totalWords === 0}
        />
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
        <button 
          className="btn"
          style={{ padding: '0.4rem 0.6rem', fontSize: '1.2rem', border: 'none', background: 'transparent' }}
          onClick={onBookmark}
          disabled={totalWords === 0}
          title="Add/Remove Bookmark (B)"
        >
          🔖
        </button>
      </div>
    </div>
  );
};

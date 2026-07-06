import React, { useState, useEffect, useRef } from 'react';

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
  const [localIndex, setLocalIndex] = useState(String(currentIndex));
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local value from currentIndex when the user is NOT editing
  useEffect(() => {
    if (!isEditing) {
      setLocalIndex(String(currentIndex));
    }
  }, [currentIndex, isEditing]);

  const applyValue = () => {
    const val = parseInt(localIndex, 10);
    if (!isNaN(val) && totalWords > 0) {
      const clamped = Math.min(Math.max(0, val), totalWords - 1);
      onSeek(clamped);
      setLocalIndex(String(clamped));
    } else {
      setLocalIndex(String(currentIndex));
    }
    setIsEditing(false);
  };

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
          ref={inputRef}
          type="number"
          value={localIndex}
          onFocus={() => {
            setIsEditing(true);
            // Select all text on focus for easy overwrite
            setTimeout(() => inputRef.current?.select(), 0);
          }}
          onChange={(e) => setLocalIndex(e.target.value)}
          onBlur={applyValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              applyValue();
              inputRef.current?.blur();
            }
          }}
          min={0}
          max={totalWords > 0 ? totalWords - 1 : 0}
          style={{ 
            width: '70px', 
            fontSize: '0.875rem', 
            color: 'var(--text-color, #fff)',
            background: isEditing ? 'rgba(255,255,255,0.1)' : 'transparent',
            border: '1px solid var(--border-color, #333)',
            borderRadius: '4px',
            padding: '4px 6px',
            textAlign: 'center',
            outline: 'none',
            transition: 'background 0.2s'
          }}
          disabled={totalWords === 0}
          title="Type a word number and press Enter to jump"
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

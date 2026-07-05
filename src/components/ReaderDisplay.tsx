import React from 'react';
import { calculateORP } from '../utils/orp';

interface ReaderDisplayProps {
  words: string[];
  fontSize?: number;
}

export const ReaderDisplay: React.FC<ReaderDisplayProps> = ({ words, fontSize }) => {
  if (!words || words.length === 0) {
    return (
      <div className="glass-panel reader-container">
        <div className="word-display" style={{ color: 'var(--text-muted)' }}>Ready</div>
      </div>
    );
  }

  return (
    <div className="glass-panel reader-container">
      <div 
        className="word-display" 
        style={{ 
          display: 'flex', 
          gap: '0.4em', 
          justifyContent: 'center', 
          flexWrap: 'wrap',
          fontSize: fontSize ? `${fontSize}rem` : undefined 
        }}
      >
        {words.map((word, idx) => {
          const orpIndex = calculateORP(word);
          const before = word.slice(0, orpIndex);
          const orpChar = word.charAt(orpIndex);
          const after = word.slice(orpIndex + 1);

          return (
            <span key={idx}>
              <span>{before}</span>
              <span className="orp-char">{orpChar}</span>
              <span>{after}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

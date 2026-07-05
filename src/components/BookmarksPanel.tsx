import React from 'react';

interface BookmarksPanelProps {
  bookmarks: number[];
  words: string[];
  onSeek: (index: number) => void;
  onRemove: (index: number) => void;
}

export const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ bookmarks, words, onSeek, onRemove }) => {
  if (bookmarks.length === 0) return null;

  return (
    <div className="glass-panel" style={{ marginTop: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Bookmarks
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {bookmarks.map((index) => {
          // Create a small snippet of text for the bookmark
          const snippetStart = Math.max(0, index - 3);
          const snippetEnd = Math.min(words.length, index + 6);
          const snippet = words.slice(snippetStart, snippetEnd).join(' ') + '...';

          return (
            <div 
              key={index}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                background: 'var(--surface-border)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => onSeek(index)}
              title={`Jump to word ${index}`}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', overflow: 'hidden' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 600 }}>
                  Word {index}
                </span>
                <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {snippet}
                </span>
              </div>
              <button 
                className="page-nav-btn" 
                style={{ width: '28px', height: '28px', flexShrink: 0, fontSize: '0.7rem' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                title="Remove Bookmark"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

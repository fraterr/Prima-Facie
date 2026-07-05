import React, { useRef, useEffect, useState } from 'react';
import type { AnnotatedSection } from '../utils/parser';

interface PageViewProps {
  sections: AnnotatedSection[];
  currentIndex: number;
  onSeek: (index: number) => void;
}

export const PageView: React.FC<PageViewProps> = ({ sections, currentIndex, onSeek }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const prevActiveRef = useRef<Element | null>(null);

  // Determine which section contains the current word
  const autoSectionIdx = sections.findIndex(
    s => currentIndex >= s.wordStart && currentIndex <= s.wordEnd
  );

  // Manual section navigation (auto-follows reading position)
  const [manualSection, setManualSection] = useState<number | null>(null);

  // Auto-follow: reset manual override when reading progresses into a new section
  useEffect(() => {
    if (autoSectionIdx >= 0) {
      setManualSection(null);
    }
  }, [autoSectionIdx]);

  const viewingIdx = manualSection ?? (autoSectionIdx >= 0 ? autoSectionIdx : 0);
  const section = sections[viewingIdx];

  // Highlight current word and scroll it into view
  useEffect(() => {
    const container = bodyRef.current;
    if (!container || !section) return;

    // Remove previous highlight
    if (prevActiveRef.current) {
      prevActiveRef.current.classList.remove('w--active');
      prevActiveRef.current = null;
    }

    // Find the current word span
    const activeSpan = container.querySelector(`[data-wi="${currentIndex}"]`);
    if (activeSpan) {
      activeSpan.classList.add('w--active');
      activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
      prevActiveRef.current = activeSpan;
    }

    // Update past/future word styling via a CSS class on the container
    container.dataset.currentWi = String(currentIndex);
  }, [currentIndex, viewingIdx, section]);

  // Handle click on a word span
  const handleClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('.w');
    if (target && target instanceof HTMLElement && target.dataset.wi) {
      const wordIdx = parseInt(target.dataset.wi, 10);
      if (!isNaN(wordIdx)) {
        onSeek(wordIdx);
      }
    }
  };

  const goToSection = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, sections.length - 1));
    setManualSection(clamped);
    // Also seek to the start of that section
    onSeek(sections[clamped].wordStart);
  };

  if (!section) {
    return (
      <div className="glass-panel page-view-panel">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
          No content to display.
        </p>
      </div>
    );
  }

  // Calculate estimated pages (assuming ~250 words per page for standard book layout)
  const totalWords = sections.length > 0 ? sections[sections.length - 1].wordEnd + 1 : 0;
  const currentEstPage = Math.floor(currentIndex / 250) + 1;
  const totalEstPages = Math.ceil(totalWords / 250);

  return (
    <div className="glass-panel page-view-panel">
      {/* Section navigation header */}
      <div className="page-view-header">
        <button
          className="page-nav-btn"
          onClick={() => goToSection(viewingIdx - 1)}
          disabled={viewingIdx === 0}
          title="Previous Chapter"
        >
          ◀
        </button>
        <div className="page-header-info">
          <span className="page-section-title">{section.title !== 'Document' && section.title ? section.title : `Chapter ${viewingIdx + 1}`}</span>
          <span className="page-indicator">
            Chapter {viewingIdx + 1} of {sections.length}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Est. Page: {currentEstPage} of {totalEstPages}
          </span>
        </div>
        <button
          className="page-nav-btn"
          onClick={() => goToSection(viewingIdx + 1)}
          disabled={viewingIdx >= sections.length - 1}
          title="Next Chapter"
        >
          ▶
        </button>
      </div>

      {/* Rendered formatted HTML content */}
      <div
        className="page-view-body epub-content"
        ref={bodyRef}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: section.html }}
      />
    </div>
  );
};

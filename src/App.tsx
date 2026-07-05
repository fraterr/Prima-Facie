import { useState, useEffect } from 'react';
import { useSpeedReader } from './hooks/useSpeedReader';
import { ReaderDisplay } from './components/ReaderDisplay';
import { Controls } from './components/Controls';
import { SettingsPanel } from './components/SettingsPanel';
import { FileUploader } from './components/FileUploader';
import { PageView } from './components/PageView';
import { BookmarksPanel } from './components/BookmarksPanel';

function App() {
  const {
    words,
    sections,
    bookmarks,
    currentIndex,
    isPlaying,
    settings,
    loadDocument,
    clearDocument,
    play,
    pause,
    togglePlay,
    seek,
    seekRelative,
    toggleBookmark,
    stop,
    updateSetting
  } = useSpeedReader();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (words.length === 0) return;

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyB':
          toggleBookmark();
          break;
        case 'ArrowLeft':
          seekRelative(-10);
          break;
        case 'ArrowRight':
          seekRelative(10);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [words.length, togglePlay, toggleBookmark, seekRelative]);


  const hasText = words.length > 0;
  const currentWords = hasText 
    ? words.slice(currentIndex, currentIndex + settings.chunkSize) 
    : [];

  return (
    <>
      <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <svg 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--accent-color)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 112, 243, 0.4))', flexShrink: 0 }}
        >
          {/* Eye outline */}
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          {/* Pupil */}
          <circle cx="12" cy="12" r="3" fill="var(--accent-color)" />
          {/* Fast forward element replacing the right corner */}
          <path d="M22 12l-4-4" />
          <path d="M22 12l-4 4" />
        </svg>
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '-0.02em' }}>Prima Facie</h1>
          <p style={{ margin: 0, marginTop: '0.2rem', color: 'var(--text-muted)' }}>At first sight: read faster and better with Optimal Recognition Point highlighting.</p>
        </div>
      </header>

      {!hasText && (
        <main className="app-main-upload">
          <FileUploader 
            onLoadDocument={loadDocument}
            isProcessing={isProcessing} 
            setIsProcessing={setIsProcessing} 
          />
          <SettingsPanel 
            settings={settings}
            onUpdateSetting={updateSetting}
          />
        </main>
      )}

      {hasText && (
        <div className={`app-layout ${!settings.showPreview ? 'no-preview' : ''}`}>
          {/* Left column: speed reader + controls */}
          <main className="reader-column">
            <ReaderDisplay words={currentWords} fontSize={settings.fontSize} />
            
            <Controls 
              isPlaying={isPlaying}
              currentIndex={currentIndex}
              totalWords={words.length}
              onPlay={play}
              onPause={pause}
              onStop={() => { stop(); clearDocument(); }}
              onSeek={seek}
            />

            <SettingsPanel 
              settings={settings}
              onUpdateSetting={updateSetting}
            />

            <BookmarksPanel 
              bookmarks={bookmarks}
              words={words}
              onSeek={seek}
              onRemove={toggleBookmark}
            />
          </main>

          {/* Right column: formatted page context view */}
          {settings.showPreview && sections.length > 0 && (
            <aside className="page-column">
              <PageView
                sections={sections}
                currentIndex={currentIndex}
                onSeek={seek}
              />
            </aside>
          )}
        </div>
      )}
    </>
  );
}

export default App;

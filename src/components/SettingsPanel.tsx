import React from 'react';
import type { ReaderSettings } from '../hooks/useSpeedReader';

interface SettingsPanelProps {
  settings: ReaderSettings;
  onUpdateSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdateSetting }) => {
  return (
    <div className="glass-panel">
      <div className="settings-grid">
        <div className="setting-group">
          <label className="setting-label">Words Per Minute (WPM)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="range" 
              className="timeline" 
              min={100} 
              max={1000} 
              step={10}
              value={settings.wpm}
              onChange={(e) => onUpdateSetting('wpm', Number(e.target.value))}
            />
            <span className="setting-value">{settings.wpm}</span>
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">Chunk Size</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="range" 
              className="timeline" 
              min={1} 
              max={5} 
              step={1}
              value={settings.chunkSize}
              onChange={(e) => onUpdateSetting('chunkSize', Number(e.target.value))}
            />
            <span className="setting-value">{settings.chunkSize}</span>
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">Font Size</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input 
              type="range" 
              className="timeline" 
              min={1.5} 
              max={6.0} 
              step={0.1}
              value={settings.fontSize}
              onChange={(e) => onUpdateSetting('fontSize', Number(e.target.value))}
            />
            <span className="setting-value">{settings.fontSize.toFixed(1)}</span>
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">Theme</label>
          <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--surface-border)', padding: '0.2rem', borderRadius: '9999px' }}>
            <button 
              className={`btn ${settings.theme === 'light' ? 'btn-primary' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: 'none' }}
              onClick={() => onUpdateSetting('theme', 'light')}
            >
              Light
            </button>
            <button 
              className={`btn ${settings.theme === 'dark' ? 'btn-primary' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: 'none' }}
              onClick={() => onUpdateSetting('theme', 'dark')}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">Text Preview</label>
          <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--surface-border)', padding: '0.2rem', borderRadius: '9999px' }}>
            <button 
              className={`btn ${!settings.showPreview ? 'btn-primary' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: 'none' }}
              onClick={() => onUpdateSetting('showPreview', false)}
            >
              Hide
            </button>
            <button 
              className={`btn ${settings.showPreview ? 'btn-primary' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: 'none' }}
              onClick={() => onUpdateSetting('showPreview', true)}
            >
              Show
            </button>
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">Audio Metronome</label>
          <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--surface-border)', padding: '0.2rem', borderRadius: '9999px' }}>
            <button 
              className={`btn ${!settings.metronomeEnabled ? 'btn-primary' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: 'none' }}
              onClick={() => onUpdateSetting('metronomeEnabled', false)}
            >
              Off
            </button>
            <button 
              className={`btn ${settings.metronomeEnabled ? 'btn-primary' : ''}`}
              style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', border: 'none' }}
              onClick={() => onUpdateSetting('metronomeEnabled', true)}
            >
              On
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Keyboard Shortcuts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Play / Pause</span>
            <kbd style={{ background: 'var(--surface-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)', fontFamily: 'monospace' }}>Space</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Bookmark</span>
            <kbd style={{ background: 'var(--surface-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)', fontFamily: 'monospace' }}>B</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rewind 10 words</span>
            <kbd style={{ background: 'var(--surface-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)', fontFamily: 'monospace' }}>←</kbd>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Forward 10 words</span>
            <kbd style={{ background: 'var(--surface-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)', fontFamily: 'monospace' }}>→</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

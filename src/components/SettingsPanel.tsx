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
    </div>
  );
};

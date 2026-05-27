import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Type, 
  Download, 
  Upload, 
  RotateCcw, 
  Check
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  onResetToDefaults: () => void;
}

export default function SettingsView({
  settings,
  onUpdateSettings,
  onExportBackup,
  onImportBackup,
  onResetToDefaults
}: SettingsViewProps) {
  const [userName, setUserName] = useState(settings.userName);
  const [showSavedToast, setShowSavedToast] = useState(false);

  React.useEffect(() => {
    setUserName(settings.userName);
  }, [settings.userName]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      userName: userName.trim() || 'Journaler'
    });
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleFontSizeChange = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    onUpdateSettings({
      ...settings,
      fontSize: size
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
  };

  return (
    <div className="max-w-[640px] mx-auto w-full h-full flex flex-col relative py-10 px-2 sm:px-4 animate-fade-in-up custom-scrollbar overflow-y-auto">
      <header className="mb-8">
        <h2 className="font-serif text-4xl sm:text-5xl text-on-surface font-semibold tracking-tight">Settings</h2>
        <p className="font-sans text-xs text-on-surface-variant/70 mt-2 uppercase tracking-widest font-semibold opacity-75">
          Keep the writing space calm and simple
        </p>
      </header>

      <div className="space-y-6 pb-20">

        <section className="bg-surface-container/70 border border-surface-container-high/35 rounded-[28px] p-5 sm:p-6">
          <h3 className="font-serif text-lg text-on-surface font-semibold flex items-center gap-2 mb-4">
            <User className="w-4.5 h-4.5 text-primary" />
            <span>Writing Name</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">
                Name shown in Ember
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/30 font-sans text-xs border border-surface-variant rounded-md px-3 py-2 focus:outline-none focus:border-primary/50 transition-colors flex-1"
                  placeholder="e.g. Maya Lin"
                />
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-fixed text-on-primary font-sans text-xs font-semibold px-4 py-2 rounded-md transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </form>

          {showSavedToast && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-sans">
              <Check className="w-4 h-4" />
              <span>Name updated.</span>
            </div>
          )}
        </section>

        <section className="bg-surface-container/70 border border-surface-container-high/35 rounded-[28px] p-5 sm:p-6">
          <h3 className="font-serif text-lg text-on-surface font-semibold flex items-center gap-2 mb-4">
            <Type className="w-4.5 h-4.5 text-primary" />
            <span>Text Size</span>
          </h3>

          <div className="space-y-3 font-sans text-xs text-on-surface-variant">
            <p className="mb-2 leading-relaxed">Choose the size that makes long, late-night writing feel easiest on your eyes.</p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
              {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                <button
                  key={size}
                  className={`py-2 rounded-lg border uppercase transition-all cursor-pointer ${
                    settings.fontSize === size
                      ? 'bg-primary/10 text-primary border-primary font-bold'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container-high hover:bg-surface-variant/40'
                  }`}
                  onClick={() => handleFontSizeChange(size)}
                >
                  {size} size
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-surface-container/70 border border-surface-container-high/35 rounded-[28px] p-5 sm:p-6">
          <h3 className="font-serif text-lg text-on-surface font-semibold flex items-center gap-2 mb-4">
            <Settings className="w-4.5 h-4.5 text-primary" />
            <span>Backups</span>
          </h3>

          <div className="space-y-4 font-sans text-xs text-on-surface-variant">
            <p className="leading-relaxed">Your journal lives as markdown files in Documents/Ember. Export a backup when you want an extra copy or move the journal somewhere else.</p>

            <div className="flex flex-wrap gap-2 pt-1.5">
              <button 
                onClick={onExportBackup}
                className="flex items-center gap-1.5 bg-surface-container-low/70 border border-surface-container-high/40 hover:border-primary/20 text-on-surface hover:text-primary transition-all rounded-full px-3.5 py-2 font-semibold cursor-pointer"
              >
                <Download className="w-4 h-4 text-primary" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex items-center gap-1.5 bg-surface-container-low/70 border border-surface-container-high/40 hover:border-primary/20 text-on-surface hover:text-primary transition-all rounded-full px-3.5 py-2 font-semibold cursor-pointer">
                <Upload className="w-4 h-4 text-primary" />
                <span>Import JSON Backup</span>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileInputChange} 
                  className="hidden" 
                />
              </label>

              <button 
                onClick={() => {
                  if (confirm('This will delete the markdown journal files in Documents/Ember and start fresh. Proceed?')) {
                    onResetToDefaults();
                  }
                }}
                className="flex items-center gap-1.5 bg-error-container/10 border border-error-container/20 text-error hover:bg-error-container transition-all rounded-full px-3.5 py-2 font-semibold cursor-pointer ml-auto"
                title="Reset to Defaults"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Memories</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

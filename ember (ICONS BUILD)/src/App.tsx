import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Edit3, Calendar as CalendarIcon, Settings as SettingsIcon, Plus } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import Titlebar from './components/Titlebar';
import { JournalEntry, ScreenType, AppSettings } from './types';
import {
  clearJournalEntries,
  createJournalEntryForDate,
  deleteJournalEntry,
  loadJournalEntries,
  normalizeJournalEntries,
  replaceJournalEntries,
  saveJournalEntry,
} from './lib/journalStorage';

const SETTINGS_KEY = 'ember_settings_v1';
const ENTRIES_KEY = 'ember_entries_v1';

const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Journaler',
  fontSize: 'md'
};

export default function App() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [activeScreen, setActiveScreen] = useState<ScreenType>('journal');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const saveQueueRef = useRef<Map<string, Promise<void>>>(new Map());

  useEffect(() => {
    let isCancelled = false;

    const initializeJournal = async () => {
      try {
        const loadedEntries = await loadJournalEntries();

        if (isCancelled) {
          return;
        }

        if (loadedEntries.length > 0) {
          setEntries(loadedEntries);
          const todayId = createJournalEntryForDate(new Date()).id;
          setSelectedEntryId(loadedEntries.find(entry => entry.id === todayId)?.id ?? loadedEntries[0].id);
          return;
        }

        const storedEntriesBytes = localStorage.getItem(ENTRIES_KEY);
        if (storedEntriesBytes) {
          const parsedLegacyEntries = JSON.parse(storedEntriesBytes);
          if (Array.isArray(parsedLegacyEntries) && parsedLegacyEntries.length > 0) {
            const normalizedEntries = normalizeJournalEntries(parsedLegacyEntries);
            const savedEntries = await replaceJournalEntries(normalizedEntries);

            if (!isCancelled) {
              setEntries(savedEntries);
              const todayId = createJournalEntryForDate(new Date()).id;
              setSelectedEntryId(savedEntries.find(entry => entry.id === todayId)?.id ?? savedEntries[0]?.id ?? null);
            }

            return;
          }
        }

        const initialEntry = createJournalEntryForDate(new Date());
        await saveJournalEntry(initialEntry);

        if (!isCancelled) {
          setEntries([initialEntry]);
          setSelectedEntryId(initialEntry.id);
        }
      } catch (err) {
        console.error('Error loading journal entries:', err);

        if (!isCancelled) {
          const fallbackEntry = createJournalEntryForDate(new Date());
          setEntries([fallbackEntry]);
          setSelectedEntryId(fallbackEntry.id);
        }
      }
    };

    void initializeJournal();

    try {
      const storedSettingsBytes = localStorage.getItem(SETTINGS_KEY);
      if (storedSettingsBytes) {
        const parsed = JSON.parse(storedSettingsBytes);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (err) {
      console.error('Error reading localStorage for settings:', err);
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  const persistEntry = (updatedEntry: JournalEntry) => {
    const previousSave = saveQueueRef.current.get(updatedEntry.id) ?? Promise.resolve();
    const nextSave = previousSave
      .catch(() => undefined)
      .then(() => saveJournalEntry(updatedEntry))
      .catch((err) => {
        console.error(`Error saving journal entry ${updatedEntry.id}:`, err);
      });

    saveQueueRef.current.set(updatedEntry.id, nextSave);
    nextSave.finally(() => {
      if (saveQueueRef.current.get(updatedEntry.id) === nextSave) {
        saveQueueRef.current.delete(updatedEntry.id);
      }
    });

    return nextSave;
  };

  const handleUpdateEntry = (updatedEntry: JournalEntry) => {
    setEntries(currentEntries => currentEntries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
    void persistEntry(updatedEntry);
  };

  const handleNewEntry = async () => {
    const today = new Date();
    const newEntry = createJournalEntryForDate(today);
    const existingEntry = entries.find(entry => entry.id === newEntry.id);

    if (existingEntry) {
      setSelectedEntryId(existingEntry.id);
      setActiveScreen('journal');
      setIsMobileSidebarOpen(false);
      return;
    }

    setEntries(currentEntries => [newEntry, ...currentEntries]);
    setActiveScreen('journal');
    setSelectedEntryId(newEntry.id);
    setIsMobileSidebarOpen(false);

    await saveJournalEntry(newEntry).catch((err) => {
      console.error('Error creating new journal entry on disk:', err);
    });
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(currentEntries => {
      const updatedEntries = currentEntries.filter(entry => entry.id !== id);
      if (selectedEntryId === id) {
        setSelectedEntryId(updatedEntries[0]?.id ?? null);
      }
      return updatedEntries;
    });

    void deleteJournalEntry(id).catch((err) => {
      console.error(`Error deleting journal entry ${id}:`, err);
    });
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const handleExportBackup = () => {
    const backupData = {
      entries,
      settings,
      secretCheck: 'ember_backup_v1',
      exportedAt: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `ember_journal_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      void (async () => {
        try {
          const rawText = event.target?.result as string;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            if (parsed.secretCheck === 'ember_backup_v1' && Array.isArray(parsed.entries)) {
              const savedEntries = await replaceJournalEntries(parsed.entries as JournalEntry[]);
              setEntries(savedEntries);
              setSelectedEntryId(savedEntries[0]?.id ?? null);

              if (parsed.settings) {
                handleUpdateSettings(parsed.settings);
              }

              alert('Journal backups imported successfully!');
            } else {
              alert('Invalid backup file formatting.');
            }
          }
        } catch (err) {
          console.error('Error importing JSON:', err);
          alert('Failed parsing backup package.');
        }
      })();
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = async () => {
    await clearJournalEntries().catch((err) => {
      console.error('Error clearing journal files:', err);
    });

    const freshEntry = createJournalEntryForDate(new Date());
    await saveJournalEntry(freshEntry).catch((err) => {
      console.error('Error recreating default journal entry:', err);
    });

    localStorage.removeItem(ENTRIES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    setSettings(DEFAULT_SETTINGS);
    setEntries([freshEntry]);
    setSelectedEntryId(freshEntry.id);
    setActiveScreen('journal');
    setIsMobileSidebarOpen(false);
  };

  const activeEntryObj = entries.find(e => e.id === selectedEntryId) || null;

  return (
    <div className="bg-background text-on-surface font-sans text-body-md h-screen overflow-hidden flex flex-col pt-10 selection:bg-primary-container selection:text-on-primary-container">
      <Titlebar />

      <div className="flex flex-1 min-h-0 relative">
        <Sidebar
          entries={entries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={(id) => {
            setSelectedEntryId(id);
            setIsMobileSidebarOpen(false);
          }}
          onNewEntry={handleNewEntry}
          activeScreen={activeScreen}
          onChangeScreen={(screen) => {
            setActiveScreen(screen);
            setIsMobileSidebarOpen(false);
          }}
        />

        <main className="flex-1 ml-0 md:ml-[280px] h-full flex flex-col relative bg-background">
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-surface-container/90 backdrop-blur-sm border-b border-surface-container-high/40 sticky top-0 z-10">
          <button 
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open sidebar" 
            className="text-on-surface-variant hover:text-primary focus:outline-none transition-colors duration-300 p-1 rounded-md"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <h1 className="font-serif text-2xl text-primary font-medium tracking-tight">Ember</h1>
          
          <button 
            onClick={handleNewEntry}
            aria-label="Add new entry" 
            className="text-on-surface-variant hover:text-primary focus:outline-none transition-colors duration-300 p-1.5 bg-surface-container-high rounded-full"
          >
            <Plus className="w-5 h-5 text-primary" />
          </button>
        </header>

        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-x-0 top-10 bottom-0 z-40 bg-zinc-950/80 animate-fade-in pr-12">
            <div className="w-full max-w-[280px] h-full bg-surface-container relative p-5 flex flex-col gap-6 border-r border-surface-container-high/40">
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-1.5 hover:bg-surface-variant/40 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mt-8">
                <h1 className="font-serif text-3xl text-primary font-medium">Ember</h1>
                <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-on-surface-variant/70">
                  A page for today.
                </p>
              </div>

              <ul className="flex flex-col gap-2 font-sans text-sm">
                <li>
                  <button
                    onClick={() => {
                      setActiveScreen('journal');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 transition-all text-left ${
                      activeScreen === 'journal' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                    }`}
                  >
                    <Edit3 className="w-5 h-5 text-primary" />
                    <span>Journal</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveScreen('calendar');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 transition-all text-left ${
                      activeScreen === 'calendar' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                    }`}
                  >
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <span>Calendar</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveScreen('settings');
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 transition-all text-left ${
                      activeScreen === 'settings' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                    }`}
                  >
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    <span>Settings</span>
                  </button>
                </li>
              </ul>
              
              <div className="mt-auto border-t border-surface-container-high/40 pt-4 text-[10px] text-on-surface-variant/70 font-sans flex flex-col gap-1">
                <span>Writing as {settings.userName}</span>
                <span>{entries.length} entries saved on disk</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar relative px-4 md:px-8 py-6 md:py-12">
          {activeScreen === 'journal' && (
            <Editor
              entry={activeEntryObj}
              onUpdateEntry={handleUpdateEntry}
              onDeleteEntry={handleDeleteEntry}
              settings={settings}
            />
          )}

          {activeScreen === 'calendar' && (
            <CalendarView
              entries={entries}
              onSelectEntry={(id) => setSelectedEntryId(id)}
              onChangeScreen={(scr) => setActiveScreen(scr)}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetToDefaults={handleResetToDefaults}
            />
          )}
        </div>
        </main>
      </div>
    </div>
  );
}

import React from 'react';
import { Plus, Edit3, Calendar as CalendarIcon, Settings as SettingsIcon, Clock3 } from 'lucide-react';
import { JournalEntry, ScreenType } from '../types';

interface SidebarProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  activeScreen: ScreenType;
  onChangeScreen: (screen: ScreenType) => void;
}

export default function Sidebar({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  activeScreen,
  onChangeScreen,
}: SidebarProps) {
  return (
    <nav className="hidden md:flex flex-col h-[calc(100vh-40px)] w-[300px] fixed left-0 top-10 bg-surface-container/90 backdrop-blur-sm border-r border-surface-container-high/40 z-20">
      <div className="p-6 pb-4 flex flex-col gap-5">
        <div>
          <h1 className="font-serif text-3xl text-primary tracking-tight font-medium">Ember</h1>
          <p className="mt-2 text-xs leading-relaxed text-on-surface-variant/70 max-w-[18rem]">
            A page for today.
          </p>
        </div>

        <button 
          onClick={() => {
            onNewEntry();
            onChangeScreen('journal');
          }}
          className="w-full flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-3 font-sans text-sm font-semibold text-primary transition-colors hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <Plus className="w-[18px] h-[18px]" />
          New Entry
        </button>
      </div>

      <div className="px-4 py-2">
        <p className="font-sans text-[10px] font-semibold text-on-surface-variant/55 mb-2 px-2 uppercase tracking-widest">
          Navigation
        </p>
        <ul className="flex flex-col gap-1">
          <li>
            <button
              onClick={() => onChangeScreen('journal')}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all text-left font-sans text-sm ${
                activeScreen === 'journal'
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm font-medium'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
              }`}
            >
              <Edit3 className="w-[18px] h-[18px] text-primary" />
              <span>Journal</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onChangeScreen('calendar')}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all text-left font-sans text-sm ${
                activeScreen === 'calendar'
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm font-medium'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
              }`}
            >
              <CalendarIcon className="w-[18px] h-[18px] text-primary" />
              <span>Calendar</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onChangeScreen('settings')}
              className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all text-left font-sans text-sm ${
                activeScreen === 'settings'
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm font-medium'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
              }`}
            >
              <SettingsIcon className="w-[18px] h-[18px] text-primary" />
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 mt-2 border-t border-surface-container-high/30 mx-4 max-h-[calc(100vh-360px)]">
        <p className="font-sans text-[10px] font-semibold text-on-surface-variant/55 mb-2 px-2 uppercase tracking-widest">
          Recent entries
        </p>

        {entries.length === 0 ? (
          <p className="text-xs text-on-surface-variant/60 italic px-2 mt-2 leading-relaxed">
            No entries yet. Start a page when the room feels right.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => {
              const isActive = selectedEntryId === entry.id && activeScreen === 'journal';
              const rawText = entry.content ? entry.content.replace(/<[^>]*>/g, '') : 'Empty entry';
              const snippet = rawText.length > 60 ? `${rawText.slice(0, 60)}...` : rawText;

              return (
                <li key={entry.id} className="relative group">
                  <button
                    onClick={() => {
                      onSelectEntry(entry.id);
                      onChangeScreen('journal');
                    }}
                    className={`w-full text-left rounded-2xl py-2.5 px-3 transition-all duration-200 outline-none flex flex-col ${
                      isActive
                        ? 'bg-primary/10 ring-1 ring-primary/15'
                        : 'hover:bg-surface-variant/25 focus:bg-surface-variant/20'
                    }`}
                  >
                    <span className={`font-sans text-xs font-semibold ${isActive ? 'text-on-surface' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                      {entry.title}
                    </span>
                    <span className={`font-sans text-[11px] truncate w-full mt-0.5 ${isActive ? 'text-on-surface-variant/80' : 'text-outline/70 group-hover:text-on-surface-variant/60'}`}>
                      {snippet || 'Begin writing...'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="p-4 mt-auto border-t border-surface-container-high/30">
        <div className="rounded-2xl bg-surface-container-low/50 px-3 py-2 text-[10px] leading-relaxed text-on-surface-variant/70 flex items-center gap-2">
          <Clock3 className="h-3.5 w-3.5 text-primary" />
          <span>Saved as markdown in Documents/Ember.</span>
        </div>
      </div>
    </nav>
  );
}

import React, { useRef, useEffect, useState } from 'react';
import { Check, RotateCw, Trash2 } from 'lucide-react';
import { JournalEntry, AppSettings } from '../types';

interface EditorProps {
  entry: JournalEntry | null;
  onUpdateEntry: (updated: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  settings: AppSettings;
}

export default function Editor({ 
  entry, 
  onUpdateEntry, 
  onDeleteEntry, 
  settings 
}: EditorProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const saveTimerRef = useRef<number | null>(null);
  
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  useEffect(() => {
    if (entry) {
      if (contentRef.current) {
        contentRef.current.innerHTML = entry.content || '';
      }
      if (titleRef.current) {
        titleRef.current.innerText = entry.title || '';
      }
      setSaveStatus('saved');
    }
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, [entry?.id]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  if (!entry) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-background animate-fade-in-up">
        <h3 className="font-serif text-2xl sm:text-3xl text-on-surface font-medium">No entry open</h3>
        <p className="font-sans text-sm text-on-surface-variant/75 mt-3 max-w-sm leading-relaxed">
          Pick a page from the sidebar or create a new one when you’re ready to write.
        </p>
      </div>
    );
  }

  const triggerAutoSave = () => {
    setSaveStatus('saving');
    const titleVal = titleRef.current ? titleRef.current.innerText.trim() : entry.title;
    const contentVal = contentRef.current ? contentRef.current.innerHTML : entry.content;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = window.setTimeout(() => {
      onUpdateEntry({
        ...entry,
        title: titleVal || 'Untitled Day',
        content: contentVal,
      });
      setSaveStatus('saved');
      saveTimerRef.current = null;
    }, 500);
  };

  const handleTitleBlur = () => {
    triggerAutoSave();
  };

  const handleContentInput = () => {
    triggerAutoSave();
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm': return 'text-[1rem] sm:text-[1.05rem] leading-[1.9]';
      case 'lg': return 'text-[1.08rem] sm:text-[1.18rem] leading-[1.98]';
      case 'xl': return 'text-[1.15rem] sm:text-[1.28rem] leading-[2.05]';
      case 'md':
      default: return 'text-[1.04rem] sm:text-[1.12rem] leading-[1.95]';
    }
  };

  return (
    <article className="mx-auto flex h-full w-full max-w-[1480px] flex-col px-2 sm:px-4 md:px-6 pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4 border-b border-surface-container-high/25 pb-4 pt-1">
        <div className="text-on-surface-variant flex items-center gap-2 rounded-full bg-surface-container-low/55 px-3 py-1.5 text-xs select-none">
          {saveStatus === 'saved' ? (
            <>
              <Check className="h-3.5 w-3.5 text-primary" />
              <span>Saved to disk</span>
            </>
          ) : (
            <>
              <RotateCw className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>Saving...</span>
            </>
          )}
        </div>

        <button
          onClick={() => onDeleteEntry(entry.id)}
          className="inline-flex items-center gap-2 rounded-full border border-error-container/30 bg-error-container/10 px-3 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error-container/20 focus:outline-none"
          title="Delete entry"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <header className="mb-10 mt-12">
        <div className="flex flex-col gap-4">
          <h2 
            ref={titleRef}
            contentEditable
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                contentRef.current?.focus();
              }
            }}
            placeholder="Select Date / Entry Title"
            spellCheck="false"
            className="font-serif text-[clamp(3.3rem,5vw,6.6rem)] leading-[0.92] tracking-[-0.03em] text-on-surface focus:outline-none cursor-text transition-colors duration-300 hover:text-on-surface/90"
          >
            {entry.title}
          </h2>
          <span className="font-serif text-sm uppercase tracking-[0.3em] text-on-surface-variant/55 select-none">
            {entry.year}
          </span>
        </div>
      </header>

      <div className="flex-1 rounded-[28px] bg-surface-container/20 px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
        <div
          ref={contentRef}
          contentEditable
          onInput={handleContentInput}
          placeholder="Begin writing..."
          spellCheck="false"
          className={`w-full min-h-[55vh] px-4 py-5 sm:px-5 sm:py-6 md:px-8 outline-none font-serif text-on-surface whitespace-pre-wrap selection:bg-primary-container/30 selection:text-primary ${getFontSizeClass()}`}
        />
      </div>

    </article>
  );
}

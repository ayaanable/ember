import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { JournalEntry } from '../types';

interface CalendarViewProps {
  entries: JournalEntry[];
  onSelectEntry: (id: string) => void;
  onChangeScreen: (screen: 'journal') => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarView({ entries, onSelectEntry, onChangeScreen }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  // Helper: Get days in a month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get first day of month (0-indexed, 0 = Sunday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonthIdx);
  const firstDayOffset = getFirstDayOfMonth(currentYear, currentMonthIdx);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonthIdx + 1, 1));
  };

  // Parse title/createdAt to find matches for specific month/day
  const findEntryForDay = (day: number) => {
    return entries.find(entry => {
      const entryDate = new Date(entry.createdAt);
      return (
        entryDate.getFullYear() === currentYear &&
        entryDate.getMonth() === currentMonthIdx &&
        entryDate.getDate() === day
      );
    });
  };

  // Grid dates construction: padding empty slots first, then actual days
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    calendarDays.push(i);
  }

  const monthEntries = entries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonthIdx;
  });

  return (
    <div className="max-w-[640px] mx-auto w-full h-full flex flex-col relative py-10 px-2 sm:px-4 animate-fade-in-up custom-scrollbar overflow-y-auto">
      <header className="mb-8">
        <h2 className="font-serif text-4xl sm:text-5xl text-on-surface font-semibold tracking-tight">Calendar</h2>
        <p className="font-sans text-xs text-on-surface-variant/70 mt-2 uppercase tracking-widest font-semibold opacity-75">
          Quietly revisit the days you wrote
        </p>
      </header>

      <div className="space-y-6 pb-20">
        <div className="bg-surface-container/70 border border-surface-container-high/35 rounded-[28px] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl text-on-surface font-semibold">
              {MONTHS[currentMonthIdx]} <span className="text-primary font-normal">{currentYear}</span>
            </h3>
            <div className="flex gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 rounded-full hover:bg-surface-variant/40 hover:text-primary transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1.5 rounded-full hover:bg-surface-variant/40 hover:text-primary transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-sans text-[11px] text-on-surface-variant/50 font-semibold mb-2">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }

              const matchingEntry = findEntryForDay(day);
              const isToday = new Date().toLocaleDateString() === new Date(currentYear, currentMonthIdx, day).toLocaleDateString();
              
              return (
                <button
                  key={`day-${day}`}
                  onClick={() => {
                    if (matchingEntry) {
                      onSelectEntry(matchingEntry.id);
                      onChangeScreen('journal');
                    }
                  }}
                  disabled={!matchingEntry}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all text-xs font-sans border ${
                    matchingEntry
                      ? 'bg-primary/12 text-primary border-primary/15 hover:bg-primary/18 hover:border-primary/25 cursor-pointer'
                      : isToday
                        ? 'bg-surface-container-high/55 text-on-surface border-primary/10 cursor-default'
                        : 'text-on-surface-variant/70 bg-surface-container-low/70 border-transparent hover:bg-surface-variant/15 cursor-default'
                  }`}
                  title={matchingEntry ? matchingEntry.title : undefined}
                >
                  <span className="font-semibold">{day}</span>
                  {matchingEntry && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-serif text-lg text-on-surface font-semibold flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span>Entries in {MONTHS[currentMonthIdx]}</span>
          </h4>

          {monthEntries.length === 0 ? (
            <p className="font-sans text-xs text-on-surface-variant/75 italic bg-surface-container-low/30 rounded-2xl p-6 border border-dashed border-surface-container-high/30 text-center leading-relaxed">
              No entries logged in this month yet. Keep the page close and write when the feeling arrives.
            </p>
          ) : (
            <div className="space-y-2">
              {monthEntries.map(entry => {
                const plainText = entry.content.replace(/<[^>]*>/g, '');
                const snippet = plainText.length > 90 ? plainText.slice(0, 90) + '...' : plainText;
                const date = new Date(entry.createdAt);

                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      onSelectEntry(entry.id);
                      onChangeScreen('journal');
                    }}
                    className="w-full text-left bg-surface-container/70 hover:bg-surface-container border border-surface-container-high/35 rounded-2xl p-4 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-primary font-sans text-xs font-semibold">
                        <span>{entry.title}</span>
                      </div>
                      <p className="font-serif text-xs text-on-surface-variant mt-1 group-hover:text-on-surface transition-colors truncate leading-relaxed">
                        {snippet || 'Begin writing...'}
                      </p>
                    </div>
                    <div className="text-right text-on-surface-variant/40 flex flex-col items-end shrink-0 font-sans text-[10px] select-none">
                      <span>{date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

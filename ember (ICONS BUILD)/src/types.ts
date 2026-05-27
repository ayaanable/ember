/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JournalEntry {
  id: string;
  title: string;       // e.g. "Tuesday, 26 May"
  year: number;        // e.g. 2026
  content: string;     // HTML string or raw paragraphs text
  createdAt: string;   // ISO String
}

export type ScreenType = 'journal' | 'calendar' | 'settings';

export interface AppSettings {
  userName: string;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
}

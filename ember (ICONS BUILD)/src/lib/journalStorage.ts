import { documentDir, join } from '@tauri-apps/api/path';
import { exists, mkdir, readDir, readTextFile, remove, writeTextFile } from '@tauri-apps/plugin-fs';
import { JournalEntry } from '../types';

const JOURNAL_FOLDER_NAME = 'Ember';
const DEFAULT_DRAFT_BODY = 'Begin writing...';

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatEntryDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function formatEntryId(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseEntryDate(id: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(id);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  return new Date(year, month, day, 12, 0, 0, 0);
}

function markdownBodyToHtml(markdownBody: string) {
  const normalized = markdownBody.replace(/\r\n/g, '\n').trim();

  if (!normalized) {
    return '<p><br></p>';
  }

  return normalized
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function htmlToMarkdownBody(html: string) {
  const fallback = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

  if (typeof document === 'undefined') {
    return fallback;
  }

  const container = document.createElement('div');
  container.innerHTML = html;
  return (container.innerText || container.textContent || fallback).replace(/\r\n/g, '\n').trim();
}

function buildMarkdownDocument(entry: JournalEntry) {
  const bodyMarkdown = htmlToMarkdownBody(entry.content);
  return `# ${entry.title}\n\n${bodyMarkdown}`.trimEnd() + '\n';
}

function parseMarkdownDocument(markdown: string, fileName: string): JournalEntry {
  const entryId = fileName.replace(/\.md$/i, '');
  const parsedDate = parseEntryDate(entryId);
  const entryDate = parsedDate ?? new Date();
  const normalized = markdown.replace(/\r\n/g, '\n').trim();
  const fallbackTitle = formatEntryDate(entryDate);

  if (!normalized) {
    return {
      id: entryId,
      title: fallbackTitle,
      year: entryDate.getFullYear(),
      content: markdownBodyToHtml(''),
      createdAt: entryDate.toISOString(),
    };
  }

  const lines = normalized.split('\n');
  let bodyLines = lines;
  let title = fallbackTitle;

  if (lines[0].startsWith('# ')) {
    title = lines[0].slice(2).trim() || fallbackTitle;
    bodyLines = lines.slice(1);
    if (bodyLines[0] === '') {
      bodyLines = bodyLines.slice(1);
    }
  }

  return {
    id: entryId,
    title,
    year: entryDate.getFullYear(),
    content: markdownBodyToHtml(bodyLines.join('\n')),
    createdAt: entryDate.toISOString(),
  };
}

function normalizeEntryForFilesystem(entry: JournalEntry) {
  const parsedCreatedAt = new Date(entry.createdAt);
  const sourceDate = Number.isNaN(parsedCreatedAt.getTime()) ? new Date() : parsedCreatedAt;
  const normalizedDate = new Date(sourceDate.getFullYear(), sourceDate.getMonth(), sourceDate.getDate(), 12, 0, 0, 0);
  const normalizedId = formatEntryId(sourceDate);
  const title = entry.title?.trim() || formatEntryDate(sourceDate);
  const bodyMarkdown = htmlToMarkdownBody(entry.content || '');

  return {
    id: normalizedId,
    title,
    year: sourceDate.getFullYear(),
    content: markdownBodyToHtml(bodyMarkdown),
    createdAt: normalizedDate.toISOString(),
  } satisfies JournalEntry;
}

async function getJournalDirectory() {
  return join(await documentDir(), JOURNAL_FOLDER_NAME);
}

async function getJournalFilePath(entryId: string) {
  return join(await getJournalDirectory(), `${entryId}.md`);
}

export function createJournalEntryForDate(date: Date, bodyMarkdown = DEFAULT_DRAFT_BODY): JournalEntry {
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

  return {
    id: formatEntryId(date),
    title: formatEntryDate(date),
    year: date.getFullYear(),
    content: markdownBodyToHtml(bodyMarkdown),
    createdAt: entryDate.toISOString(),
  };
}

export function normalizeJournalEntries(entries: JournalEntry[]) {
  const entriesByDate = new Map<string, JournalEntry>();

  for (const entry of entries) {
    const normalizedEntry = normalizeEntryForFilesystem(entry);
    if (!entriesByDate.has(normalizedEntry.id)) {
      entriesByDate.set(normalizedEntry.id, normalizedEntry);
    }
  }

  return [...entriesByDate.values()].sort((left, right) => right.id.localeCompare(left.id));
}

export async function ensureJournalDirectory() {
  const journalDirectory = await getJournalDirectory();
  await mkdir(journalDirectory, { recursive: true });
  return journalDirectory;
}

export async function loadJournalEntries() {
  const journalDirectory = await ensureJournalDirectory();
  const dirEntries = await readDir(journalDirectory);
  const markdownFileNames = dirEntries
    .filter((entry) => entry.isFile && /^\d{4}-\d{2}-\d{2}\.md$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left));

  const loadedEntries = await Promise.all(
    markdownFileNames.map(async (fileName) => {
      const filePath = await join(journalDirectory, fileName);
      const fileContents = await readTextFile(filePath);
      return parseMarkdownDocument(fileContents, fileName);
    })
  );

  return loadedEntries.sort((left, right) => right.id.localeCompare(left.id));
}

export async function saveJournalEntry(entry: JournalEntry) {
  const journalDirectory = await ensureJournalDirectory();
  const filePath = await join(journalDirectory, `${entry.id}.md`);
  await writeTextFile(filePath, buildMarkdownDocument(entry));
}

export async function replaceJournalEntries(entries: JournalEntry[]) {
  const journalDirectory = await ensureJournalDirectory();
  const dirEntries = await readDir(journalDirectory);

  await Promise.all(
    dirEntries
      .filter((entry) => entry.isFile && entry.name.toLowerCase().endsWith('.md'))
      .map(async (entry) => {
        const filePath = await join(journalDirectory, entry.name);
        if (await exists(filePath)) {
          await remove(filePath);
        }
      })
  );

  const normalizedEntries = normalizeJournalEntries(entries);
  for (const entry of normalizedEntries) {
    await saveJournalEntry(entry);
  }

  return normalizedEntries;
}

export async function deleteJournalEntry(entryId: string) {
  const filePath = await getJournalFilePath(entryId);
  if (await exists(filePath)) {
    await remove(filePath);
  }
}

export async function clearJournalEntries() {
  const journalDirectory = await ensureJournalDirectory();
  const dirEntries = await readDir(journalDirectory);

  await Promise.all(
    dirEntries
      .filter((entry) => entry.isFile && entry.name.toLowerCase().endsWith('.md'))
      .map(async (entry) => {
        const filePath = await join(journalDirectory, entry.name);
        if (await exists(filePath)) {
          await remove(filePath);
        }
      })
  );
}

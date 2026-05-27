import { JournalEntry } from './types';

export const DEFAULT_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'Tuesday, 26 May',
    year: 2024,
    content: `<p class="mb-4">The rain against the window pane creates a steady, comforting rhythm. It’s one of those quiet evenings where the world feels small and manageable, contained entirely within these four walls.</p><p class="mb-4">I spent most of the afternoon organizing the old sketches. There's a strange melancholy in looking at unfinished ideas from years ago, but also a sense of continuity. The thread of thought hasn't broken, it just wove itself into a different pattern.</p><p class="mb-4">Need to remember the quote from the book I finished yesterday: <em>"We are all just gathering fragments to build our own little sanctuaries."</em></p><p class="mb-4">Perhaps tomorrow I'll walk down to the river if the weather clears. But for now, the warmth of the desk lamp and the scratching of the pen (or the tapping of keys) is exactly enough.</p>`,
    createdAt: '2024-05-26T18:00:00.000Z'
  },
  {
    id: 'entry-2',
    title: 'Monday, 25 May',
    year: 2024,
    content: `<p class="mb-4">A quiet morning coffee before the rush. The light coming through the blinds was golden.</p><p class="mb-4">Reading some old notes on simplicity. Decided to declutter my desk today to match the headspace I want to maintain.</p>`,
    createdAt: '2024-05-25T08:00:00.000Z'
  },
  {
    id: 'entry-3',
    title: 'Sunday, 24 May',
    year: 2024,
    content: `<p class="mb-4">Walked through the old botanical gardens. The scent of pine and wet earth after the drizzle.</p><p class="mb-4">Met an elderly librarian who recommended a book on Danish hygge philosophy. Feels like the missing link in my daily creative setup.</p>`,
    createdAt: '2024-05-24T14:30:00.000Z'
  },
  {
    id: 'entry-4',
    title: 'Friday, 22 May',
    year: 2024,
    content: `<p class="mb-4">Thoughts on the new project direction.</p><p class="mb-4">I need to focus on depth rather than breadth. Doing one thing beautifully is worth tons of semi-finished ideas. Spoke with a friend who echoed this.</p>`,
    createdAt: '2024-05-22T11:15:00.000Z'
  }
];

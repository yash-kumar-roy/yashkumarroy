// Built-in demo apps: URL slug -> folder in the repo root.
// Used by the Express server (local/production) and by scripts/copy-demos.js (static hosting, e.g. Vercel).
export const demoMappings = [
  { slug: 'calculator', folder: 'Calculator' },
  { slug: 'catch-falling-fruits', folder: 'catch falling fruits' },
  { slug: 'equation-solver', folder: 'Equation Solver Tool' },
  { slug: 'family-tree', folder: 'Family Tree' },
  { slug: 'grok-home-page', folder: 'Grok Home Page' },
  { slug: 'inventory-manager', folder: 'inventory manager' },
  { slug: 'markdown-slides', folder: 'MarkdownSlides' },
  { slug: 'micro-habit-tracker', folder: 'Micro Habit Tracker' },
  { slug: 'online-whiteboard', folder: 'Online Whiteboard' },
  { slug: 'photo-compressor', folder: 'Photo compressor' },
  { slug: 'python-quiz', folder: 'Python quiz' },
  { slug: 'sudoku', folder: 'Sudoku' },
  { slug: 'time-sheet', folder: 'Time Sheet' },
  { slug: 'todo-list', folder: 'Todo list' },
  { slug: 'transcribe-app', folder: 'Transcribe app' },
  { slug: 'typing-game', folder: 'Typing Game' }
];

// Server-side source files that must never be published with a demo.
export const isPrivateDemoFile = (file) => /\.(py|env)$/i.test(file) || /(^|[\\/])\.env/.test(file);

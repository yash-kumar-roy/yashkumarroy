// Long-running server: local dev, `npm start`, Render, Railway, or any Node host.
// (On Vercel the same app runs as a serverless function instead: see api/index.js.)
import app from './app.js';
import { ensureConnected, getDbStatus } from './config/db.js';

const port = Number(process.env.PORT || 3001);

app.listen(port, async () => {
  console.log('\n======================================================');
  console.log('🚀 Yash Kumar Roy MERN Portfolio Server Running!');
  console.log(`📡 URL: http://localhost:${port}`);
  console.log(`📂 Demos: http://localhost:${port}/demos/sudoku/index.html`);
  console.log('======================================================\n');

  // Connect after the server is up so the API serves the built-in dataset immediately.
  await ensureConnected();
  console.log(`📦 MongoDB: ${getDbStatus().connected ? 'Connected ✅' : 'Not connected (serving built-in project dataset)'}`);
});

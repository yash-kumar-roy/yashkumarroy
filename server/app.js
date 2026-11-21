import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureConnected, getDbStatus } from './config/db.js';
import { demoMappings, isPrivateDemoFile } from './data/demos.js';
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// The Express app on its own, without app.listen(), so it can run as a normal server (server/index.js)
// or as a serverless function (api/index.js on Vercel).
const app = express();

// Middleware
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.set('trust proxy', 1);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));
app.use(express.json({ limit: '1mb' })); // blog posts can be long
app.use(express.urlencoded({ extended: true, limit: '64kb' }));

// Serve the built-in demo apps (folders in the repo root) under /demos/<slug>.
// Server-side files such as the inventory demo's Flask backend are never served.
demoMappings.forEach(({ slug, folder }) => {
  app.use(`/demos/${slug}`, (req, res, next) => (isPrivateDemoFile(req.path) ? res.status(404).end() : next()));
  app.use(`/demos/${slug}`, express.static(path.join(rootDir, folder)));
});

// NOTE: the repo root is intentionally NOT served — it contains config.js, .env, and server source.

// Health and Status endpoints
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.get('/api/status', (_req, res) => {
  const dbStatus = getDbStatus();
  res.json({
    app: 'Yash Kumar Roy Portfolio API (MERN)',
    version: '2.1.0',
    mongodb: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// API Routes. On serverless hosts each instance connects to MongoDB on its first request.
app.use('/api', (_req, _res, next) => {
  ensureConnected().finally(() => next());
});

app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/media', mediaRoutes);

// Inventory Manager demo mock API fallback
const sampleInventory = [
  { product_name: 'Wireless Mouse', inventory: 42 },
  { product_name: 'Mechanical Keyboard', inventory: 18 },
  { product_name: '27-inch 4K Monitor', inventory: 12 },
  { product_name: 'USB-C Docking Station', inventory: 25 },
  { product_name: 'Noise Cancelling Headphones', inventory: 15 },
  { product_name: 'HD Webcam 1080p', inventory: 30 },
  { product_name: 'Ergonomic Desk Chair', inventory: 7 },
  { product_name: 'Aluminum Laptop Stand', inventory: 50 },
];

app.get('/api/inventory', (_req, res) => res.json(sampleInventory));

app.post('/api/search', (req, res) => {
  const query = (req.body?.product_name || '').trim().toLowerCase();
  const item = sampleInventory.find((i) => i.product_name.toLowerCase() === query);
  if (item) {
    return res.json({ found: true, product_name: item.product_name, inventory: item.inventory });
  }
  return res.json({ found: false, product_name: query, message: 'Product not found' });
});

// AI Portfolio Assistant Chatbot
const portfolioContext = `You are the friendly, concise portfolio AI assistant for Yash Kumar Roy, a Data Science Associate and Full-Stack Developer.
He works with Python, JavaScript, TypeScript, React, Node.js, Express, MongoDB, SQL, TensorFlow, scikit-learn, XGBoost, and Streamlit.
He has created 19+ projects covering Data Science (Telecom Churn AUC 0.89, Medical Cost XGBoost/SHAP), Deep Learning (Style Transfer WGAN-GP), and diverse interactive web apps (Sudoku, Online Whiteboard, TranscribeIt, Equation Solver, Micro Habit Tracker, etc.).
Keep answers short, professional, and helpful. If a query is outside his portfolio, invite them to use the contact page.`;

app.post('/api/chat', async (req, res, next) => {
  try {
    const message = req.body?.message;
    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'A message is required.' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ message: 'Please keep your question under 1000 characters.' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        message: 'The AI assistant is temporarily unconfigured (waiting for API key). Feel free to explore the projects or send a message via the Contact form!'
      });
    }
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        instructions: portfolioContext,
        input: message.trim(),
        max_output_tokens: 180
      })
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error('[Chat] OpenAI error:', upstream.status, data?.error?.message || '');
      return res.status(502).json({ message: 'The assistant could not respond right now.' });
    }
    // The raw Responses API has no `output_text` field (that's an SDK helper) — collect the text parts.
    const reply = (data.output || [])
      .filter((item) => item.type === 'message')
      .flatMap((item) => item.content || [])
      .filter((part) => part.type === 'output_text')
      .map((part) => part.text)
      .join('')
      .trim();
    return res.json({ reply: reply || 'I could not generate a reply.' });
  } catch (error) {
    return next(error);
  }
});

// Serve frontend build if dist directory exists
const distPath = path.join(rootDir, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/demos') || path.extname(req.path)) {
    // API routes, demos, and missing static files shouldn't get index.html.
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Portfolio API is running. Start Vite dev server for frontend or run `npm run build`.');
    }
  });
});

// JSON 404 for unknown API routes
app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Global Error Handler
app.use((error, _req, res, _next) => {
  const status = error.status || error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  if (status >= 500) console.error('[Server Error]', error);
  res.status(status).json({
    success: false,
    // Don't leak internal error details to visitors.
    message: status >= 500 ? 'Internal server error' : error.message
  });
});

export default app;

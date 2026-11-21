import dns from 'node:dns';
import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { seedProjects } from '../data/projectsSeedData.js';

let isConnected = false;
let hasConnectedOnce = false;

// Public resolvers used when the OS resolver can't answer SRV queries
// (common on Windows with Node 22+, where `querySrv ECONNREFUSED` is thrown for mongodb+srv URIs).
const FALLBACK_DNS_SERVERS = ['1.1.1.1', '8.8.8.8'];

function parseDnsServers(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Use the database name from the URI if present, otherwise default to "portfolio"
// so data doesn't silently land in MongoDB's default "test" database.
function resolveDbName(uri) {
  if (process.env.MONGODB_DB_NAME) return process.env.MONGODB_DB_NAME;
  try {
    const dbFromUri = new URL(uri).pathname.replace(/^\//, '');
    return dbFromUri || 'portfolio';
  } catch {
    return 'portfolio';
  }
}

function isSrvDnsError(error) {
  return /querySrv|ENOTFOUND|ECONNREFUSED|ETIMEOUT/i.test(error?.message || '') && error?.message?.includes('_mongodb._tcp');
}

async function seedIfEmpty() {
  try {
    const count = await Project.countDocuments();
    if (count === 0) {
      console.log(`[MongoDB] Collection is empty. Auto-seeding ${seedProjects.length} portfolio projects...`);
      await Project.insertMany(seedProjects);
      console.log('[MongoDB] ✅ Successfully auto-seeded portfolio projects!');
      return;
    }
    // Backfill fields added after the first seed, without touching anything edited in /admin.
    await Project.bulkWrite(
      seedProjects
        .filter((p) => p.result)
        .map((p) => ({ updateOne: { filter: { slug: p.slug, result: { $exists: false } }, update: { $set: { result: p.result } } } }))
    );
  } catch (error) {
    console.warn('[MongoDB] Auto-seed check notice:', error.message);
  }
}

/**
 * Connect mongoose, retrying with public DNS if the OS resolver can't answer the SRV lookup.
 * Shared by the server and the seed script.
 */
export async function connectWithDnsFallback(uri, extraOptions = {}) {
  const customDns = parseDnsServers(process.env.MONGODB_DNS_SERVERS);
  if (customDns.length) dns.setServers(customDns);

  mongoose.set('strictQuery', false);
  const options = { serverSelectionTimeoutMS: 8000, dbName: resolveDbName(uri), ...extraOptions };

  try {
    return await mongoose.connect(uri, options);
  } catch (error) {
    if (!uri.startsWith('mongodb+srv://') || customDns.length || !isSrvDnsError(error)) throw error;
    console.warn(`[MongoDB] SRV DNS lookup failed (${error.message}). Retrying with public DNS ${FALLBACK_DNS_SERVERS.join(', ')}...`);
    dns.setServers(FALLBACK_DNS_SERVERS);
    return mongoose.connect(uri, options);
  }
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    console.log('\n[MongoDB] ⚠️  MONGODB_URI is not set in .env.');
    console.log('[MongoDB] ℹ️  The backend will use the built-in projects dataset until you add your MongoDB connection string to .env.');
    console.log('[MongoDB] ℹ️  Example: MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/portfolio?retryWrites=true&w=majority\n');
    return false;
  }

  try {
    const conn = await connectWithDnsFallback(uri);
    isConnected = true;
    hasConnectedOnce = true;
    console.log(`\n[MongoDB] ✅ Connected to MongoDB host: ${conn.connection.host} (DB: ${conn.connection.name})\n`);
    await seedIfEmpty();
    return true;
  } catch (error) {
    isConnected = false;
    console.error('\n[MongoDB] ❌ Error connecting to MongoDB:', error.message);
    console.log('[MongoDB] ℹ️  Backend running with built-in fallback data while MongoDB is unreachable.\n');
    return false;
  }
}

/**
 * Connect once and share the result. Safe to call on every request: serverless instances (Vercel)
 * connect on their first request and reuse the connection while warm. After a failed attempt it
 * waits 30 s before retrying, so a database outage doesn't add a timeout to every request.
 */
let pending = null;
let lastFailure = 0;
export function ensureConnected() {
  if (isConnected && mongoose.connection.readyState === 1) return Promise.resolve(true);
  if (!process.env.MONGODB_URI?.trim()) return Promise.resolve(false);
  if (pending) return pending;
  if (Date.now() - lastFailure < 30_000) return Promise.resolve(false);
  // A dropped connection is reconnected by mongoose itself; don't open a second one.
  if (hasConnectedOnce && mongoose.connection.readyState !== 0) return Promise.resolve(false);
  pending = connectDB().then((ok) => {
    if (!ok) lastFailure = Date.now();
    pending = null;
    return ok;
  });
  return pending;
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  if (hasConnectedOnce) console.log('[MongoDB] ⚠️  Disconnected from MongoDB.');
});

mongoose.connection.on('connected', () => {
  if (hasConnectedOnce) isConnected = true;
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  console.log('[MongoDB] ✅ Reconnected to MongoDB.');
});

export function getDbStatus() {
  const connected = isConnected && mongoose.connection.readyState === 1;
  return {
    connected,
    readyState: mongoose.connection.readyState,
    dbName: connected ? mongoose.connection.name : null,
  };
}

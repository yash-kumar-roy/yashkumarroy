import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { getDbStatus } from '../config/db.js';
import { seedProjects } from '../data/projectsSeedData.js';
import { pick, slugify, toStringList } from '../utils/helpers.js';

const EDITABLE = [
  'slug', 'title', 'category', 'description', 'details', 'stack', 'liveUrl', 'githubUrl',
  'demoType', 'featured', 'order', 'icon', 'highlights', 'images', 'year', 'result'
];

function normaliseProject(body) {
  const data = pick(body, EDITABLE);
  for (const key of ['stack', 'highlights', 'images']) if (key in data) data[key] = toStringList(data[key]);
  if ('featured' in data) data.featured = Boolean(data.featured);
  if ('order' in data) data.order = Number(data.order) || 0;
  if ('slug' in data || 'title' in data) data.slug = slugify(data.slug || data.title);
  return data;
}

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Query params can arrive as arrays (?search=a&search=b); normalise to a trimmed string.
const asString = (value) => (Array.isArray(value) ? value[0] : value ?? '').toString().trim();

/**
 * GET /api/projects
 * Query params: category, featured, search
 */
export async function getProjects(req, res, next) {
  try {
    const category = asString(req.query.category);
    const featured = asString(req.query.featured);
    const search = asString(req.query.search).slice(0, 100);
    const { connected } = getDbStatus();

    if (connected) {
      const filter = {};
      if (category && category !== 'All') {
        filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
      }
      if (featured === 'true') {
        filter.featured = true;
      }
      if (search) {
        const pattern = new RegExp(escapeRegex(search), 'i');
        filter.$or = [
          { title: pattern },
          { description: pattern },
          { stack: pattern },
          { category: pattern }
        ];
      }

      const projects = await Project.find(filter).sort({ order: 1, createdAt: 1 });
      return res.json({
        success: true,
        count: projects.length,
        source: 'mongodb',
        data: projects
      });
    }

    // In-memory fallback if MongoDB is not yet connected
    let results = [...seedProjects];

    if (category && category !== 'All') {
      results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (featured === 'true') {
      results = results.filter((p) => p.featured === true);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.stack.some((t) => t.toLowerCase().includes(q))
      );
    }

    results.sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.json({
      success: true,
      count: results.length,
      source: 'local-fallback',
      notice: 'MongoDB URI not set or offline. Serving projects from local built-in dataset.',
      data: results
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * GET /api/projects/:slug
 */
export async function getProjectBySlug(req, res, next) {
  try {
    const slug = String(req.params.slug || '').toLowerCase();
    const { connected } = getDbStatus();

    if (connected) {
      const project = await Project.findOne({ slug });
      if (project) {
        return res.json({ success: true, source: 'mongodb', data: project });
      }
    }

    // Check local dataset
    const found = seedProjects.find(
      (p) => p.slug.toLowerCase() === slug
    );

    if (!found) {
      return res.status(404).json({ success: false, message: `Project '${slug}' not found` });
    }

    return res.json({
      success: true,
      source: connected ? 'mongodb-fallback' : 'local-fallback',
      data: found
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/projects/seed
 * Force re-seed or upsert projects into MongoDB
 */
export async function seedDatabase(req, res, next) {
  try {
    const { connected } = getDbStatus();
    if (!connected) {
      return res.status(503).json({
        success: false,
        message: 'Cannot seed database: MongoDB is not connected. Please provide MONGODB_URI in .env first.'
      });
    }

    const operations = seedProjects.map((project) => ({
      updateOne: {
        filter: { slug: project.slug },
        // Only insert missing projects so edits made in /admin are never overwritten.
        update: { $setOnInsert: project },
        upsert: true
      }
    }));

    const result = await Project.bulkWrite(operations);

    return res.json({
      success: true,
      message: 'Portfolio projects successfully seeded into MongoDB!',
      result
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * POST /api/projects (Create project)
 */
export async function createProject(req, res, next) {
  try {
    const { connected } = getDbStatus();
    if (!connected) {
      return res.status(503).json({
        success: false,
        message: 'Database write unavailable: MongoDB is not connected.'
      });
    }

    const data = normaliseProject(req.body);
    if (!data.title?.trim() || !data.category?.trim() || !data.description?.trim()) {
      return res.status(400).json({ success: false, message: 'Title, category and short description are required.' });
    }
    const newProject = await Project.create(data);
    return res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    return next(error);
  }
}

/**
 * PUT /api/projects/:id (Update project)
 */
export async function updateProject(req, res, next) {
  try {
    const { connected } = getDbStatus();
    if (!connected) {
      return res.status(503).json({
        success: false,
        message: 'Database update unavailable: MongoDB is not connected.'
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid project id' });
    }

    const updated = await Project.findByIdAndUpdate(req.params.id, normaliseProject(req.body), {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
}

/**
 * DELETE /api/projects/:id (Delete project)
 */
export async function deleteProject(req, res, next) {
  try {
    const { connected } = getDbStatus();
    if (!connected) {
      return res.status(503).json({
        success: false,
        message: 'Database delete unavailable: MongoDB is not connected.'
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid project id' });
    }

    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    return next(error);
  }
}

import { Router } from 'express';
import {
  getProjects,
  getProjectBySlug,
  seedDatabase,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', getProjects);
router.post('/seed', requireAdmin, seedDatabase);
router.get('/:slug', getProjectBySlug);
router.post('/', requireAdmin, createProject);
router.put('/:id', requireAdmin, updateProject);
router.delete('/:id', requireAdmin, deleteProject);

export default router;

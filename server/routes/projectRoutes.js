import express from 'express';
import {
  addMember,
  createProject,
  getProjectById,
  getProjects,
  removeMember
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { projectAdminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getProjects).post(protect, createProject);
router.get('/:id', protect, getProjectById);
router.post('/:id/members', protect, projectAdminOnly, addMember);
router.delete('/:id/members/:userId', protect, projectAdminOnly, removeMember);

export default router;

import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';

export const projectAdminOnly = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id || req.body.project;
  const project = await Project.findById(projectId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.admin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only project admin can perform this action');
  }

  req.project = project;
  next();
});

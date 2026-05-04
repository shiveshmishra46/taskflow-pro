import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

const populateTask = (query) =>
  query.populate('assignedTo', 'name email').populate('project', 'title members admin');

const ensureProjectMember = (project, userId) => {
  return project.members.map(String).includes(userId.toString());
};

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, project: projectId, assignedTo, status = 'Todo', dueDate } = req.body;

  if (!title || !description || !projectId || !assignedTo || !dueDate) {
    res.status(400);
    throw new Error('Title, description, project, assigned user and due date are required');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.admin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only project admin can create tasks');
  }

  if (!ensureProjectMember(project, assignedTo)) {
    res.status(400);
    throw new Error('Assigned user must be a project member');
  }

  const task = await Task.create({ title, description, project: projectId, assignedTo, status, dueDate });
  const populatedTask = await populateTask(Task.findById(task._id));
  res.status(201).json(populatedTask);
});

export const getTasks = asyncHandler(async (req, res) => {
  const { status, assignedTo, project } = req.query;
  const userProjects = await Project.find({ members: req.user._id }).select('_id');
  const adminProjects = await Project.find({ admin: req.user._id }).select('_id');
  const accessibleProjectIds = userProjects.map((item) => item._id);
  const adminProjectIds = adminProjects.map((item) => item._id);

  const query = {
    project: { $in: accessibleProjectIds },
    $or: [{ project: { $in: adminProjectIds } }, { assignedTo: req.user._id }]
  };
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;
  if (project) query.project = project;

  const tasks = await populateTask(Task.find(query).sort({ dueDate: 1 }));
  res.json(tasks);
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const isAdmin = task.project.admin.toString() === req.user._id.toString();
  const isAssignedMember = task.assignedTo.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignedMember) {
    res.status(403);
    throw new Error('You can only update tasks assigned to you');
  }

  const allowedFields = isAdmin
    ? ['title', 'description', 'assignedTo', 'status', 'dueDate']
    : ['status'];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      task[field] = req.body[field];
    }
  });

  if (task.assignedTo && !ensureProjectMember(task.project, task.assignedTo)) {
    res.status(400);
    throw new Error('Assigned user must be a project member');
  }

  await task.save();
  const populatedTask = await populateTask(Task.findById(task._id));
  res.json(populatedTask);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (task.project.admin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only project admin can delete tasks');
  }

  await task.deleteOne();
  res.json({ message: 'Task removed' });
});

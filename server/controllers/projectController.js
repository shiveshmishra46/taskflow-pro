import asyncHandler from 'express-async-handler';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';

const populateProject = (query) =>
  query.populate('admin', 'name email').populate('members', 'name email');

export const createProject = asyncHandler(async (req, res) => {
  const { title, description, members = [] } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Title and description are required');
  }

  const uniqueMemberIds = [...new Set([req.user._id.toString(), ...members])];
  const validMemberCount = await User.countDocuments({ _id: { $in: uniqueMemberIds } });

  if (validMemberCount !== uniqueMemberIds.length) {
    res.status(400);
    throw new Error('One or more members are invalid');
  }

  const project = await Project.create({
    title,
    description,
    admin: req.user._id,
    members: uniqueMemberIds
  });

  const populatedProject = await populateProject(Project.findById(project._id));
  res.status(201).json(populatedProject);
});

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await populateProject(
    Project.find({ members: req.user._id }).sort({ createdAt: -1 })
  );

  res.json(projects);
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await populateProject(Project.findById(req.params.id));

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isMember = project.members.some((member) => member._id.toString() === req.user._id.toString());
  if (!isMember) {
    res.status(403);
    throw new Error('You do not have access to this project');
  }

  const isAdmin = project.admin._id.toString() === req.user._id.toString();
  const taskQuery = isAdmin
    ? { project: project._id }
    : { project: project._id, assignedTo: req.user._id };

  const tasks = await Task.find(taskQuery)
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1 });

  res.json({ project, tasks });
});

export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('User id is required');
  }

  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const project = req.project;
  if (!project.members.map(String).includes(userId)) {
    project.members.push(userId);
    await project.save();
  }

  const populatedProject = await populateProject(Project.findById(project._id));
  res.json(populatedProject);
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const project = req.project;

  if (project.admin.toString() === userId) {
    res.status(400);
    throw new Error('Project admin cannot be removed');
  }

  project.members = project.members.filter((member) => member.toString() !== userId);
  await project.save();

  await Task.deleteMany({ project: project._id, assignedTo: userId });
  const populatedProject = await populateProject(Project.findById(project._id));
  res.json(populatedProject);
});

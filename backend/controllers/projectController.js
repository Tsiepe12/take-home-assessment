const { getProjects, getProjectById, addProject } = require('../config/store');

/**
 * List all projects.
 */
function listProjects(req, res, next) { // Handler for GET /api/projects endpoint
  try { // Try-catch block for error handling
    let projects = getProjects(); // Get all projects from store
    const { status } = req.query; // Extract status query parameter from URL

    if (status) { // Check if status filter is provided
      projects = projects.filter((project) => project.status === status); // Filter projects by matching status
    }

    res.json({ success: true, data: projects, count: projects.length }); // Send filtered results as JSON
  } catch (err) { // Catch any errors that occur
    next(err); // Pass error to error handling middleware
  }
}

/**
 * Get a single project by ID.
 */
function getProject(req, res, next) {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
        id: req.params.id,
      });
    }
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new project.
 */
function createProject(req, res, next) {
  try {
    const { name, chain, status } = req.body;
    const project = addProject({ name, chain, status: status || 'in-progress' });
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProjects,
  getProject,
  createProject,
};

import express from 'express';
import mcpService from '../services/mcpService.js';

const router = express.Router();

/**
 * GET /api/projects/list
 * List all available KiCad projects via MCP
 */
router.get('/list', async (req, res) => {
  try {
    const projects = await mcpService.listProjects();
    
    res.json({
      success: true,
      projects,
      count: projects.length || 0
    });
  } catch (error) {
    console.error('Failed to list projects:', error);
    res.status(500).json({
      error: 'Failed to list projects',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

/**
 * GET /api/projects/:projectId
 * Get detailed project information via MCP
 * Note: projectId should be the full path to .kicad_pro file
 */
router.get('/:projectId(*)', async (req, res) => {
  try {
    const projectPath = req.params.projectId;
    
    if (!projectPath || !projectPath.endsWith('.kicad_pro')) {
      return res.status(400).json({
        error: 'Invalid project ID',
        message: 'Project ID must be a full path to a .kicad_pro file'
      });
    }

    const structure = await mcpService.getProjectStructure(projectPath);
    
    res.json({
      success: true,
      project: structure
    });
  } catch (error) {
    console.error('Failed to get project details:', error);
    res.status(500).json({
      error: 'Failed to get project details',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

/**
 * POST /api/projects/open
 * Open a KiCad project in the KiCad application
 */
router.post('/open', async (req, res) => {
  try {
    const { projectPath } = req.body;
    
    if (!projectPath) {
      return res.status(400).json({
        error: 'Missing project path',
        message: 'Please provide projectPath in request body'
      });
    }

    const result = await mcpService.openProject(projectPath);
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Failed to open project:', error);
    res.status(500).json({
      error: 'Failed to open project',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

export default router;

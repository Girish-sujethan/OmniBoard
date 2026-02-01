import express from 'express';
import multer from 'multer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mcpService from '../services/mcpService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

function sanitizeFilename(filename) {
  return String(filename).replaceAll('/', '_').replaceAll('\\', '_');
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      if (!req.reportId) {
        req.reportId = `report_${Date.now()}`;
      }

      const uploadDir = join(__dirname, '..', 'uploads', req.reportId);
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, sanitizeFilename(file.originalname));
    },
  }),
  limits: {
    files: 10,
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

/**
 * Helper to find .kicad_pro file
 */
function findKiCadProject(files) {
  return files.find(f => f.originalname.endsWith('.kicad_pro'));
}

function findKiCadPcb(files) {
  return files.find(f => f.originalname.endsWith('.kicad_pcb'));
}

/**
 * POST /api/reports/bom
 * Generate BOM report via MCP
 */
router.post('/bom', upload.array('files'), async (req, res) => {
  try {
    const files = req.files ?? [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const projectFile = findKiCadProject(files);
    if (!projectFile) {
      return res.status(400).json({ 
        error: 'No .kicad_pro file found',
        message: 'Please upload a KiCad project file (.kicad_pro) for BOM generation'
      });
    }

    const format = req.query.format || 'csv';
    const includeAnalysis = req.query.analyze === 'true';

    let result = {
      bom: null,
      analysis: null
    };

    try {
      result.bom = await mcpService.generateBom(projectFile.path, format);
    } catch (error) {
      console.error('BOM generation failed:', error);
      result.bom = { error: error.message };
    }

    if (includeAnalysis) {
      try {
        result.analysis = await mcpService.analyzeBom(projectFile.path);
      } catch (error) {
        console.error('BOM analysis failed:', error);
        result.analysis = { error: error.message };
      }
    }

    res.json({
      success: true,
      reportId: req.reportId,
      project: {
        name: projectFile.originalname,
        path: projectFile.path
      },
      ...result
    });
  } catch (error) {
    console.error('BOM report error:', error);
    res.status(500).json({
      error: 'Failed to generate BOM report',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

/**
 * POST /api/reports/drc
 * Run DRC and get history via MCP
 */
router.post('/drc', upload.array('files'), async (req, res) => {
  try {
    const files = req.files ?? [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const pcbFile = findKiCadPcb(files);
    if (!pcbFile) {
      return res.status(400).json({ 
        error: 'No .kicad_pcb file found',
        message: 'Please upload a KiCad PCB file (.kicad_pcb) for DRC'
      });
    }

    const includeHistory = req.query.history === 'true';

    let result = {
      drc: null,
      history: null
    };

    try {
      result.drc = await mcpService.runDrc(pcbFile.path);
    } catch (error) {
      console.error('DRC failed:', error);
      result.drc = { error: error.message };
    }

    if (includeHistory) {
      try {
        result.history = await mcpService.getDrcHistory(pcbFile.path);
      } catch (error) {
        console.error('DRC history fetch failed:', error);
        result.history = { error: error.message };
      }
    }

    res.json({
      success: true,
      reportId: req.reportId,
      pcb: {
        name: pcbFile.originalname,
        path: pcbFile.path
      },
      ...result
    });
  } catch (error) {
    console.error('DRC report error:', error);
    res.status(500).json({
      error: 'Failed to run DRC',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

/**
 * GET /api/reports/drc/history
 * Get DRC history for a project
 */
router.get('/drc/history', async (req, res) => {
  try {
    const { projectPath } = req.query;
    
    if (!projectPath) {
      return res.status(400).json({
        error: 'Missing project path',
        message: 'Please provide projectPath query parameter'
      });
    }

    const history = await mcpService.getDrcHistory(projectPath);
    
    res.json({
      success: true,
      history
    });
  } catch (error) {
    console.error('Failed to get DRC history:', error);
    res.status(500).json({
      error: 'Failed to get DRC history',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

/**
 * POST /api/reports/netlist
 * Extract netlist via MCP
 */
router.post('/netlist', upload.array('files'), async (req, res) => {
  try {
    const files = req.files ?? [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const projectFile = findKiCadProject(files);
    if (!projectFile) {
      return res.status(400).json({ 
        error: 'No .kicad_pro file found',
        message: 'Please upload a KiCad project file (.kicad_pro) for netlist extraction'
      });
    }

    const format = req.query.format || 'kicad';
    const includeAnalysis = req.query.analyze === 'true';

    let result = {
      netlist: null,
      analysis: null
    };

    try {
      result.netlist = await mcpService.extractNetlist(projectFile.path, format);
    } catch (error) {
      console.error('Netlist extraction failed:', error);
      result.netlist = { error: error.message };
    }

    if (includeAnalysis) {
      try {
        result.analysis = await mcpService.analyzeNetlist(projectFile.path);
      } catch (error) {
        console.error('Netlist analysis failed:', error);
        result.analysis = { error: error.message };
      }
    }

    res.json({
      success: true,
      reportId: req.reportId,
      project: {
        name: projectFile.originalname,
        path: projectFile.path
      },
      ...result
    });
  } catch (error) {
    console.error('Netlist report error:', error);
    res.status(500).json({
      error: 'Failed to extract netlist',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

export default router;

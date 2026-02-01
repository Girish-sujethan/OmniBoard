import express from 'express';
import multer from 'multer';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { validateUploadedDesign } from '../services/pcbValidator.js';
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
      if (!req.validationId) {
        req.validationId = `validation_${Date.now()}`;
      }

      const uploadDir = join(__dirname, '..', 'uploads', req.validationId);
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, sanitizeFilename(file.originalname));
    },
  }),
  limits: {
    files: 20,
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

/**
 * POST /api/pcb/validate
 * Upload KiCad files and generate firmware plan + PRD summary outputs.
 *
 * Expected form-data:
 * - files: one or more files (recommended: .kicad_pro + .kicad_sch + .kicad_pcb)
 */
router.post('/validate', upload.array('files'), async (req, res) => {
  try {
    const files = req.files ?? [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const result = await validateUploadedDesign({
      validationId: req.validationId,
      uploadedFiles: files,
    });

    res.json(result);
  } catch (error) {
    console.error('PCB planning error:', error);
    res.status(500).json({
      error: 'Failed to generate plan',
      message: error.message,
    });
  }
});

/**
 * Helper function to find KiCad project file from uploaded files
 */
function findKiCadProject(files) {
  return files.find(f => f.originalname.endsWith('.kicad_pro'));
}

function findKiCadPcb(files) {
  return files.find(f => f.originalname.endsWith('.kicad_pcb'));
}

/**
 * POST /api/pcb/analyze
 * Analyze uploaded PCB using MCP tools
 *
 * Expected form-data:
 * - files: one or more KiCad files
 * Query params:
 * - comprehensive: if true, run full analysis (BOM, netlist, patterns)
 */
router.post('/analyze', upload.array('files'), async (req, res) => {
  try {
    const files = req.files ?? [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const projectFile = findKiCadProject(files);
    const comprehensive = req.query.comprehensive === 'true';

    if (!projectFile) {
      return res.status(400).json({ 
        error: 'No .kicad_pro file found',
        message: 'Please upload a KiCad project file (.kicad_pro) for analysis'
      });
    }

    let mcpAnalysis;
    if (comprehensive) {
      mcpAnalysis = await mcpService.analyzeProjectComprehensive(projectFile.path);
    } else {
      mcpAnalysis = {
        projectPath: projectFile.path,
        timestamp: new Date().toISOString(),
        validation: null
      };
      try {
        mcpAnalysis.validation = await mcpService.validateProject(projectFile.path);
      } catch (error) {
        console.error('MCP validation failed:', error);
        mcpAnalysis.validation = { error: error.message };
      }
    }

    res.json({
      success: true,
      validationId: req.validationId,
      project: {
        name: projectFile.originalname,
        path: projectFile.path,
        files: files.map(f => ({ name: f.originalname, size: f.size }))
      },
      mcpAnalysis
    });
  } catch (error) {
    console.error('MCP analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze PCB',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

/**
 * POST /api/pcb/drc
 * Run Design Rule Check on uploaded PCB using MCP
 *
 * Expected form-data:
 * - files: one or more KiCad files (must include .kicad_pcb)
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

    const drcResult = await mcpService.runDrc(pcbFile.path);

    res.json({
      success: true,
      validationId: req.validationId,
      pcb: {
        name: pcbFile.originalname,
        path: pcbFile.path
      },
      drc: drcResult
    });
  } catch (error) {
    console.error('DRC error:', error);
    res.status(500).json({
      error: 'Failed to run DRC',
      message: error.message,
      mcpAvailable: process.env.MCP_ENABLED !== 'false'
    });
  }
});

export default router;

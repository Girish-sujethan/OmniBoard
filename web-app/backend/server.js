import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import chatRoutes from './routes/chat.js';
import fileRoutes from './routes/files.js';
import pcbRoutes from './routes/pcb.js';
import projectsRoutes from './routes/projects.js';
import reportsRoutes from './routes/reports.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure required directories exist
const dirs = ['uploads', 'generated'];
dirs.forEach(dir => {
  const dirPath = join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/pcb', pcbRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      backend: true,
      mcp: process.env.MCP_ENABLED !== 'false'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      ollamaModel: process.env.OLLAMA_LLM_MODEL || 'not set',
      mcpEnabled: process.env.MCP_ENABLED !== 'false'
    }
  };
  res.json(health);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 8090PCB Backend server running on port ${PORT}`);
  console.log(`🧠 Ollama model: ${process.env.OLLAMA_LLM_MODEL || 'not set'}`);
  console.log(`🖼️  KiCad CLI: ${process.env.KICAD_CLI_PATH || 'kicad-cli (PATH)'}`);
});

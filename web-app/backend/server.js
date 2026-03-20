import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (nginx) for correct client IP in rate limiting
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : undefined;
app.use(cors(allowedOrigins ? { origin: allowedOrigins } : {}));

// Rate limiting — general API (generous for low-traffic portfolio)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// LLM endpoints — still capped to prevent abuse / runaway Groq usage
const llmLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit reached for AI processing. Please wait before retrying.' },
});

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limit to all /api routes
app.use('/api', apiLimiter);

// Ensure required directories exist
const dirs = ['uploads', 'generated'];
dirs.forEach(dir => {
  const dirPath = join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Routes — apply stricter rate limit to LLM-heavy endpoints
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/pcb', llmLimiter, pcbRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/reports', llmLimiter, reportsRoutes);

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
    ...(process.env.NODE_ENV !== 'production' && { message: err.message }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 8090PCB Backend server running on port ${PORT}`);
  console.log(`🧠 Ollama model: ${process.env.OLLAMA_LLM_MODEL || 'not set'}`);
  console.log(`🖼️  KiCad CLI: ${process.env.KICAD_CLI_PATH || 'kicad-cli (PATH)'}`);
});

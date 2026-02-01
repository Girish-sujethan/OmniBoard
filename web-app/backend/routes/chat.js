import express from 'express';
import { runAgent } from '../services/llmAgent.js';
import mcpToolExecutor from '../services/mcpToolExecutor.js';

const router = express.Router();

// Store conversation history (in production, use a database)
const conversations = new Map();

/**
 * POST /api/chat/message
 * Process a chat message and generate PCB design
 */
router.post('/message', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const convId = conversationId || `conv_${Date.now()}`;
    
    // Get or create conversation history
    if (!conversations.has(convId)) {
      conversations.set(convId, []);
    }
    const history = conversations.get(convId);

    // Add user message to history
    history.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });

    const agentResponse = await runAgent({
      mode: 'chat',
      message,
      history,
    });
    if (!agentResponse?.message) {
      throw new Error('Agent response missing message');
    }

    const result = {
      message: agentResponse.message,
      files: agentResponse.files || null,
      designId: agentResponse.design_id || null,
    };

    // Add assistant response to history
    const assistantMessage = {
      role: 'assistant',
      content: result.message,
      timestamp: new Date().toISOString(),
      files: result.files,
      designId: result.designId,
    };
    history.push(assistantMessage);

    res.json({
      success: true,
      conversationId: convId,
      response: assistantMessage,
      history: history
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message
    });
  }
});

/**
 * GET /api/chat/history/:conversationId
 * Retrieve conversation history
 */
router.get('/history/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  
  const history = conversations.get(conversationId);
  
  if (!history) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json({
    conversationId,
    history
  });
});

/**
 * DELETE /api/chat/history/:conversationId
 * Clear conversation history
 */
router.delete('/history/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  
  conversations.delete(conversationId);
  
  res.json({
    success: true,
    message: 'Conversation history cleared'
  });
});

/**
 * GET /api/chat/tools
 * List available tools (MCP tools + agent capabilities)
 */
router.get('/tools', async (req, res) => {
  try {
    const mcpTools = mcpToolExecutor.getToolDefinitions();
    res.json({ tools: mcpTools });
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({
      error: 'Failed to fetch tools',
      message: error.message,
    });
  }
});

/**
 * GET /api/chat/tools/prompt
 * Get formatted tool descriptions for LLM agent
 */
router.get('/tools/prompt', async (req, res) => {
  try {
    const toolPrompt = mcpToolExecutor.getToolPrompt();
    res.json({ prompt: toolPrompt });
  } catch (error) {
    console.error('Error generating tool prompt:', error);
    res.status(500).json({
      error: 'Failed to generate tool prompt',
      message: error.message,
    });
  }
});

export default router;

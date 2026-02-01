import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send a chat message
   */
  async sendMessage(message, conversationId = null) {
    const response = await this.client.post('/chat/message', {
      message,
      conversationId,
    });
    return response.data;
  }

  /**
   * Get conversation history
   */
  async getHistory(conversationId) {
    const response = await this.client.get(`/chat/history/${conversationId}`);
    return response.data;
  }

  /**
   * Clear conversation
   */
  async clearHistory(conversationId) {
    const response = await this.client.delete(`/chat/history/${conversationId}`);
    return response.data;
  }

  /**
   * Download a file
   */
  getFileDownloadUrl(filename) {
    return `${API_BASE_URL}/files/${filename}`;
  }

  /**
   * Preview file content
   */
  async previewFile(filename) {
    const response = await this.client.get(`/files/preview/${filename}`);
    return response.data;
  }

  /**
   * List generated files
   */
  async listFiles() {
    const response = await this.client.get('/files');
    return response.data;
  }

  /**
   * Get available tools (legacy)
   */
  async getTools() {
    const response = await this.client.get('/chat/tools');
    return response.data;
  }

  /**
   * Generate a firmware plan from KiCad uploads
   */
  async validatePcb(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post('/pcb/validate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // ==================== MCP Project APIs ====================

  /**
   * List all KiCad projects via MCP
   */
  async listProjects() {
    const response = await this.client.get('/projects/list');
    return response.data;
  }

  /**
   * Get detailed project information via MCP
   */
  async getProjectDetails(projectPath) {
    const response = await this.client.get(`/projects/${encodeURIComponent(projectPath)}`);
    return response.data;
  }

  /**
   * Open a KiCad project in KiCad application
   */
  async openProject(projectPath) {
    const response = await this.client.post('/projects/open', { projectPath });
    return response.data;
  }

  // ==================== MCP Analysis APIs ====================

  /**
   * Analyze uploaded PCB using MCP tools
   */
  async analyzePcb(files, comprehensive = false) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post('/pcb/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { comprehensive },
    });

    return response.data;
  }

  /**
   * Run Design Rule Check using MCP
   */
  async runDrc(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post('/pcb/drc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // ==================== MCP Report APIs ====================

  /**
   * Generate BOM report via MCP
   */
  async generateBom(files, format = 'csv', analyze = false) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post('/reports/bom', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { format, analyze },
    });

    return response.data;
  }

  /**
   * Generate DRC report with history via MCP
   */
  async generateDrcReport(files, includeHistory = false) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post('/reports/drc', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { history: includeHistory },
    });

    return response.data;
  }

  /**
   * Get DRC history for a project
   */
  async getDrcHistory(projectPath) {
    const response = await this.client.get('/reports/drc/history', {
      params: { projectPath },
    });
    return response.data;
  }

  /**
   * Extract netlist via MCP
   */
  async extractNetlist(files, format = 'kicad', analyze = false) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post('/reports/netlist', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { format, analyze },
    });

    return response.data;
  }

  /**
   * Get available MCP tools
   */
  async listMcpTools() {
    const response = await this.client.get('/chat/tools');
    return response.data.tools || [];
  }
}

export default new ApiService();

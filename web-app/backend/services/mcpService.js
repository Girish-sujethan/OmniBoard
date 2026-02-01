import { withMcpClient, parseToolTextContent } from './mcpBridge.js';

/**
 * MCP Service - Wrapper for KiCad MCP server interactions
 * Provides convenient methods to call MCP tools for PCB analysis
 */

class MCPService {
  /**
   * List all available KiCad projects
   */
  async listProjects() {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'list_projects',
        arguments: {}
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return content;
      }
    });
  }

  /**
   * Get detailed structure of a specific project
   */
  async getProjectStructure(projectPath) {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'get_project_structure',
        arguments: { project_path: projectPath }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { error: 'Failed to parse project structure', raw: content };
      }
    });
  }

  /**
   * Validate and analyze a KiCad project
   */
  async validateProject(projectPath) {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'validate_project',
        arguments: { project_path: projectPath }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { analysis: content, status: 'completed' };
      }
    });
  }

  /**
   * Analyze PCB design (component density, etc.)
   */
  async analyzePcb(projectPath, pcbPath) {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'analyze_pcb',
        arguments: {
          project_path: projectPath,
          pcb_path: pcbPath
        }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { analysis: content, status: 'completed' };
      }
    });
  }

  /**
   * Generate Bill of Materials
   */
  async generateBom(projectPath, format = 'csv') {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'export_bom',
        arguments: {
          project_path: projectPath,
          format: format
        }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { bom: content, status: 'completed' };
      }
    });
  }

  /**
   * Analyze BOM for insights
   */
  async analyzeBom(projectPath) {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'analyze_bom',
        arguments: { project_path: projectPath }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { analysis: content, status: 'completed' };
      }
    });
  }

  /**
   * Run Design Rule Check (DRC)
   */
  async runDrc(pcbPath) {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'run_drc',
        arguments: { pcb_path: pcbPath }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { drc: content, status: 'completed' };
      }
    });
  }

  /**
   * Get DRC history for comparison
   */
  async getDrcHistory(projectPath) {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'get_drc_history',
        arguments: { project_path: projectPath }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { history: content, status: 'completed' };
      }
    });
  }

  /**
   * Extract netlist from schematic
   */
  async extractNetlist(projectPath, format = 'kicad') {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'export_netlist',
        arguments: {
          project_path: projectPath,
          format: format
        }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { netlist: content, status: 'completed' };
      }
    });
  }

  /**
   * Analyze netlist for connections
   */
  async analyzeNetlist(projectPath) {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'analyze_netlist',
        arguments: { project_path: projectPath }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { analysis: content, status: 'completed' };
      }
    });
  }

  /**
   * Recognize circuit patterns in schematic
   */
  async recognizePatterns(projectPath) {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'recognize_patterns',
        arguments: { project_path: projectPath }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { patterns: content, status: 'completed' };
      }
    });
  }

  /**
   * Export PCB to various formats (Gerber, etc.)
   */
  async exportPcb(pcbPath, format = 'gerber') {
    return withMcpClient(async (client) => {
      const result = await client.callTool({
        name: 'export_pcb',
        arguments: {
          pcb_path: pcbPath,
          format: format
        }
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { export: content, status: 'completed' };
      }
    });
  }

  /**
   * Generate PCB thumbnail/render
   */
  async renderPcb(pcbPath, layers = null) {
    return withMcpClient(async (client) => {
      const args = { pcb_path: pcbPath };
      if (layers) {
        args.layers = layers;
      }
      
      const result = await client.callTool({
        name: 'render_pcb',
        arguments: args
      });
      const content = parseToolTextContent(result);
      try {
        return JSON.parse(content);
      } catch {
        return { render: content, status: 'completed' };
      }
    });
  }

  /**
   * List available MCP tools
   */
  async listTools() {
    return withMcpClient(async (client) => {
      const result = await client.listTools();
      return result.tools || [];
    });
  }

  /**
   * Batch analyze a project with multiple tools
   */
  async analyzeProjectComprehensive(projectPath) {
    const results = {
      projectPath,
      timestamp: new Date().toISOString(),
      validation: null,
      bom: null,
      netlist: null,
      patterns: null
    };

    try {
      results.validation = await this.validateProject(projectPath);
    } catch (error) {
      console.error('Validation failed:', error);
      results.validation = { error: error.message };
    }

    try {
      results.bom = await this.analyzeBom(projectPath);
    } catch (error) {
      console.error('BOM analysis failed:', error);
      results.bom = { error: error.message };
    }

    try {
      results.netlist = await this.analyzeNetlist(projectPath);
    } catch (error) {
      console.error('Netlist analysis failed:', error);
      results.netlist = { error: error.message };
    }

    try {
      results.patterns = await this.recognizePatterns(projectPath);
    } catch (error) {
      console.error('Pattern recognition failed:', error);
      results.patterns = { error: error.message };
    }

    return results;
  }
}

export default new MCPService();

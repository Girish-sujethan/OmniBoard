import mcpService from './mcpService.js';

/**
 * MCP Tool Executor - Executes MCP tool calls from Python agent
 * Bridges between Python LlamaIndex agent and JavaScript MCP bridge
 */

class MCPToolExecutor {
  constructor() {
    this.toolDefinitions = [
      {
        name: 'list_projects',
        description: 'List all available KiCad projects on this system',
        parameters: {}
      },
      {
        name: 'validate_project',
        description: 'Validate and analyze a KiCad project for errors and warnings',
        parameters: {
          project_path: {
            type: 'string',
            description: 'Path to the .kicad_pro file',
            required: true
          }
        }
      },
      {
        name: 'generate_bom',
        description: 'Generate Bill of Materials for a KiCad project',
        parameters: {
          project_path: {
            type: 'string',
            description: 'Path to the .kicad_pro file',
            required: true
          },
          format: {
            type: 'string',
            description: 'Output format (csv, html, etc.)',
            required: false,
            default: 'csv'
          }
        }
      },
      {
        name: 'analyze_bom',
        description: 'Analyze BOM for insights and component statistics',
        parameters: {
          project_path: {
            type: 'string',
            description: 'Path to the .kicad_pro file',
            required: true
          }
        }
      },
      {
        name: 'run_drc',
        description: 'Run Design Rule Check on a PCB file',
        parameters: {
          pcb_path: {
            type: 'string',
            description: 'Path to the .kicad_pcb file',
            required: true
          }
        }
      },
      {
        name: 'get_drc_history',
        description: 'Get DRC history for comparison across runs',
        parameters: {
          project_path: {
            type: 'string',
            description: 'Path to the project',
            required: true
          }
        }
      },
      {
        name: 'extract_netlist',
        description: 'Extract netlist from schematic',
        parameters: {
          project_path: {
            type: 'string',
            description: 'Path to the .kicad_pro file',
            required: true
          },
          format: {
            type: 'string',
            description: 'Output format (kicad, etc.)',
            required: false,
            default: 'kicad'
          }
        }
      },
      {
        name: 'analyze_netlist',
        description: 'Analyze netlist for connections and topology',
        parameters: {
          project_path: {
            type: 'string',
            description: 'Path to the .kicad_pro file',
            required: true
          }
        }
      },
      {
        name: 'recognize_patterns',
        description: 'Identify circuit patterns in schematic (power supplies, amplifiers, etc.)',
        parameters: {
          project_path: {
            type: 'string',
            description: 'Path to the .kicad_pro file',
            required: true
          }
        }
      }
    ];
  }

  /**
   * Get tool definitions for LLM agent
   */
  getToolDefinitions() {
    return this.toolDefinitions;
  }

  /**
   * Execute a tool by name
   */
  async executeTool(toolName, parameters = {}) {
    console.log(`Executing MCP tool: ${toolName}`, parameters);
    
    try {
      let result;

      switch (toolName) {
        case 'list_projects':
          result = await mcpService.listProjects();
          break;
        case 'validate_project':
          result = await mcpService.validateProject(parameters.project_path);
          break;
        case 'generate_bom':
          result = await mcpService.generateBom(
            parameters.project_path,
            parameters.format || 'csv'
          );
          break;
        case 'analyze_bom':
          result = await mcpService.analyzeBom(parameters.project_path);
          break;
        case 'run_drc':
          result = await mcpService.runDrc(parameters.pcb_path);
          break;
        case 'get_drc_history':
          result = await mcpService.getDrcHistory(parameters.project_path);
          break;
        case 'extract_netlist':
          result = await mcpService.extractNetlist(
            parameters.project_path,
            parameters.format || 'kicad'
          );
          break;
        case 'analyze_netlist':
          result = await mcpService.analyzeNetlist(parameters.project_path);
          break;
        case 'recognize_patterns':
          result = await mcpService.recognizePatterns(parameters.project_path);
          break;
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }

      console.log(`MCP tool ${toolName} completed successfully`);
      return {
        success: true,
        tool: toolName,
        result
      };

    } catch (error) {
      console.error(`MCP tool ${toolName} failed:`, error);
      return {
        success: false,
        tool: toolName,
        error: error.message
      };
    }
  }

  /**
   * Execute multiple tools in sequence
   */
  async executeTools(toolCalls) {
    const results = [];

    for (const toolCall of toolCalls) {
      const { name, parameters = {} } = toolCall;
      const result = await this.executeTool(name, parameters);
      results.push(result);
    }

    return results;
  }

  /**
   * Get formatted tool descriptions for system prompt
   */
  getToolPrompt() {
    const descriptions = this.toolDefinitions.map(tool => {
      let desc = `- ${tool.name}: ${tool.description}`;
      if (tool.parameters && Object.keys(tool.parameters).length > 0) {
        const params = Object.entries(tool.parameters)
          .filter(([, param]) => param.required)
          .map(([name, param]) => `${name} (${param.type})`)
          .join(', ');
        if (params) {
          desc += ` (requires: ${params})`;
        }
      }
      return desc;
    });
    
    return `Available MCP tools for KiCad analysis:\n${descriptions.join('\n')}`;
  }
}

export default new MCPToolExecutor();

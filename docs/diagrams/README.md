# 8090PCB Architecture Diagrams

This directory contains comprehensive UML diagrams documenting the 8090PCB system architecture, user flows, and technical interactions.

## Diagram Overview

### 1. System Architecture Diagram (`01_system_architecture.puml`)
**Purpose**: High-level overview of the entire 8090PCB system
**Shows**:
- Frontend, Backend, MCP Server, and AI Agent layers
- External integrations (KiCad CLI, Ollama, File System)
- Component relationships and data flow
- Technology stack and deployment architecture

### 2. Component Architecture Diagram (`02_component_architecture.puml`)
**Purpose**: Detailed internal structure of system components
**Shows**:
- Class-level architecture for each major component
- Package dependencies and module relationships
- Interface definitions and implementations
- Data models and enums

### 3. User Flow Diagram (`03_user_flow.puml`)
**Purpose**: Complete user journey through the system
**Shows**:
- Primary user flows (PCB validation, firmware planning)
- Secondary flows (chat interface, file management)
- Decision points and error handling
- Actor roles and permissions

### 4. Sequence Diagram (`04_sequence_diagram.puml`)
**Purpose**: Step-by-step message flow for PCB validation pipeline
**Shows**:
- Detailed interaction sequence between components
- File upload processing pipeline
- AI analysis and result generation
- Error handling and recovery flows

### 5. Data Flow Diagram (`05_data_flow.puml`)
**Purpose**: Information flow through the system
**Shows**:
- Data transformations at each stage
- Storage and retrieval patterns
- External data sources and sinks
- Performance optimization points

### 6. API Interaction Diagram (`06_api_interaction.puml`)
**Purpose**: RESTful API endpoints and service interactions
**Shows**:
- Complete API endpoint mapping
- Request/response patterns
- Service layer orchestration
- Error handling and rate limiting

## How to Use These Diagrams

### Rendering the Diagrams

These diagrams are created in PlantUML format and can be rendered using any PlantUML-compatible tool:

#### Online Tools
- [PlantUML Online Server](https://www.plantuml.com/plantuml/)
- [PlantText](https://www.planttext.com/)

#### VS Code Extension
1. Install the "PlantUML" extension from the Visual Studio Marketplace
2. Open any `.puml` file
3. Use the command palette (Ctrl+Shift+P) and search for "PlantUML: Preview"

#### Command Line
```bash
# Install PlantUML (requires Java)
brew install plantuml

# Render diagram to PNG
plantuml -tpng 01_system_architecture.puml

# Render diagram to SVG
plantuml -tsvg 01_system_architecture.puml

# Render all diagrams
for file in *.puml; do
    plantuml -tpng "$file"
done
```

#### Docker
```bash
# Using PlantUML Docker image
docker run --rm -v $(pwd):/data plantuml/plantuml -tpng /data/01_system_architecture.puml
```

### Integration with Documentation

These diagrams can be integrated into various documentation systems:

#### Markdown
```markdown
![System Architecture](diagrams/01_system_architecture.png)
```

#### GitLab/GitHub
- Upload rendered images to the repository
- Reference in README files and wikis
- Use PlantUML mermaid integration if available

#### Confluence
- Use PlantUML macro
- Upload rendered images as attachments

## System Architecture Summary

### Core Components

1. **React Frontend** (`web-app/frontend/`)
   - Modern web interface with drag-drop file upload
   - Real-time validation feedback
   - Results display and file management

2. **Express Backend** (`web-app/backend/`)
   - RESTful API server
   - File upload and processing
   - Service orchestration

3. **MCP Server** (`kicad_mcp/`)
   - Model Context Protocol implementation
   - KiCad file analysis tools
   - Design rule checking and BOM generation

4. **AI Agent** (`web-app/backend/agent/`)
   - LlamaIndex-powered RAG system
   - STM32 documentation integration
   - Firmware planning and PRD generation

### Key Technologies

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, ES6 modules
- **MCP Server**: Python 3.10+, FastMCP, pandas
- **AI/LLM**: LlamaIndex, Ollama, RAG
- **EDA Integration**: KiCad CLI, file parsing

### Data Flow

1. **Upload**: User uploads KiCad files via React interface
2. **Validation**: Backend validates file types and structure
3. **Analysis**: MCP server extracts components and runs DRC
4. **AI Processing**: LlamaIndex generates firmware plan with RAG
5. **Results**: System returns structured outputs and visualizations

### API Endpoints

- `POST /api/pcb/validate` - Main PCB validation endpoint
- `GET /api/files/:filename` - File download
- `GET /api/files/preview/:filename` - File preview
- `POST /api/chat/message` - Chat interface
- `GET /health` - System health check

## Maintenance and Updates

### When to Update Diagrams

- **Architecture Changes**: Update when adding/removing major components
- **API Changes**: Update when modifying endpoints or request/response formats
- **User Flow Changes**: Update when modifying user interactions
- **Technology Stack Changes**: Update when changing frameworks or dependencies

### Version Control

- All diagrams are version-controlled with the main repository
- Use descriptive commit messages for diagram changes
- Tag releases with corresponding diagram versions

### Review Process

1. **Technical Review**: Ensure accuracy of technical details
2. **Architecture Review**: Validate component relationships
3. **User Experience Review**: Confirm user flow accuracy
4. **Documentation Review**: Check clarity and completeness

## Contributing

When contributing to the 8090PCB project:

1. Update relevant diagrams when making architectural changes
2. Ensure PlantUML syntax is valid before committing
3. Test diagram rendering with multiple tools
4. Update this README when adding new diagrams
5. Follow the established naming convention (`##_description.puml`)

## Troubleshooting

### Common Issues

- **Rendering Errors**: Check PlantUML syntax and validate with online tool
- **Missing Dependencies**: Ensure Java is installed for PlantUML
- **Font Issues**: Use default fonts for cross-platform compatibility
- **Large Diagrams**: Break complex diagrams into multiple smaller ones

### Performance Tips

- Use `!theme plain` for faster rendering
- Limit diagram complexity for better readability
- Optimize image size when exporting to raster formats
- Use SVG format for scalable vector graphics

## Support

For questions about these diagrams or the 8090PCB system:

1. Check the main project documentation
2. Review the source code for implementation details
3. Open an issue in the project repository
4. Contact the development team

---

*Last Updated: $(date)*
*Generated for 8090PCB v1.0*
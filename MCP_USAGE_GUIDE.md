# Using MCP Integration in 8090PCB

## Quick Start

1. **Configure Backend**
   ```bash
   cd web-app/backend
   cp .env.example .env
   # Edit .env with your settings
   npm install
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd web-app/frontend
   npm install
   npm run dev
   ```

3. **Ensure MCP Server is Configured**
   - The backend automatically starts the MCP server for each request
   - Configure paths in `web-app/backend/.env`:
     - `KICAD_MCP_SERVER_PATH` - Path to KiCad MCP server
     - `KICAD_MCP_PYTHON` - Python executable path
     - `MCP_ENABLED=true` - Enable MCP features

## Available Features

### 1. Project Browser
**Endpoint:** `/projects` in frontend
- View all your KiCad projects
- See project metadata and files
- Open projects directly in KiCad

### 2. PCB Analysis
**Feature:** "Analyze with MCP" button in PCB Validator
- Validates project structure
- Generates BOM with component counts
- Extracts netlist with connections
- Identifies circuit patterns (power supplies, amplifiers, etc.)
- Runs comprehensive analysis in one click

### 3. Design Rule Check (DRC)
**Endpoint:** `/api/pcb/drc`
- Upload `.kicad_pcb` file
- Get instant DRC report
- Track violations and warnings
- Compare with historical DRC results

### 4. Bill of Materials (BOM)
**Endpoints:**
- `/api/reports/bom` - Generate BOM
- Options: `format` (csv, html), `analyze` (include insights)
- Get component counts, costs, and statistics

### 5. Netlist Analysis
**Endpoint:** `/api/reports/netlist`
- Extract netlist from schematic
- View all connections between components
- Analyze topology and signal paths

### 6. Circuit Pattern Recognition
**Included in comprehensive analysis**
- Automatically identifies:
  - Power supply topologies (buck, boost, linear)
  - Amplifier configurations
  - Filter circuits
  - MCU interfaces
- Shows component references and roles

## Using Chat with MCP

The chat feature can now call MCP tools automatically!

**Example prompts:**
- "List all my KiCad projects"
- "What components are connected to U1 in my design?"
- "Run DRC on my latest PCB and tell me if there are any errors"
- "Generate a BOM for the temperature sensor project"
- "Analyze the netlist for power distribution issues"

**How it works:**
1. You send a message to chat
2. Agent determines which MCP tools to call
3. Tools execute in the background
4. Agent synthesizes results into a response
5. You see tool usage and results in the chat

## API Usage Examples

### List Projects
```bash
curl http://localhost:3001/api/projects/list
```

### Analyze PCB (Comprehensive)
```bash
curl -X POST \
  -F "files=@myproject.kicad_pro" \
  -F "comprehensive=true" \
  http://localhost:3001/api/pcb/analyze
```

### Run DRC
```bash
curl -X POST \
  -F "files=@myboard.kicad_pcb" \
  http://localhost:3001/api/pcb/drc
```

### Generate BOM
```bash
curl -X POST \
  -F "files=@myproject.kicad_pro" \
  -F "format=csv" \
  -F "analyze=true" \
  http://localhost:3001/api/reports/bom
```

## Configuration Options

### MCP Server Settings
```env
# Path to KiCad MCP server (relative to backend directory)
KICAD_MCP_SERVER_PATH=../../main.py

# Python executable (use project venv or system python)
KICAD_MCP_PYTHON=.venv/bin/python

# Timeout for MCP operations (milliseconds)
KICAD_MCP_TIMEOUT_MS=30000

# Enable/disable MCP features
MCP_ENABLED=true

# Additional search paths for KiCad projects
KICAD_SEARCH_PATHS=~/Documents/PCB,~/Electronics,~/Projects/KiCad
```

### Troubleshooting

**MCP not working:**
1. Check `MCP_ENABLED=true` in `.env`
2. Verify Python path: `KICAD_MCP_PYTHON`
3. Test MCP server: `python main.py`
4. Check `kicad-mcp.log` for errors

**Projects not showing:**
1. Add paths to `KICAD_SEARCH_PATHS`
2. Ensure `.kicad_pro` files exist
3. Check file permissions

**Timeouts:**
1. Increase `KICAD_MCP_TIMEOUT_MS` (default 30s)
2. Check KiCad CLI is installed
3. Verify large projects take more time

## Frontend Components

### ProjectBrowser Component
Location: `web-app/frontend/src/components/ProjectBrowser.jsx`
- Displays all KiCad projects
- Shows project metadata (name, path, modified date)
- "Open" button launches KiCad app
- "Details" button shows project structure

### McpAnalysisPanel Component
Location: `web-app/frontend/src/components/McpAnalysisPanel.jsx`
- Tabbed interface for analysis results
- Tabs:
  - **Overview** - Summary of all analyses
  - **Validation** - Project validation results with warnings/errors
  - **BOM** - Component list with counts
  - **Netlist** - Network connections between components
  - **Patterns** - Identified circuit topologies
- Color-coded status indicators (green = available, red = error)

### PcbValidator Enhancement
Location: `web-app/frontend/src/components/PcbValidator.jsx`
- Added "Analyze with MCP" button
- Displays `McpAnalysisPanel` when analysis completes
- Shows alongside existing firmware plan results

## Workflow Examples

### Workflow 1: Analyze Existing Project
1. Go to PCB Validator page
2. Drag and drop `.kicad_pro`, `.kicad_sch`, `.kicad_pcb` files
3. Click "Analyze with MCP"
4. Wait for comprehensive analysis (~30 seconds)
5. Review results in all tabs:
   - Validation: Check for errors
   - BOM: See all components
   - Netlist: View connections
   - Patterns: Identify circuit types

### Workflow 2: Run DRC on Design
1. Go to PCB Validator page
2. Upload `.kicad_pcb` file
3. Click "Analyze with MCP" or use DRC endpoint directly
4. View DRC results in the panel
5. Check violations and warnings
6. Fix issues in KiCad
7. Re-run DRC to verify fixes

### Workflow 3: Generate BOM for Sourcing
1. Upload project files
2. Use `/api/reports/bom` endpoint
3. Set `analyze=true` for component statistics
4. Download generated BOM file
5. Import into procurement/sourcing system

### Workflow 4: Ask Chat to Analyze
1. Open Chat page
2. Type: "Run DRC on my arduino-shield project"
3. Agent automatically finds project and runs DRC
4. Agent explains results in natural language
5. Download DRC report if needed

## Performance Tips

- **Large projects:** Use specific endpoints (e.g., `/api/reports/bom`) instead of comprehensive analysis for faster results
- **Batch operations:** Run multiple specific analyses in parallel from different tabs
- **Cache results:** Reuse analysis results until design changes
- **Network:** Backend and MCP should be on same machine for best performance

## Data Flow

```
User Upload → Backend Saves → MCP Server Analyzes → Results Return → Display in UI
```

### MCP Tools Available
1. `list_projects` - Browse projects
2. `validate_project` - Check project integrity
3. `generate_bom` - Create BOM file
4. `analyze_bom` - Get component insights
5. `run_drc` - Design rule check
6. `get_drc_history` - Compare DRC over time
7. `extract_netlist` - Get connections
8. `analyze_netlist` - Analyze topology
9. `recognize_patterns` - Find circuit types

## Support

For issues:
1. Check `MCP_TESTING_GUIDE.md` for troubleshooting steps
2. Review `MCP_INTEGRATION_SUMMARY.md` for implementation details
3. Check browser console for frontend errors
4. Check backend logs for API errors
5. Check `kicad-mcp.log` for MCP server errors

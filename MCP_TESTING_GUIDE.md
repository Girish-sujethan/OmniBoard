# MCP Integration Testing Guide

## Prerequisites

1. **KiCad MCP Server must be running:**
   ```bash
   cd /Volumes/Samsung\ SSD/GitHub/8090PCB
   python main.py
   ```

2. **Backend server must be configured:**
   ```bash
   cd web-app/backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm start
   ```

3. **Frontend must be running:**
   ```bash
   cd web-app/frontend
   npm install
   npm run dev
   ```

## Test Scenarios

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```
Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-31T...",
  "services": {
    "backend": true,
    "mcp": true
  },
  "environment": {
    "nodeEnv": "development",
    "ollamaModel": "gpt-oss:20b",
    "mcpEnabled": true
  }
}
```

### Test 2: List Projects
```bash
curl http://localhost:3001/api/projects/list
```
Expected response:
```json
{
  "success": true,
  "projects": [...],
  "count": N
}
```

### Test 3: Get MCP Tools
```bash
curl http://localhost:3001/api/chat/tools
```
Expected response:
```json
{
  "tools": [
    {
      "name": "list_projects",
      "description": "List all available KiCad projects on this system",
      "parameters": {}
    },
    ...
  ]
}
```

### Test 4: Upload and Analyze PCB

Using cURL (simplified):
```bash
# Create test KiCad files or use existing ones
cd web-app/backend/uploads
# Copy your .kicad_pro file here

# Then test analyze endpoint
curl -X POST \
  -F "files=@test.kicad_pro" \
  http://localhost:3001/api/pcb/analyze?comprehensive=true
```

Expected response:
```json
{
  "success": true,
  "validationId": "validation_...",
  "project": {
    "name": "test.kicad_pro",
    "path": "...",
    "files": [...]
  },
  "mcpAnalysis": {
    "projectPath": "...",
    "timestamp": "...",
    "validation": {...},
    "bom": {...},
    "netlist": {...},
    "patterns": {...}
  }
}
```

### Test 5: Run DRC
```bash
curl -X POST \
  -F "files=@test.kicad_pcb" \
  http://localhost:3001/api/pcb/drc
```

Expected response:
```json
{
  "success": true,
  "validationId": "validation_...",
  "pcb": {
    "name": "test.kicad_pcb",
    "path": "..."
  },
  "drc": {
    "status": "passed",
    "violations": [],
    "warnings": [...]
  }
}
```

### Test 6: Generate BOM
```bash
curl -X POST \
  -F "files=@test.kicad_pro" \
  -F "format=csv" \
  -F "analyze=true" \
  http://localhost:3001/api/reports/bom
```

Expected response:
```json
{
  "success": true,
  "reportId": "report_...",
  "project": {
    "name": "test.kicad_pro",
    "path": "..."
  },
  "bom": {
    "component_count": N,
    "components": [...]
  },
  "analysis": {
    "statistics": {...}
  }
}
```

## Frontend Testing

### Test 1: Project Browser
1. Navigate to http://localhost:5173/projects
2. Verify projects list displays
3. Click "Details" on a project
4. Verify modal shows project files and metadata
5. Click "Open" to test KiCad integration

### Test 2: PCB Validator with MCP
1. Navigate to http://localhost:5173/validator
2. Drag and drop KiCad files
3. Click "Analyze with MCP" button
4. Wait for analysis to complete
5. Verify McpAnalysisPanel displays with tabs
6. Click through tabs: Overview, Validation, BOM, Netlist, Patterns
7. Verify data displays correctly

### Test 3: Chat Integration
1. Navigate to http://localhost:5173/chat
2. Send message: "List my KiCad projects"
3. Verify agent can access MCP tools
4. Send message: "Run DRC on my recent project"
5. Verify tool execution and results

## Common Issues and Solutions

### Issue: "MCP server not available"
**Solution:**
1. Check `.env` has correct `KICAD_MCP_SERVER_PATH`
2. Verify Python executable exists at `KICAD_MCP_PYTHON`
3. Test MCP server independently: `python main.py`
4. Check `kicad-mcp.log` for errors

### Issue: "Timeout waiting for MCP"
**Solution:**
1. Increase `KICAD_MCP_TIMEOUT_MS` in `.env`
2. Check KiCad CLI is installed and accessible
3. Verify file paths are correct and accessible
4. Test with simpler operations first (list_projects)

### Issue: "No projects found"
**Solution:**
1. Check `KICAD_SEARCH_PATHS` in `.env`
2. Verify KiCad projects exist in those directories
3. Ensure `.kicad_pro` files are present
4. Check file permissions on project directories

### Issue: "Frontend shows loading spinner forever"
**Solution:**
1. Open browser DevTools (F12)
2. Check Network tab for API calls
3. Verify requests to `localhost:3001` succeed
4. Check Console for JavaScript errors
5. Verify CORS is enabled in backend

## Debugging

### Enable MCP Logging
Add to `web-app/backend/.env`:
```env
DEBUG=mcp:*
```

### Check MCP Tool Execution
Add to `mcpService.js`:
```javascript
console.log('MCP tool called:', toolName, parameters);
console.log('MCP tool result:', result);
```

### Verify MCP Server Health
Run MCP server in foreground to see real-time logs:
```bash
python main.py
```

## Performance Testing

### Large Project Analysis
Test with:
- 100+ components BOM
- Complex PCB with 4+ layers
- Netlist with 50+ nets

Expected behavior:
- Completes within 30 seconds
- Shows progress indicators
- Handles errors gracefully

### Concurrent Requests
Test with:
- Multiple browser tabs
- Simultaneous API calls
- Mixed operations (BOM + DRC + netlist)

Expected behavior:
- No race conditions
- Clean request handling
- Proper error isolation

## Success Criteria

✅ Health endpoint returns MCP status
✅ Projects can be listed and viewed
✅ PCB can be uploaded and analyzed
✅ DRC runs and returns results
✅ BOM generation works
✅ Netlist extraction works
✅ MCP analysis panel displays correctly
✅ Errors are handled gracefully
✅ MCP can be disabled via `MCP_ENABLED=false`

## Rollback Plan

If issues occur:
1. Set `MCP_ENABLED=false` in `.env`
2. Backend falls back to non-MCP behavior
3. Existing firmware planning still works
4. Chat works without MCP tools

## Next Steps After Testing

1. Fix any bugs found
2. Optimize performance if slow
3. Improve error messages
4. Add user documentation
5. Deploy to staging environment

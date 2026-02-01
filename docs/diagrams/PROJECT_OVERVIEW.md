# 8090PCB Project Overview

```mermaid
graph TB
    %% Title and Configuration
    title[8090PCB - PCB Design & Firmware Planning Platform]
    
    %% User Actors
    User[👤 PCB Designer]
    Dev[👨‍💻 Firmware Developer]
    Admin[⚙️ System Admin]
    
    %% Frontend Layer
    subgraph Frontend[React Frontend Layer]
        ReactApp[React Web App]
        PcbValidator[PcbValidator Component]
        ChatInterface[ChatInterface Component]
        FileCard[FileCard Component]
        ApiClient[API Client Service]
    end
    
    %% Backend API Layer
    subgraph Backend[Express Backend API Layer]
        ExpressServer[Express.js Server]
        FileUpload[File Upload Service]
        McpBridge[MCP Bridge Service]
        LlmAgent[LLM Agent Service]
        KicadRender[KiCad Render Service]
        PcbValidation[PCB Validator Service]
    end
    
    %% MCP Server Layer
    subgraph McpServer[MCP Server Layer - Python]
        FastMcp[FastMCP Server]
        ProjectRes[Project Resources]
        AnalysisTools[Analysis Tools]
        DrcTools[DRC Tools]
        BomTools[BOM Tools]
        ExportTools[Export Tools]
    end
    
    %% AI Agent Layer
    subgraph AiAgent[AI Agent Layer - Python/LlamaIndex]
        LlamaIndex[LlamaIndex Agent]
        RagSystem[RAG System]
        DocIndexer[Document Indexer]
        PromptMgr[Prompt Manager]
    end
    
    %% External Systems
    subgraph External[External Systems]
        FileSystem[📁 File System]
        KicadCli[KiCad CLI]
        Ollama[🤖 Ollama LLM Service]
        Stm32Docs[📚 STM32 Documentation]
    end
    
    %% Storage Systems
    subgraph Storage[Storage]
        UploadDir[📤 Upload Directory]
        GeneratedFiles[📄 Generated Files]
        ValidationCache[🗄️ Validation Cache]
    end
    
    %% User Interactions
    User --> ReactApp
    Dev --> ReactApp
    Admin --> ReactApp
    
    %% Frontend Internal
    ReactApp --> PcbValidator
    ReactApp --> ChatInterface
    ReactApp --> FileCard
    PcbValidator --> ApiClient
    ChatInterface --> ApiClient
    FileCard --> ApiClient
    
    %% Frontend to Backend
    ApiClient --> ExpressServer
    ExpressServer --> FileUpload
    ExpressServer --> PcbValidation
    ExpressServer --> McpBridge
    ExpressServer --> LlmAgent
    ExpressServer --> KicadRender
    
    %% Backend Internal
    PcbValidation --> LlmAgent
    PcbValidation --> KicadRender
    PcbValidation --> FileUpload
    LlmAgent --> McpBridge
    
    %% Backend to MCP Server
    McpBridge --> FastMcp
    PcbValidation --> AnalysisTools
    PcbValidation --> DrcTools
    PcbValidation --> BomTools
    PcbValidation --> ExportTools
    
    %% MCP Server Internal
    FastMcp --> ProjectRes
    FastMcp --> AnalysisTools
    FastMcp --> DrcTools
    FastMcp --> BomTools
    FastMcp --> ExportTools
    
    %% Backend to AI Agent
    LlmAgent --> LlamaIndex
    LlamaIndex --> RagSystem
    RagSystem --> DocIndexer
    LlamaIndex --> PromptMgr
    
    %% External System Connections
    KicadRender --> KicadCli
    LlamaIndex --> Ollama
    DocIndexer --> Stm32Docs
    FileUpload --> UploadDir
    PcbValidation --> GeneratedFiles
    LlmAgent --> ValidationCache
    
    %% File System Access
    UploadDir --> FileSystem
    GeneratedFiles --> FileSystem
    ValidationCache --> FileSystem
    
    %% Styling
    classDef frontend fill:#E3F2FD,stroke:#1976D2,color:#0D47A1
    classDef backend fill:#F3E5F5,stroke:#7B1FA2,color:#4A148C
    classDef mcp fill:#FFF3E0,stroke:#F57C00,color:#E65100
    classDef ai fill:#E8F5E8,stroke:#388E3C,color:#1B5E20
    classDef external fill:#F5F5F5,stroke:#666666,color:#333333
    classDef storage fill:#FCE4EC,stroke:#C2185B,color:#880E4F
    classDef user fill:#E1F5FE,stroke:#0288D1,color:#01579B
    
    class ReactApp,PcbValidator,ChatInterface,FileCard,ApiClient frontend
    class ExpressServer,FileUpload,McpBridge,LlmAgent,KicadRender,PcbValidation backend
    class FastMcp,ProjectRes,AnalysisTools,DrcTools,BomTools,ExportTools mcp
    class LlamaIndex,RagSystem,DocIndexer,PromptMgr ai
    class FileSystem,KicadCli,Ollama,Stm32Docs external
    class UploadDir,GeneratedFiles,ValidationCache storage
    class User,Dev,Admin user
```

## User Flow Sequence

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant MCP
    participant AI
    participant KiCad
    participant FileSystem
    
    User->>Frontend: Upload KiCad Files
    Frontend->>Backend: POST /api/pcb/validate
    Backend->>FileSystem: Store Files
    Backend->>MCP: Analyze PCB
    MCP->>KiCad: Run DRC Check
    KiCad->>MCP: DRC Results
    MCP->>Backend: Component Analysis
    Backend->>AI: Generate Firmware Plan
    AI->>Backend: AI Results
    Backend->>KiCad: Render PCB (SVG)
    KiCad->>FileSystem: Save Render
    Backend->>FileSystem: Save Results
    Backend->>Frontend: Return Validation Data
    Frontend->>User: Display Results
```

## Data Flow Architecture

```mermaid
flowchart LR
    subgraph Input[Input Layer]
        KiCadFiles[KiCad Files]
        UserQueries[User Queries]
    end
    
    subgraph Processing[Processing Layer]
        Validation[File Validation]
        Parsing[File Parsing]
        Analysis[Component Analysis]
        AI_Processing[AI Processing]
        Rendering[PCB Rendering]
    end
    
    subgraph Storage[Storage Layer]
        Uploads[Upload Directory]
        Generated[Generated Files]
        Cache[Validation Cache]
        VectorDB[Vector Database]
    end
    
    subgraph Output[Output Layer]
        FirmwarePlan[Firmware Plan]
        PRD[PRD Summary]
        PCB_Render[PCB Render]
        ChatResponse[Chat Response]
    end
    
    KiCadFiles --> Validation
    UserQueries --> AI_Processing
    Validation --> Parsing
    Parsing --> Analysis
    Analysis --> AI_Processing
    Analysis --> Rendering
    AI_Processing --> VectorDB
    Rendering --> Generated
    
    Validation --> Uploads
    Analysis --> Cache
    AI_Processing --> Generated
    Rendering --> Generated
    
    AI_Processing --> FirmwarePlan
    AI_Processing --> PRD
    AI_Processing --> ChatResponse
    Rendering --> PCB_Render
```

## API Endpoints Overview

```mermaid
graph TD
    subgraph API[REST API Endpoints]
        Validate[POST /api/pcb/validate]
        Download[GET /api/files/:filename]
        Preview[GET /api/files/preview/:filename]
        ListFiles[GET /api/files]
        Chat[POST /api/chat/message]
        History[GET /api/chat/history/:id]
        Health[GET /health]
    end
    
    subgraph Services[Backend Services]
        FileService[File Service]
        ValidationService[Validation Service]
        ChatService[Chat Service]
        HealthService[Health Service]
    end
    
    Validate --> ValidationService
    Download --> FileService
    Preview --> FileService
    ListFiles --> FileService
    Chat --> ChatService
    History --> ChatService
    Health --> HealthService
```

## Technology Stack

```mermaid
mindmap
  root((8090PCB))
    Frontend
      React 18
      Vite
      Tailwind CSS
      Framer Motion
      Axios
    Backend
      Node.js
      Express.js
      ES6 Modules
      Multer
      MCP SDK
    MCP Server
      Python 3.10+
      FastMCP
      pandas
      pyyaml
      defusedxml
    AI/LLM
      LlamaIndex
      Ollama
      RAG System
      STM32 Docs
    EDA Integration
      KiCad CLI
      File Parsing
      SVG Rendering
      DRC Automation
    Storage
      File System
      Upload Management
      Generated Files
      Validation Cache
```

## Component Relationships

```mermaid
classDiagram
    class ReactApp {
        +main()
        +setupRouter()
    }
    
    class PcbValidator {
        +handleFileUpload()
        +validateFiles()
        +displayResults()
    }
    
    class ExpressServer {
        +start()
        +setupMiddleware()
        +setupRoutes()
    }
    
    class PcbValidatorService {
        +validateFiles()
        +processUpload()
        +generateResults()
    }
    
    class LlmAgentService {
        +spawnAgent()
        +processRequest()
        +handleResponse()
    }
    
    class FastMcpServer {
        +setup()
        +registerResources()
        +registerTools()
    }
    
    class LlamaIndexAgent {
        +initialize()
        +processQuery()
        +generateResponse()
    }
    
    ReactApp --> PcbValidator
    PcbValidator --> ExpressServer
    ExpressServer --> PcbValidatorService
    PcbValidatorService --> LlmAgentService
    LlmAgentService --> FastMcpServer
    FastMcpServer --> LlamaIndexAgent
```

## Key Features

```mermaid
featureDiagram
    8090PCB --> PCB Analysis
    8090PCB --> Firmware Planning
    8090PCB --> Web Interface
    8090PCB --> AI Integration
    
    PCB Analysis --> File Upload
    PCB Analysis --> Design Rule Check
    PCB Analysis --> Component Extraction
    PCB Analysis --> BOM Generation
    
    Firmware Planning --> AI Analysis
    Firmware Planning --> RAG System
    Firmware Planning --> Structured Output
    Firmware Planning --> Risk Assessment
    
    Web Interface --> Drag & Drop
    Web Interface --> Real-time Feedback
    Web Interface --> File Management
    Web Interface --> Results Display
    
    AI Integration --> Local LLM
    AI Integration --> Document Retrieval
    AI Integration --> Context Awareness
    AI Integration --> Multi-modal Output
```

## Performance & Security Considerations

```mermaid
graph LR
    subgraph Performance[Performance Optimization]
        Caching[Result Caching]
        Async[Async Processing]
        Compression[Response Compression]
        RateLimit[Rate Limiting]
    end
    
    subgraph Security[Security Measures]
        Validation[File Type Validation]
        PathSecurity[Path Security]
        SizeLimits[File Size Limits]
        Isolation[Process Isolation]
    end
    
    subgraph Monitoring[Monitoring & Logging]
        Metrics[Performance Metrics]
        Logging[Request Logging]
        Health[Health Checks]
        Alerts[Error Alerts]
    end
    
    Caching --> Metrics
    Async --> Logging
    Validation --> Health
    PathSecurity --> Alerts
```

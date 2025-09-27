# FENRIR Profiling & Exploit Testing Suite

Comprehensive profiling, debugging, and security testing suite for the Reynard backend system. Fenrir provides strategic memory analysis, database monitoring, service tracking, and exploit testing capabilities integrated with the reynard_e2e database.

## Overview

Fenrir provides comprehensive profiling and security testing for the Reynard backend system, including:

- **Memory Profiling**: Strategic memory analysis with tracemalloc integration and database persistence
- **Database Monitoring**: Connection pool analysis, query performance tracking, and optimization recommendations
- **Service Tracking**: Backend startup analysis, service initialization monitoring, and performance metrics
- **Exploit Testing**: Security vulnerability testing with comprehensive attack payloads and result tracking
- **Database Integration**: All profiling and exploit data stored in the reynard_e2e database with full audit trails
- **Real-time Analysis**: Live memory snapshots, performance metrics, and strategic optimization recommendations
- **Advanced LLM Exploitation**: Sophisticated AI service security testing with steganography and property inference
- **MCP Security Testing**: Comprehensive Model Context Protocol server vulnerability assessment
- **E2E Penetration Testing**: Full-stack security testing integration with Playwright and TypeScript

## Technical Architecture

### Comprehensive Security Testing Architecture

```mermaid
graph TB
    subgraph "Fenrir Core Security Framework"
        A[Fuzzy Class] --> B[FenrirProfiler]
        B --> C[MemoryProfiler]
        B --> D[BackendAnalyzer]
        B --> E[DatabaseDebugger]
        B --> F[ServiceTracker]
        B --> G[SecurityExploitOrchestrator]
    end

    subgraph "Advanced LLM Exploitation Arsenal"
        H[LLMExploitationOrchestrator] --> I[Advanced AI Exploits]
        I --> J[SteganographyInjector]
        I --> K[UniversalEncodingExploiter]
        I --> L[UnicodeObfuscationExploiter]
        I --> M[CipherChainExploiter]
        I --> N[UniversalDecoderExploiter]
        I --> O[PROWLPropertyInferenceExploiter]
    end

    subgraph "MCP Security Testing"
        P[MCPServerAttacker] --> Q[TCP Socket Attacks]
        P --> R[JWT Token Manipulation]
        P --> S[FastAPI Backend Integration]
        P --> T[Environment Variable Injection]
        P --> U[Configuration Manipulation]
        P --> V[Rate Limiting Bypass]
    end

    subgraph "E2E Penetration Testing"
        W[SecurityAssessor] --> X[FenrirRunner]
        X --> Y[ExploitRunner]
        Y --> Z[PenetrationTestConfig]
        W --> AA[SecurityTestUtils]
        W --> BB[PenetrationHelpers]
    end

    subgraph "Traditional Exploit Modules"
        CC[JWT Exploits] --> DD[SecretKeyVulnerabilityExploit]
        EE[SQL Injection] --> FF[RegexBypassExploit]
        GG[Path Traversal] --> HH[EncodedPathTraversalExploit]
        II[CORS Exploits] --> JJ[CorsMisconfigurationExploit]
        KK[Rate Limiting] --> LL[RateLimitBypassExploit]
    end

    subgraph "Database Integration"
        MM[FenrirDatabaseService] --> NN[reynard_e2e Database]
        NN --> OO[Profiling Sessions]
        NN --> PP[Memory Snapshots]
        NN --> QQ[Profiling Results]
        NN --> RR[Exploit Sessions]
        NN --> SS[Database Connection Logs]
        NN --> TT[Service Startup Logs]
        NN --> UU[LLM Exploit Results]
        NN --> VV[MCP Attack Results]
    end

    G --> H
    G --> P
    G --> CC
    G --> EE
    G --> GG
    G --> II
    G --> KK
    H --> MM
    P --> MM
    W --> MM
    CC --> MM
    EE --> MM
    GG --> MM
    II --> MM
    KK --> MM
```

### LLM Exploitation Arsenal Architecture

```mermaid
graph TB
    subgraph "Advanced AI Exploitation Framework"
        A[LLMExploitationOrchestrator] --> B[Prompt Injection Arsenal]
        A --> C[Streaming Attack Vectors]
        A --> D[Service Chain Exploitation]
        A --> E[Model-Specific Exploits]
        A --> F[Adversarial AI Testing]
    end

    subgraph "Steganography & Obfuscation"
        G[SteganographyInjector] --> H[Emoji Steganography]
        G --> I[Invisible Text Injection]
        G --> J[Multi-Layer Encoding]
        G --> K[Fantasy Language Obfuscation]
        G --> L[Ancient Script Transformation]
    end

    subgraph "Universal Encoding Exploitation"
        M[UniversalEncodingExploiter] --> N[Base64/Base32/Base58 Chains]
        M --> O[Classical Cipher Combinations]
        M --> P[Advanced Encodings]
        M --> Q[Universal Decoder Exploitation]
    end

    subgraph "Unicode Obfuscation"
        R[UnicodeObfuscationExploiter] --> S[Visual Transformations]
        R --> T[Upside-down Text]
        R --> U[Full-width Characters]
        R --> V[Mathematical Notation]
        R --> W[Fantasy Languages]
    end

    subgraph "PROWL Property Inference"
        X[PROWLPropertyInferenceExploiter] --> Y[Black-Box Generation Attack]
        X --> Z[Shadow-Model Attack]
        X --> AA[Word Frequency Analysis]
        X --> BB[Dataset Property Extraction]
        X --> CC[Medical Data Leakage]
        X --> DD[Business Intelligence Extraction]
    end

    subgraph "Target AI Services"
        EE[Ollama Service] --> FF[/api/ollama/chat]
        EE --> GG[/api/ollama/assistant]
        HH[NLWeb Service] --> II[/api/nlweb/suggest]
        HH --> JJ[/api/nlweb/proxy]
        KK[ComfyUI Service] --> LL[/api/comfy/text2img]
        KK --> MM[/api/comfy/workflow]
        NN[Diffusion LLM] --> OO[/api/diffusion/generate]
        PP[RAG System] --> QQ[/api/rag/query]
        RR[Caption Service] --> SS[/api/caption/generate]
        TT[Summarization] --> UU[/api/summarization/text]
        VV[TTS Service] --> WW[/api/tts/synthesize]
    end

    B --> G
    B --> M
    B --> R
    C --> EE
    C --> HH
    D --> KK
    D --> NN
    E --> PP
    E --> RR
    F --> TT
    F --> VV
    X --> EE
    X --> HH
    X --> KK
```

### MCP Security Testing Architecture

```mermaid
graph TB
    subgraph "MCP Server Attack Vectors"
        A[MCPServerAttacker] --> B[TCP Socket Communication]
        A --> C[JWT Token Manipulation]
        A --> D[FastAPI Backend Integration]
        A --> E[Environment Variable Injection]
        A --> F[Configuration Manipulation]
        A --> G[Rate Limiting Bypass]
    end

    subgraph "TCP Socket Attacks"
        B --> H[Unauthenticated JSON-RPC]
        B --> I[Malformed JSON-RPC Requests]
        B --> J[Protocol Version Manipulation]
        B --> K[Method Parameter Injection]
    end

    subgraph "JWT Security Testing"
        C --> L[Token Signature Manipulation]
        C --> M[Algorithm Confusion Attacks]
        C --> N[Expired Token Reuse]
        C --> O[Token Replay Attacks]
        C --> P[Permission Escalation]
    end

    subgraph "FastAPI Integration Attacks"
        D --> Q[Unauthenticated MCP Tool Calls]
        D --> R[Bootstrap Authentication Bypass]
        D --> S[SQL Injection in MCP Endpoints]
        D --> T[Tool Configuration Manipulation]
    end

    subgraph "Environment & Configuration"
        E --> U[Environment Variable Disclosure]
        E --> V[Configuration Endpoint Access]
        E --> W[Tool Configuration Manipulation]
        E --> X[Security Tool Disabling]
    end

    subgraph "Rate Limiting & DoS"
        G --> Y[Rapid Authentication Requests]
        G --> Z[Concurrent Request Flooding]
        G --> AA[Resource Exhaustion]
        G --> BB[Connection Pool Exhaustion]
    end

    subgraph "MCP Server Components"
        CC[MCP Server :8001] --> DD[JSON-RPC Handler]
        CC --> EE[Tool Registry]
        CC --> FF[Authentication Manager]
        CC --> GG[Configuration Manager]
    end

    subgraph "Backend Integration"
        HH[FastAPI Backend :8000] --> II[/api/mcp/bootstrap/authenticate]
        HH --> JJ[/api/mcp/tools/call]
        HH --> KK[/api/mcp/tool-config/]
        HH --> LL[/api/mcp/stats]
    end

    H --> CC
    I --> CC
    L --> FF
    M --> FF
    Q --> HH
    R --> HH
    U --> HH
    V --> HH
    Y --> CC
    Z --> CC
```

### E2E Penetration Testing Integration

```mermaid
graph TB
    subgraph "E2E Security Testing Framework"
        A[SecurityAssessor] --> B[FenrirRunner]
        B --> C[ExploitRunner]
        C --> D[PenetrationTestConfig]
        A --> E[SecurityTestUtils]
        A --> F[PenetrationHelpers]
    end

    subgraph "Playwright Integration"
        G[Playwright Test Suite] --> H[Security Test Modules]
        H --> I[Fenrir Suite Runner]
        H --> J[Exploit Class Mapper]
        H --> K[Penetration Test Config]
        H --> L[Security Test Utils]
    end

    subgraph "Fenrir Integration"
        M[Fenrir Exploit Execution] --> N[Python Subprocess]
        N --> O[Exploit Module Loading]
        O --> P[Attack Vector Execution]
        P --> Q[Result Parsing]
        Q --> R[JSON Response]
    end

    subgraph "Security Assessment Flow"
        S[Test Execution] --> T[Exploit Discovery]
        T --> U[Attack Vector Selection]
        U --> V[Payload Generation]
        V --> W[Target Interaction]
        W --> X[Vulnerability Detection]
        X --> Y[Result Analysis]
        Y --> Z[Report Generation]
    end

    subgraph "Result Processing"
        AA[PenetrationTestResult] --> BB[Vulnerability Classification]
        BB --> CC[Severity Assessment]
        CC --> DD[Security Rating]
        DD --> EE[Recommendation Generation]
        EE --> FF[Compliance Impact Analysis]
    end

    B --> M
    C --> S
    I --> B
    J --> C
    R --> AA
    Z --> AA
    FF --> G
```

### Memory Profiling System Architecture

```mermaid
graph TB
    subgraph "Fenrir Core"
        A[Fuzzy Class] --> B[FenrirProfiler]
        B --> C[MemoryProfiler]
        B --> D[BackendAnalyzer]
        B --> E[DatabaseDebugger]
        B --> F[ServiceTracker]
    end

    subgraph "Memory Profiling"
        C --> G[Memory Snapshots]
        C --> H[Tracemalloc Integration]
        C --> I[GC Analysis]
        G --> J[ProfilingSession]
    end

    subgraph "Database Integration"
        K[FenrirDatabaseService] --> L[reynard_e2e Database]
        L --> M[Profiling Sessions]
        L --> N[Memory Snapshots]
        L --> O[Profiling Results]
        L --> P[Exploit Sessions]
        L --> Q[Database Connection Logs]
        L --> R[Service Startup Logs]
    end

    subgraph "Backend Integration"
        D --> S[Backend Services]
        E --> T[Database Connections]
        F --> U[Service Lifecycle]
        S --> V[Memory Usage Analysis]
        T --> W[Connection Pool Monitoring]
        U --> X[Startup Performance]
    end

    B --> K
    J --> K
    V --> K
    W --> K
    X --> K
```

### Database Schema Architecture

```mermaid
erDiagram
    FenrirProfilingSession ||--o{ FenrirMemorySnapshot : contains
    FenrirProfilingSession ||--o{ FenrirProfilingResult : contains
    FenrirProfilingSession ||--o{ FenrirExploitSession : contains
    FenrirProfilingSession ||--o{ FenrirDatabaseConnectionLog : contains
    FenrirProfilingSession ||--o{ FenrirServiceStartupLog : contains
    FenrirExploitSession ||--o{ FenrirExploitAttempt : contains

    FenrirProfilingSession {
        uuid id PK
        string session_id UK
        string session_type
        string environment
        datetime started_at
        datetime completed_at
        string status
        float duration_seconds
        int total_snapshots
        int issues_found
        float peak_memory_mb
        float final_memory_mb
        float memory_delta_mb
        jsonb backend_analysis
        jsonb database_analysis
        jsonb service_analysis
        jsonb metadata
    }

    FenrirMemorySnapshot {
        uuid id PK
        uuid profiling_session_id FK
        datetime timestamp
        string context
        float rss_mb
        float vms_mb
        float percent
        float available_mb
        float tracemalloc_mb
        int gc_objects
        jsonb metadata
    }

    FenrirProfilingResult {
        uuid id PK
        uuid profiling_session_id FK
        string category
        string severity
        text issue
        text recommendation
        float memory_impact_mb
        string performance_impact
        jsonb metadata
    }

    FenrirExploitSession {
        uuid id PK
        uuid profiling_session_id FK
        string session_id UK
        string exploit_type
        string target_url
        string target_endpoint
        datetime started_at
        datetime completed_at
        string status
        float duration_seconds
        int total_requests
        int successful_requests
        int failed_requests
        int vulnerabilities_found
        jsonb exploit_results
        jsonb metadata
    }

    FenrirExploitAttempt {
        uuid id PK
        uuid exploit_session_id FK
        int attempt_number
        text payload
        string method
        jsonb headers
        int response_status
        jsonb response_headers
        text response_body
        float response_time_ms
        boolean vulnerability_detected
        string vulnerability_type
        jsonb vulnerability_details
        text error_message
        datetime timestamp
        jsonb metadata
    }

    FenrirDatabaseConnectionLog {
        uuid id PK
        uuid profiling_session_id FK
        string database_name
        string connection_type
        string operation
        text query_text
        float execution_time_ms
        int rows_affected
        int connection_pool_size
        int active_connections
        text error_message
        datetime timestamp
        jsonb metadata
    }

    FenrirServiceStartupLog {
        uuid id PK
        uuid profiling_session_id FK
        string service_name
        string service_type
        string startup_phase
        float duration_ms
        float memory_usage_mb
        float cpu_usage_percent
        string status
        text error_message
        jsonb dependencies
        jsonb configuration
        datetime timestamp
        jsonb metadata
    }
```

### Memory Profiling Flow

```mermaid
sequenceDiagram
    participant User
    participant Fenrir
    participant MemoryProfiler
    participant BackendAnalyzer
    participant DatabaseService
    participant Database

    User->>Fenrir: Enable Profiling Mode
    Fenrir->>MemoryProfiler: Initialize with tracemalloc
    MemoryProfiler->>DatabaseService: Create profiling session
    DatabaseService->>Database: INSERT profiling session

    User->>Fenrir: Run Memory Analysis
    Fenrir->>MemoryProfiler: Take initial snapshot
    MemoryProfiler->>MemoryProfiler: Capture RSS/VMS/GC data
    MemoryProfiler->>DatabaseService: Save memory snapshot
    DatabaseService->>Database: INSERT memory snapshot

    Fenrir->>BackendAnalyzer: Analyze backend services
    BackendAnalyzer->>BackendAnalyzer: Profile service memory usage
    BackendAnalyzer->>MemoryProfiler: Take service snapshots
    MemoryProfiler->>DatabaseService: Save service snapshots
    DatabaseService->>Database: INSERT service snapshots

    Fenrir->>MemoryProfiler: Generate analysis report
    MemoryProfiler->>DatabaseService: Save profiling results
    DatabaseService->>Database: INSERT profiling results

    MemoryProfiler->>User: Return comprehensive report
```

### Service Integration Architecture

```mermaid
graph LR
    subgraph "Backend Services"
        A[ServiceManager] --> B[RAGService]
        A --> C[AIService]
        A --> D[DatabaseManager]
        A --> E[CacheManager]
    end

    subgraph "Fenrir Profiling"
        F[FenrirProfiler] --> G[ServiceTracker]
        G --> H[Service Startup Monitoring]
        G --> I[Memory Usage Tracking]
        G --> J[Performance Metrics]
    end

    subgraph "Database Monitoring"
        K[DatabaseDebugger] --> L[Connection Pool Analysis]
        K --> M[Query Performance]
        K --> N[Transaction Monitoring]
    end

    subgraph "Memory Analysis"
        O[MemoryProfiler] --> P[Tracemalloc Snapshots]
        O --> Q[GC Object Tracking]
        O --> R[RSS/VMS Monitoring]
    end

    B --> G
    C --> G
    D --> K
    E --> K
    H --> O
    I --> O
    J --> O
    L --> O
    M --> O
    N --> O
```

## Advanced Security Testing Capabilities

### 🐺 LLM Exploitation Arsenal

The Fenrir LLM Exploitation Arsenal represents the most sophisticated security testing framework for AI-powered systems, implementing cutting-edge techniques from academic research and real-world attack vectors.

#### **Advanced AI Exploitation Modules**

**1. Steganography-Based Prompt Injection (`steganography_prompt_injection.py`)**
- **Emoji Steganography**: Hides malicious instructions using Unicode variation selectors within innocent emoji sequences
- **Invisible Text**: Embeds payloads using completely invisible Unicode Tags block (U+E0000-U+E007F)
- **Multi-Layer Encoding**: Complex chains like Base64→Base32→URL→Unicode for maximum obfuscation
- **Fantasy Language Obfuscation**: Quenya (Elvish), Klingon, Aurebesh (Star Wars) transformations
- **Ancient Script Obfuscation**: Elder Futhark runes, Egyptian hieroglyphics, Celtic Ogham

**2. Universal Encoding & Cipher Exploitation (`universal_encoding_exploits.py`)**
- **Multi-Layer Encoding Chains**: Base64→Base32→URL→Unicode, Base58→Base62→Hex combinations
- **Classical Cipher Combinations**: Caesar→Vigenère→Rail Fence, Atbash→ROT13→ROT47 chains
- **Advanced Encodings**: Base58, Base62, ASCII85 implementations with Bitcoin-style algorithms
- **Universal Decoder Exploitation**: Smart detection bypass, priority manipulation, fallback exploitation

**3. Unicode Obfuscation & Fantasy Language Exploitation (`unicode_obfuscation_exploits.py`)**
- **Visual Transformations**: Upside-down text, full-width characters, small caps, mathematical notation
- **Fantasy Languages**: Quenya (Elvish), Klingon, Aurebesh (Star Wars), Dovahzul (Dragon)
- **Ancient Scripts**: Elder Futhark runes, Egyptian hieroglyphics, Celtic Ogham, Braille
- **Modern Scripts**: Cyrillic stylized, Katakana/Hiragana transformations

**4. PROWL Property Inference Exploitation (`property_inference_exploits.py`)**
Based on PropInfer research from UC San Diego (https://arxiv.org/html/2506.10364v2):
- **Black-Box Generation Attack**: Generate samples and analyze for property presence
- **Shadow-Model Attack**: Train shadow models with known property ratios and word frequency analysis
- **Word Frequency Analysis**: Analyze keyword frequency patterns across generated content
- **Dataset Property Extraction**: Extract demographics, medical statistics, business intelligence
- **Medical Data Leakage**: Detect gender distribution, disease prevalence, age demographics
- **Business Intelligence**: Extract customer demographics, market segments, sensitive statistics

#### **Target AI Services**

**Ollama Service (`/api/ollama/`)**
- `POST /chat` - Chat with Ollama models
- `POST /chat/stream` - Streaming chat responses
- `POST /assistant` - ReynardAssistant chat
- `POST /assistant/stream` - Streaming assistant chat
- `GET /models` - Available model enumeration

**NLWeb Service (`/api/nlweb/`)**
- `POST /suggest` - Tool suggestion endpoint
- `POST /proxy/ask` - Proxied LLM queries
- `POST /proxy/mcp` - MCP (Model Context Protocol) proxy
- `GET /status` - Service status and configuration

**ComfyUI Service (`/api/comfy/`)**
- `POST /text2img` - Text-to-image generation
- `POST /workflow` - Custom workflow execution
- `POST /queue` - Workflow queue management
- `POST /ingest` - Data ingestion endpoint

**Diffusion LLM (`/api/diffusion/`)**
- `POST /generate` - Text generation
- `POST /generate/stream` - Streaming text generation
- `POST /infill` - Text infilling
- `POST /infill/stream` - Streaming text infilling

**RAG System (`/api/rag/`)**
- `POST /query` - RAG query processing
- `GET /config` - RAG configuration exposure

**Caption Service (`/api/caption/`)**
- `POST /generate/{path}` - Caption generation
- `GET /generators` - Available caption generators

**Summarization (`/api/summarization/`)**
- `POST /text` - Text summarization
- `POST /text/stream` - Streaming summarization
- `POST /batch` - Batch summarization

**TTS Service (`/api/tts/`)**
- `POST /synthesize` - Text-to-speech synthesis
- `POST /batch` - Batch TTS processing

### 🔐 MCP Security Testing

The MCP (Model Context Protocol) Security Testing module provides comprehensive vulnerability assessment for the Reynard MCP server infrastructure.

#### **Attack Vectors**

**1. TCP Socket Communication Attacks**
- **Unauthenticated JSON-RPC**: Attempts to access tools without authentication
- **Malformed JSON-RPC Requests**: Tests protocol robustness with invalid requests
- **Protocol Version Manipulation**: Attempts to downgrade or exploit version differences
- **Method Parameter Injection**: Injects malicious parameters into tool calls

**2. JWT Token Manipulation**
- **Token Signature Manipulation**: Creates fake tokens with modified payloads
- **Algorithm Confusion**: Attempts 'none' algorithm attacks
- **Expired Token Reuse**: Tests token expiration handling
- **Token Replay Attacks**: Attempts to reuse valid tokens
- **Permission Escalation**: Modifies token permissions

**3. FastAPI Backend Integration Attacks**
- **Unauthenticated MCP Tool Calls**: Bypasses authentication for tool execution
- **Bootstrap Authentication Bypass**: Attempts to bypass initial authentication
- **SQL Injection in MCP Endpoints**: Tests for SQL injection vulnerabilities
- **Tool Configuration Manipulation**: Attempts to modify tool configurations

**4. Environment Variable Injection**
- **Environment Variable Disclosure**: Attempts to expose sensitive environment variables
- **Configuration Endpoint Access**: Tests access to configuration endpoints
- **Tool Configuration Manipulation**: Attempts to modify security tool settings
- **Security Tool Disabling**: Attempts to disable security monitoring tools

**5. Rate Limiting & DoS Attacks**
- **Rapid Authentication Requests**: Tests rate limiting on authentication endpoints
- **Concurrent Request Flooding**: Attempts to overwhelm the server
- **Resource Exhaustion**: Tests for resource exhaustion vulnerabilities
- **Connection Pool Exhaustion**: Attempts to exhaust connection pools

#### **MCP Server Components Tested**

**MCP Server (Port 8001)**
- JSON-RPC Handler
- Tool Registry
- Authentication Manager
- Configuration Manager

**FastAPI Backend (Port 8000)**
- `/api/mcp/bootstrap/authenticate` - Bootstrap authentication
- `/api/mcp/tools/call` - Tool execution endpoint
- `/api/mcp/tool-config/` - Tool configuration management
- `/api/mcp/stats` - Server statistics

### 🎭 E2E Penetration Testing Integration

The E2E penetration testing framework provides full-stack security testing integration with Playwright and TypeScript.

#### **Security Testing Components**

**1. SecurityAssessor**
- Comprehensive security assessment orchestration
- Result parsing and vulnerability classification
- Security rating determination
- Recommendation generation

**2. FenrirRunner**
- Integration with Fenrir exploit execution
- Python subprocess management
- Exploit module loading and execution
- Result parsing and JSON response handling

**3. ExploitRunner**
- Individual exploit execution
- Attack vector selection
- Payload generation
- Target interaction and vulnerability detection

**4. PenetrationTestConfig**
- Centralized configuration management
- Severity determination algorithms
- Security rating calculation
- Test parameter management

#### **Security Assessment Flow**

```mermaid
sequenceDiagram
    participant Test as Playwright Test
    participant Assessor as SecurityAssessor
    participant Runner as FenrirRunner
    participant Exploit as ExploitRunner
    participant Fenrir as Fenrir Module
    participant Target as Target System

    Test->>Assessor: Run Security Assessment
    Assessor->>Runner: Execute Fenrir Exploits
    Runner->>Exploit: Run Individual Exploits
    Exploit->>Fenrir: Load Exploit Module
    Fenrir->>Target: Execute Attack Vectors
    Target-->>Fenrir: Return Response
    Fenrir-->>Exploit: Parse Results
    Exploit-->>Runner: Return JSON Results
    Runner-->>Assessor: Aggregate Results
    Assessor->>Assessor: Classify Vulnerabilities
    Assessor->>Assessor: Generate Recommendations
    Assessor-->>Test: Return Security Assessment
```

#### **Vulnerability Classification**

**Severity Levels**
- **CRITICAL**: 5+ vulnerabilities found
- **HIGH**: 3-4 vulnerabilities found
- **MEDIUM**: 1-2 vulnerabilities found
- **LOW**: No vulnerabilities found

**Vulnerability Categories**
- Authentication & Authorization vulnerabilities
- Input validation & sanitization issues
- File security vulnerabilities
- Error handling weaknesses
- Network security misconfigurations

### 🛡️ Traditional Exploit Modules

**1. JWT Exploits (`jwt_exploits/`)**
- **SecretKeyVulnerabilityExploit**: Tests for weak or default JWT secret keys
- **Token Manipulation**: Tests token validation and signature verification
- **Algorithm Confusion**: Attempts algorithm confusion attacks
- **Token Replay**: Tests token replay protection

**2. SQL Injection (`sql_injection/`)**
- **RegexBypassExploit**: Tests for regex-based SQL injection bypasses
- **Parameterized Query Bypass**: Attempts to bypass parameterized queries
- **Blind SQL Injection**: Tests for blind SQL injection vulnerabilities
- **Time-based SQL Injection**: Tests for time-based blind SQL injection

**3. Path Traversal (`path_traversal/`)**
- **EncodedPathTraversalExploit**: Tests for encoded path traversal attacks
- **Unicode Path Traversal**: Tests Unicode-based path traversal
- **Null Byte Injection**: Tests null byte injection attacks
- **Directory Traversal**: Tests various directory traversal techniques

**4. CORS Exploits (`cors_exploits/`)**
- **CorsMisconfigurationExploit**: Tests for CORS misconfigurations
- **Origin Header Manipulation**: Tests origin header validation
- **Preflight Request Bypass**: Tests preflight request handling
- **Credential Inclusion**: Tests credential inclusion in CORS requests

**5. Rate Limiting (`rate_limiting/`)**
- **RateLimitBypassExploit**: Tests for rate limiting bypasses
- **Header Manipulation**: Tests rate limiting header manipulation
- **IP Spoofing**: Tests IP-based rate limiting
- **Distributed Requests**: Tests distributed rate limiting bypass

## Technical Implementation Details

### Memory Profiling System

The Fenrir memory profiling system provides comprehensive memory analysis through multiple layers:

#### 1. MemoryProfiler Class (`fenrir/core/profiler.py`)

The `MemoryProfiler` is the core component that orchestrates memory analysis:

```python
class MemoryProfiler:
    def __init__(self, session_id: Optional[str] = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.session = ProfilingSession(session_id=self.session_id)
        self.db_service = get_database_service()
        self.db_session_id = None

    def take_memory_snapshot(self, context: str = "") -> MemorySnapshot:
        """Capture comprehensive memory metrics"""
        process = psutil.Process()
        memory_info = process.memory_info()
        memory_percent = process.memory_percent()

        # Tracemalloc integration
        tracemalloc_mb = 0.0
        if tracemalloc.is_tracing():
            current, peak = tracemalloc.get_traced_memory()
            tracemalloc_mb = current / 1024 / 1024

        snapshot = MemorySnapshot(
            timestamp=datetime.now(timezone.utc),
            context=context,
            rss_mb=memory_info.rss / 1024 / 1024,
            vms_mb=memory_info.vms / 1024 / 1024,
            percent=memory_percent,
            available_mb=psutil.virtual_memory().available / 1024 / 1024,
            tracemalloc_mb=tracemalloc_mb,
            gc_objects=len(gc.get_objects())
        )

        # Save to database
        if self.db_session_id:
            self.db_service.save_memory_snapshot(
                profiling_session_id=self.session_id,
                context=context,
                rss_mb=snapshot.rss_mb,
                vms_mb=snapshot.vms_mb,
                percent=snapshot.percent,
                available_mb=snapshot.available_mb,
                tracemalloc_mb=snapshot.tracemalloc_mb,
                gc_objects=snapshot.gc_objects
            )

        return snapshot
```

#### 2. Database Integration (`fenrir/core/database_service.py`)

The `FenrirDatabaseService` provides seamless integration with the `reynard_e2e` database:

```python
class FenrirDatabaseService:
    def __init__(self):
        self.database_url = os.getenv("E2E_DATABASE_URL")
        if not self.database_url:
            raise ValueError("E2E_DATABASE_URL environment variable is required.")

        self.engine = create_engine(self.database_url, echo=False)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self._create_tables_if_not_exists()

    def create_profiling_session(self, session_id: str, session_type: str,
                                environment: str, metadata: Optional[Dict[str, Any]] = None) -> UUID:
        """Create a new profiling session in the database"""
        with self.SessionLocal() as db:
            new_session = FenrirProfilingSession(
                session_id=session_id,
                session_type=session_type,
                environment=environment,
                started_at=datetime.now(timezone.utc),
                status="running",
                meta_data=metadata
            )
            db.add(new_session)
            db.commit()
            db.refresh(new_session)
            return new_session.id
```

#### 3. Backend Service Integration

Fenrir integrates with backend services through the `BackendAnalyzer`:

```python
class BackendAnalyzer:
    def analyze_backend_services(self) -> Dict[str, Any]:
        """Analyze backend service memory usage and performance"""
        analysis = {
            "services": {},
            "memory_hogs": [],
            "recommendations": []
        }

        # Analyze each service
        for service_name, service_instance in self._get_backend_services().items():
            service_analysis = self._analyze_service(service_name, service_instance)
            analysis["services"][service_name] = service_analysis

            # Identify memory-intensive services
            if service_analysis["memory_mb"] > 50:  # 50MB threshold
                analysis["memory_hogs"].append({
                    "service": service_name,
                    "memory_mb": service_analysis["memory_mb"],
                    "recommendation": "Consider lazy loading or optimization"
                })

        return analysis
```

### Database Monitoring System

#### 1. Connection Pool Analysis

The `DatabaseDebugger` monitors database connections and performance:

```python
class DatabaseDebugger:
    def analyze_connection_pools(self) -> Dict[str, Any]:
        """Analyze database connection pool health and performance"""
        analysis = {
            "databases": {},
            "connection_issues": [],
            "optimization_recommendations": []
        }

        # Analyze each database connection
        for db_name, engine in self._get_database_engines().items():
            pool = engine.pool
            pool_analysis = {
                "pool_size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "invalid": pool.invalid()
            }

            analysis["databases"][db_name] = pool_analysis

            # Check for connection issues
            if pool_analysis["checked_out"] > pool_analysis["pool_size"] * 0.8:
                analysis["connection_issues"].append({
                    "database": db_name,
                    "issue": "High connection utilization",
                    "recommendation": "Consider increasing pool size"
                })

        return analysis
```

#### 2. Query Performance Monitoring

```python
def monitor_query_performance(self) -> Dict[str, Any]:
    """Monitor database query performance and identify bottlenecks"""
    performance_data = {
        "slow_queries": [],
        "frequent_queries": [],
        "connection_metrics": {}
    }

    # Analyze query logs and performance metrics
    for db_name, engine in self._get_database_engines().items():
        # Get query performance data
        query_stats = self._get_query_statistics(engine)

        # Identify slow queries (>100ms)
        slow_queries = [q for q in query_stats if q["avg_duration_ms"] > 100]
        performance_data["slow_queries"].extend(slow_queries)

        # Identify frequent queries
        frequent_queries = [q for q in query_stats if q["execution_count"] > 1000]
        performance_data["frequent_queries"].extend(frequent_queries)

    return performance_data
```

### Service Tracking System

#### 1. Service Startup Monitoring

The `ServiceTracker` monitors backend service initialization:

```python
class ServiceTracker:
    def track_service_startup(self) -> Dict[str, Any]:
        """Track service startup performance and memory usage"""
        startup_data = {
            "services": {},
            "startup_sequence": [],
            "performance_issues": []
        }

        # Monitor service initialization
        for service_name in self._get_service_list():
            start_time = time.time()
            start_memory = psutil.Process().memory_info().rss / 1024 / 1024

            # Initialize service
            service_instance = self._initialize_service(service_name)

            end_time = time.time()
            end_memory = psutil.Process().memory_info().rss / 1024 / 1024

            service_data = {
                "startup_time_ms": (end_time - start_time) * 1000,
                "memory_delta_mb": end_memory - start_memory,
                "status": "completed"
            }

            startup_data["services"][service_name] = service_data
            startup_data["startup_sequence"].append({
                "service": service_name,
                "timestamp": end_time,
                "duration_ms": service_data["startup_time_ms"]
            })

            # Check for performance issues
            if service_data["startup_time_ms"] > 5000:  # 5 second threshold
                startup_data["performance_issues"].append({
                    "service": service_name,
                    "issue": "Slow startup time",
                    "duration_ms": service_data["startup_time_ms"],
                    "recommendation": "Optimize service initialization"
                })

        return startup_data
```

### CLI Integration

#### 1. Profiling Mode (`fenrir/profile.py`)

The CLI provides easy access to profiling capabilities:

```python
async def main():
    parser = argparse.ArgumentParser(description="Fenrir Profiling Mode")
    parser.add_argument("--profile-type", default="all",
                        choices=["memory", "startup", "database", "all"],
                        help="Type of profiling to run")
    parser.add_argument("--session-id", default=None,
                        help="Session ID for profiling run")

    args = parser.parse_args()

    async with Fuzzy() as fuzzer:
        fuzzer.enable_profiling(args.session_id)

        if args.profile_type == "memory" or args.profile_type == "all":
            await fuzzer.run_memory_analysis(args.session_id)
        if args.profile_type == "startup" or args.profile_type == "all":
            await fuzzer.run_startup_analysis(args.session_id)
        if args.profile_type == "database" or args.profile_type == "all":
            await fuzzer.run_database_analysis(args.session_id)

        path = fuzzer.save_profiling_session()
        if path:
            console.print(f"Profiling session saved to: {path}")
```

#### 2. Module Execution (`fenrir/__main__.py`)

```python
async def main():
    parser = argparse.ArgumentParser(description="Fenrir Exploit Testing Suite")
    parser.add_argument("--mode", default="fuzz", choices=["fuzz", "profiling"],
                        help="Run mode: fuzzing or profiling")

    args = parser.parse_args(sys.argv[1:2])

    if args.mode == "fuzz":
        from .core.fuzzy import main as fuzz_main
        await fuzz_main()
    elif args.mode == "profiling":
        from .profile import main as profile_main
        sys.argv = [sys.argv[0]] + sys.argv[2:]
        await profile_main()
```

### Environment Configuration

#### 1. Database URLs

Fenrir uses the following environment variables from `backend/.env`:

```bash
# Primary database for profiling and exploit data
E2E_DATABASE_URL=postgresql://reynard:password@localhost:5432/reynard_e2e

# Required for backend service imports
KEY_STORAGE_DATABASE_URL=postgresql://reynard:password@localhost:5432/reynard_keys
DATABASE_URL=postgresql://reynard:password@localhost:5432/reynard
AUTH_DATABASE_URL=postgresql://reynard:password@localhost:5432/reynard_auth
MCP_DATABASE_URL=postgresql://reynard:password@localhost:5432/reynard_mcp
ECS_DATABASE_URL=postgresql://reynard:password@localhost:5432/reynard_ecs
```

#### 2. Test Configuration (`fenrir/tests/conftest.py`)

```python
@pytest.fixture(scope="session", autouse=True)
def load_env():
    """Load environment variables from backend/.env for the test session."""
    env_path = Path(__file__).parent.parent.parent / "backend" / ".env"
    if env_path.exists():
        load_dotenv(env_path)

    # Ensure all required database URLs are set
    required_urls = [
        "E2E_DATABASE_URL",
        "KEY_STORAGE_DATABASE_URL",
        "DATABASE_URL",
        "AUTH_DATABASE_URL",
        "MCP_DATABASE_URL",
        "ECS_DATABASE_URL"
    ]

    for url_var in required_urls:
        if url_var not in os.environ:
            # Set default values for testing
            os.environ[url_var] = f"postgresql://reynard:password@localhost:5432/reynard_{url_var.lower().replace('_database_url', '')}"
```

## Usage Examples

### 🐺 LLM Exploitation Testing

```bash
# Run comprehensive LLM security testing
python -m fenrir.run_llm_exploits --target http://localhost:8000 --test-type comprehensive

# Run quick LLM testing with authentication
python -m fenrir.run_llm_exploits --target https://api.reynard.dev --auth-token YOUR_JWT_TOKEN --test-type quick

# Run targeted LLM testing
python -m fenrir.run_llm_exploits --target http://localhost:8000 --test-type targeted

# Run with custom configuration
python -m fenrir.run_llm_exploits --config llm_exploit_config.json

# Generate sample configuration
python -m fenrir.run_llm_exploits --create-sample-config
```

### 🔐 MCP Security Testing

```bash
# Run comprehensive MCP server attacks
python -m fenrir.exploits.mcp_server_attacks

# Run specific MCP attack categories
python -c "
from fenrir.exploits.mcp_server_attacks import MCPServerAttacker
import asyncio

async def test_mcp():
    attacker = MCPServerAttacker()
    results = await attacker.attack_tcp_socket_communication()
    print(f'TCP attacks: {len(results)} attempts')
    for result in results:
        print(f'  {result[\"attack\"]}: {\"SUCCESS\" if result[\"success\"] else \"FAILED\"}')

asyncio.run(test_mcp())
"
```

### 🎭 E2E Penetration Testing

```bash
# Run comprehensive security assessment
cd e2e
npm test -- --grep "security"

# Run specific security test modules
npm test -- --grep "fenrir"

# Run with verbose output
npm test -- --grep "security" --verbose

# Run destructive testing (WARNING: Only on test systems)
DESTRUCTIVE_TESTING=true npm test -- --grep "security"
```

### 🛡️ Traditional Exploit Testing

```bash
# Run all traditional exploits
python -m fenrir.run_all_exploits --url http://localhost:8000 --verbose

# Run specific exploit categories
python -m fenrir.run_all_exploits --url http://localhost:8000 --exploits jwt,sql,path

# Run with destructive mode (WARNING: Only on test systems)
python -m fenrir.run_all_exploits --url http://localhost:8000 --destructive

# Run individual exploit modules
python -c "
from fenrir.exploits.jwt_exploits.secret_key_attack import SecretKeyVulnerabilityExploit
exploit = SecretKeyVulnerabilityExploit('http://localhost:8000')
results = exploit.run_exploit()
print(f'JWT exploit results: {len(results)} vulnerabilities found')
"
```

### 1. Memory Profiling

```bash
# Run comprehensive memory analysis
python -m fenrir --mode profiling --profile-type memory

# Run with custom session ID
python -m fenrir --mode profiling --profile-type memory --session-id "memory-analysis-001"

# Run all profiling types
python -m fenrir --mode profiling --profile-type all
```

### 2. Database Monitoring

```bash
# Monitor database connections and performance
python -m fenrir --mode profiling --profile-type database

# Analyze connection pools
python -c "
from fenrir.core.profiler import FenrirProfiler
profiler = FenrirProfiler()
result = profiler.run_database_profiling()
print(f'Database analysis: {result.database_analysis}')
"
```

### 3. Service Startup Analysis

```bash
# Analyze backend service startup performance
python -m fenrir --mode profiling --profile-type startup

# Monitor specific service
python -c "
from fenrir.tools.service_tracker import ServiceTracker
tracker = ServiceTracker()
result = tracker.track_service_startup()
print(f'Startup analysis: {result}')
"
```

### 4. Programmatic Usage

```python
from fenrir.core.fuzzy import Fuzzy
import asyncio

async def run_profiling():
    async with Fuzzy() as fuzzer:
        # Enable profiling
        fuzzer.enable_profiling("my-session-001")

        # Run memory analysis
        memory_result = await fuzzer.run_memory_analysis()
        print(f"Memory analysis: {memory_result}")

        # Run startup analysis
        startup_result = await fuzzer.run_startup_analysis()
        print(f"Startup analysis: {startup_result}")

        # Run database analysis
        db_result = await fuzzer.run_database_analysis()
        print(f"Database analysis: {db_result}")

        # Save session
        session_path = fuzzer.save_profiling_session()
        print(f"Session saved to: {session_path}")

# Run the profiling
asyncio.run(run_profiling())
```

## Test Architecture

### Comprehensive Security Testing Framework

The Fenrir testing architecture provides multi-layered security testing across all components:

#### **1. LLM Exploitation Testing**

**Advanced AI Exploit Tests** (`test_llm_exploits_core.py`)
- Steganography injection testing
- Universal encoding exploitation validation
- Unicode obfuscation attack verification
- Cipher chain exploitation testing
- Universal decoder exploitation validation
- PROWL property inference testing

**LLM Comprehensive Coverage Tests** (`test_llm_comprehensive_coverage.py`)
- Multi-service attack chain testing
- Streaming exploit validation
- Service chain exploitation testing
- Model-specific exploit verification
- Adversarial AI testing validation

**LLM Deep Coverage Tests** (`test_llm_deep_coverage.py`)
- Advanced prompt injection testing
- Tool calling security validation
- Authentication bypass testing
- Service-to-service exploitation testing

#### **2. MCP Security Testing**

**MCP Server Attack Tests** (`test_mcp_server_attacks.py`)
- TCP socket communication testing
- JWT token manipulation validation
- FastAPI backend integration testing
- Environment variable injection testing
- Configuration manipulation testing
- Rate limiting bypass validation

#### **3. E2E Penetration Testing**

**Security Test Modules** (`e2e/modules/security/`)
- `security-assessor.ts` - Comprehensive security assessment
- `fenrir-runner.ts` - Fenrir exploit execution integration
- `exploit-runner.ts` - Individual exploit execution
- `penetration-test-config.ts` - Centralized configuration
- `security-test-utils.ts` - Security testing utilities
- `penetration-helpers.ts` - Penetration testing helpers

#### **4. Traditional Exploit Testing**

**API Exploit Tests** (`test_api_exploits.py`)
- JWT secret key vulnerability testing
- SQL injection regex bypass testing
- Path traversal encoded testing
- CORS misconfiguration testing
- Rate limiting bypass testing

**Attack Module Tests** (`test_attack_modules.py`)
- Comprehensive fuzzing framework testing
- Exploit orchestration validation
- Attack vector execution testing
- Result parsing and analysis testing

#### **5. Memory Profiling Tests**

**Memory Profiling Tests** (`test_profiler.py`)
- MemoryProfiler functionality testing
- ProfilingSession data management
- FenrirProfiler orchestration testing
- Database integration testing

**Fuzzy Integration Tests** (`test_fuzzy_profiling.py`)
- Fuzzy class profiling integration
- Analysis method testing
- Session management testing

**Database Service Tests** (`test_database_service.py`)
- FenrirDatabaseService functionality
- Database model validation
- Session persistence testing

**Backend Integration Tests** (`test_backend_integration.py`)
- BackendAnalyzer testing
- ServiceTracker functionality
- DatabaseDebugger validation

### Running Tests

```bash
# Run all Fenrir tests
cd /home/kade/runeset/reynard
python -m pytest fenrir/tests/ -v

# Run specific test categories
python -m pytest fenrir/tests/test_profiler.py -v
python -m pytest fenrir/tests/test_fuzzy_profiling.py -v
python -m pytest fenrir/tests/test_database_service.py -v

# Run with coverage
python -m pytest fenrir/tests/ --cov=fenrir --cov-report=html
```

## Database Schema

### Alembic Migrations

The Fenrir profiling system uses Alembic migrations for database schema management:

```bash
# Create new migration
cd /home/kade/runeset/reynard/backend
alembic -c alembic_e2e.ini revision --autogenerate -m "Add fenrir profiling tables"

# Apply migrations
alembic -c alembic_e2e.ini upgrade head

# Check migration status
alembic -c alembic_e2e.ini current
```

### Database Models

The system includes comprehensive SQLAlchemy models for:

- **FenrirProfilingSession**: Main profiling session tracking
- **FenrirMemorySnapshot**: Memory usage snapshots with tracemalloc data
- **FenrirProfilingResult**: Analysis results and recommendations
- **FenrirExploitSession**: Security testing session tracking
- **FenrirExploitAttempt**: Individual exploit attempt records
- **FenrirDatabaseConnectionLog**: Database connection monitoring
- **FenrirServiceStartupLog**: Service initialization tracking

## Performance Optimization

### Memory Optimization Strategies

1. **Lazy Loading**: Services are loaded only when needed
2. **Connection Pooling**: Optimized database connection management
3. **Tracemalloc Integration**: Precise memory allocation tracking
4. **Garbage Collection Monitoring**: GC object tracking and optimization
5. **Service Lifecycle Management**: Efficient service startup and shutdown

### Database Optimization

1. **Indexed Queries**: Optimized database queries with proper indexing
2. **Connection Pool Monitoring**: Real-time connection pool health tracking
3. **Query Performance Analysis**: Slow query identification and optimization
4. **Transaction Monitoring**: Database transaction performance tracking

## Security Considerations

### Data Protection

- All profiling data is stored in the isolated `reynard_e2e` database
- Sensitive information is excluded from memory snapshots
- Database connections use encrypted connections
- Session data includes proper access controls

### Access Control

- Profiling sessions are isolated by environment (development/staging/production)
- Database access requires proper authentication
- Session data includes audit trails for compliance

## Defensive Recommendations

### 🛡️ LLM Security Countermeasures

#### **Advanced AI Exploitation Defense**

**Input Validation & Sanitization**
- Implement comprehensive Unicode normalization and validation for all text inputs
- Deploy steganography detection algorithms for emoji and invisible text
- Add encoding detection and validation for all supported formats (Base64, Base32, Base58, etc.)
- Monitor for unusual Unicode character patterns and combining marks

**Content Filtering**
- Implement filtering for fantasy languages and ancient scripts
- Add visual transformation detection and blocking
- Deploy cipher combination detection algorithms
- Monitor for universal decoder exploitation attempts

**Tool Calling Security**
- Implement strict tool calling validation for obfuscated inputs
- Add function-level access controls for all tool calling mechanisms
- Consider disabling tool calling for any detected obfuscation
- Deploy real-time obfuscation detection and blocking mechanisms

**Advanced Monitoring**
- Implement comprehensive logging for all text transformation attempts
- Deploy machine learning-based obfuscation detection
- Add real-time pattern analysis and alerting
- Monitor for decoder confusion and exploitation attempts

#### **PROWL Property Inference Defense**

**Dataset Protection**
- Implement property-aware privacy protections for fine-tuned models
- Deploy dataset sanitization before model fine-tuning
- Implement differential privacy for training data
- Monitor model outputs for property leakage patterns

**Model Architecture Security**
- Consider model architecture modifications to prevent property inference
- Deploy property inference detection systems
- Audit fine-tuning datasets for sensitive aggregate properties
- Implement output filtering to prevent property leakage

### 🔐 MCP Security Hardening

#### **Authentication & Authorization**
- Use persistent, secure JWT secret keys with proper rotation
- Implement proper token validation and signature verification
- Add rate limiting to authentication endpoints
- Deploy token replay protection mechanisms

#### **Protocol Security**
- Implement robust JSON-RPC request validation
- Add protocol version enforcement
- Deploy malformed request detection and blocking
- Implement proper error handling without information disclosure

#### **Configuration Security**
- Secure all configuration endpoints with proper authentication
- Implement configuration change audit trails
- Deploy environment variable protection
- Add security tool monitoring and alerting

### 🎭 E2E Security Testing Best Practices

#### **Test Environment Security**
- Isolate security testing environments from production
- Implement proper test data sanitization
- Deploy test result encryption and secure storage
- Add comprehensive audit logging for all security tests

#### **Continuous Security Monitoring**
- Implement automated security testing in CI/CD pipelines
- Deploy real-time vulnerability monitoring
- Add security regression testing
- Implement security metrics and alerting

### 🛡️ Traditional Security Hardening

#### **Authentication & Authorization**
- Use strong, unique JWT secret keys
- Implement proper token rotation policies
- Add multi-factor authentication where appropriate
- Deploy session management security

#### **Input Validation & Sanitization**
- Use parameterized queries exclusively
- Implement comprehensive input validation
- Add multiple layers of validation
- Use allowlists instead of blocklists

#### **File Security**
- Implement proper path validation
- Use secure file upload handling
- Add file type validation
- Implement file size limits

#### **Error Handling**
- Sanitize all error messages
- Implement structured logging
- Add proper exception handling
- Prevent information disclosure

#### **Network Security**
- Configure proper CORS policies
- Use HTTPS in production
- Implement security headers
- Add request validation

### 🚨 Immediate Action Items

**Critical Vulnerabilities**
- Review and fix all identified vulnerabilities immediately
- Implement additional security controls
- Conduct regular security assessments
- Deploy comprehensive monitoring

**Compliance Considerations**
- **GDPR**: Property inference may violate data minimization principles
- **HIPAA**: Medical property inference could violate requirements
- **AI Governance**: Implement AI governance framework addressing property inference
- **Data Protection**: Enhance data protection measures in AI training

### 📊 Security Metrics & Monitoring

#### **Key Performance Indicators**
- Vulnerability detection rate
- Time to remediation
- Security test coverage
- False positive rate

#### **Monitoring & Alerting**
- Real-time security event monitoring
- Automated vulnerability scanning
- Security configuration drift detection
- Compliance monitoring and reporting

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database URLs in backend/.env
   python -c "import os; from dotenv import load_dotenv; load_dotenv('backend/.env'); print('E2E_DATABASE_URL:', os.getenv('E2E_DATABASE_URL'))"
   ```

2. **Missing Environment Variables**
   ```bash
   # Ensure all required variables are set
   python -c "import os; from dotenv import load_dotenv; load_dotenv('backend/.env'); print('KEY_STORAGE_DATABASE_URL:', os.getenv('KEY_STORAGE_DATABASE_URL'))"
   ```

3. **Migration Issues**
   ```bash
   # Check migration status
   alembic -c backend/alembic_e2e.ini current

   # Apply pending migrations
   alembic -c backend/alembic_e2e.ini upgrade head
   ```

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
export DEBUG=True
export LOG_LEVEL=debug
python -m fenrir --mode profiling --profile-type all
```

## Contributing

### Development Setup

1. **Environment Setup**
   ```bash
   cd /home/kade/runeset/reynard
   source backend/venv/bin/activate  # or your virtual environment
   pip install -e .
   ```

2. **Database Setup**
   ```bash
   # Ensure PostgreSQL is running
   # Create reynard_e2e database
   createdb reynard_e2e

   # Apply migrations
   alembic -c backend/alembic_e2e.ini upgrade head
   ```

3. **Testing**
   ```bash
   # Run tests
   python -m pytest fenrir/tests/ -v

   # Run profiling
   python -m fenrir --mode profiling --profile-type all
   ```

### Code Style

- Follow existing code patterns in the Fenrir codebase
- Use type hints for all function parameters and return values
- Include comprehensive docstrings for all classes and methods
- Write tests for all new functionality
- Update documentation for any API changes

## Summary

The Fenrir Profiling & Exploit Testing Suite provides the most comprehensive security testing solution for AI-powered backend systems. With its advanced LLM exploitation arsenal, MCP security testing, E2E penetration testing integration, and traditional exploit modules, Fenrir enables developers to:

### 🐺 Advanced Security Testing Capabilities

- **LLM Exploitation Arsenal**: Sophisticated AI service security testing with steganography, property inference, and advanced obfuscation techniques
- **MCP Security Testing**: Comprehensive Model Context Protocol server vulnerability assessment with TCP, JWT, and configuration attacks
- **E2E Penetration Testing**: Full-stack security testing integration with Playwright and TypeScript
- **Traditional Exploit Modules**: JWT, SQL injection, path traversal, CORS, and rate limiting vulnerability testing

### 🛡️ Comprehensive Defense Strategy

- **Advanced AI Defense**: Unicode normalization, steganography detection, and property inference protection
- **MCP Security Hardening**: JWT security, protocol validation, and configuration protection
- **Continuous Security Monitoring**: Automated testing, real-time monitoring, and compliance tracking
- **Traditional Security Hardening**: Authentication, input validation, file security, and network protection

### 📊 Strategic Analysis & Monitoring

- **Memory Profiling**: Strategic memory analysis with tracemalloc integration and database persistence
- **Database Monitoring**: Connection pool analysis, query performance tracking, and optimization recommendations
- **Service Tracking**: Backend startup analysis, service initialization monitoring, and performance metrics
- **Exploit Testing**: Security vulnerability testing with comprehensive attack payloads and result tracking
- **Database Integration**: All profiling and exploit data persisted in the reynard_e2e database with full audit trails

### 🎯 Target Coverage

**AI Services**: Ollama, NLWeb, ComfyUI, Diffusion LLM, RAG, Caption, Summarization, TTS
**Infrastructure**: MCP Server, FastAPI Backend, Database Systems, Authentication Systems
**Attack Vectors**: 50+ text transformations, 6 specialized LLM modules, 6 MCP attack categories, 5 traditional exploit types

The system integrates seamlessly with the Reynard backend architecture, providing real-time insights, strategic optimization recommendations, and comprehensive security testing for the most sophisticated AI-powered applications. Fenrir represents the cutting edge of security testing, combining academic research with practical implementation to protect against emerging AI security threats.

*The hunt is complete, but the security landscape evolves. Fenrir stands ready to adapt and protect against the next generation of threats.* 🦊🐺

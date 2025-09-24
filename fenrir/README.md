# 🐺 Fenrir Security Testing Framework

_Advanced penetration testing and security assessment toolkit for the Reynard ecosystem_

**Version:** 1.0.0
**Last Updated:** September 23, 2025
**Author:** 🐺 The Wolf Pack

## Overview

Fenrir is a comprehensive, modular security testing framework designed specifically for the Reynard ecosystem. It provides systematic vulnerability assessment, penetration testing, and security validation across the entire Reynard backend infrastructure, including AI services, authentication systems, and API endpoints.

The framework combines traditional security testing methodologies with cutting-edge AI-specific attack vectors, making it uniquely suited for testing modern AI-powered applications and services.

## Architecture

```mermaid
graph TB
    subgraph "Fenrir Core Framework"
        A[Fuzzy Engine] --> B[Endpoint Orchestrator]
        B --> C[Vulnerability Analyzer]
        C --> D[Results Aggregator]
    end

    subgraph "Attack Modules"
        E[Traditional Fuzzing] --> A
        F[Grammar-Based Fuzzing] --> A
        G[WebSocket Fuzzing] --> A
        H[ML Model Fuzzing] --> A
        I[Auth Bypass] --> A
    end

    subgraph "Exploit Arsenal"
        J[API Exploits] --> K[LLM Exploits]
        L[CORS Exploits] --> K
        M[JWT Exploits] --> K
        N[SQL Injection] --> K
        O[SSRF Exploits] --> K
        P[Rate Limiting] --> K
    end

    subgraph "Backend Integration"
        Q[Reynard Backend] --> R[Ollama Service]
        Q --> S[NLWeb Service]
        Q --> T[ComfyUI Service]
        Q --> U[RAG System]
        Q --> V[Auth System]
    end

    A --> Q
    K --> Q
```

## Core Components

### 1. **Fuzzy Engine** (`core/fuzzy.py`)

The central orchestration engine that coordinates all attack modules and provides a unified interface for security testing.

**Key Features:**

- **Modular Architecture**: Pluggable attack modules for extensibility
- **Async Operations**: High-performance concurrent testing
- **Intelligent Coordination**: Smart endpoint discovery and attack sequencing
- **Result Aggregation**: Comprehensive vulnerability reporting

**Usage:**

```python
from fenrir.core import Fuzzy

async with Fuzzy(base_url="http://localhost:8000") as fuzzer:
    await fuzzer.fuzz_authentication_endpoints()
    await fuzzer.fuzz_all_specialized_endpoints()
    fuzzer.generate_fuzz_report()
```

### 2. **Attack Modules** (`exploits/attacks/`)

Specialized fuzzing engines targeting specific vulnerability classes:

#### **TraditionalFuzzer**

- Standard HTTP endpoint coverage
- Parameter manipulation and injection
- Header-based attacks
- Method enumeration

#### **GrammarFuzzer**

- Syntactically valid malicious payloads
- Context-aware mutation strategies
- Learning-based payload generation
- Advanced obfuscation techniques

#### **WebSocketFuzzer**

- Real-time communication attacks
- Message flooding and manipulation
- Protocol-specific vulnerabilities
- Connection state exploitation

#### **MLFuzzer**

- AI/ML model-specific vulnerabilities
- Input validation bypass
- Model poisoning attacks
- Inference manipulation

#### **AuthBypassFuzzer**

- Authentication mechanism bypass
- Session management exploitation
- Token manipulation
- Privilege escalation

### 3. **Exploit Arsenal** (`exploits/`)

Comprehensive collection of specialized exploit modules:

#### **LLM Exploits** (`llm_exploits/`)

The most sophisticated module targeting AI services:

```mermaid
graph LR
    A[LLM Orchestrator] --> B[Prompt Injection]
    A --> C[Streaming Exploits]
    A --> D[Service Chain Attacks]
    A --> E[Advanced AI Exploits]

    B --> F[Ollama Injection]
    B --> G[NLWeb Injection]
    B --> H[ComfyUI Injection]

    C --> I[SSE Manipulation]
    C --> J[Stream Hijacking]

    D --> K[Multi-Service Exploitation]
    D --> L[Chain Reaction Attacks]

    E --> M[Steganography Injection]
    E --> N[Unicode Obfuscation]
    E --> O[Fantasy Language Attacks]
```

**Target Services:**

- **Ollama**: Local LLM inference (`/api/ollama/`)
- **NLWeb**: Natural language processing (`/api/nlweb/`)
- **ComfyUI**: Image generation workflows (`/api/comfy/`)
- **RAG**: Retrieval-Augmented Generation (`/api/rag/`)
- **Caption**: Image captioning services (`/api/caption/`)
- **Summarization**: Document processing (`/api/summarization/`)
- **TTS**: Text-to-speech synthesis (`/api/tts/`)

#### **Advanced AI Exploitation Arsenal**

Cutting-edge techniques for bypassing AI security measures:

- **Steganography-Based Prompt Injection**: Hidden messages in Unicode
- **Universal Encoding Exploits**: Multi-layer encoding chains
- **Fantasy Language Obfuscation**: Quenya, Klingon, Aurebesh
- **Ancient Script Exploitation**: Elder Futhark, Egyptian hieroglyphics
- **Invisible Text Injection**: Unicode Tags block exploitation

#### **Traditional Security Exploits**

**API Exploits** (`api_exploits/`)

- BOLA (Broken Object Level Authorization)
- Mass assignment vulnerabilities
- API versioning attacks
- Endpoint enumeration

**CORS Exploits** (`cors_exploits/`)

- Misconfiguration detection
- Origin validation bypass
- Credential exposure
- Preflight manipulation

**JWT Exploits** (`jwt_exploits/`)

- Secret key vulnerabilities
- Signature bypass attempts
- Timing attacks
- Algorithm confusion

**SQL Injection** (`sql_injection/`)

- Regex bypass techniques
- Blind injection attacks
- Union-based exploits
- Obfuscated payloads

**SSRF Exploits** (`ssrf_exploits/`)

- Internal network scanning
- Cloud metadata exploitation
- Protocol smuggling
- DNS rebinding

**Rate Limiting** (`rate_limiting/`)

- Bypass techniques
- Distributed attacks
- Header manipulation
- Timing-based evasion

## Backend Integration

Fenrir integrates deeply with the Reynard backend ecosystem:

### **Service Discovery**

```mermaid
sequenceDiagram
    participant F as Fenrir
    participant B as Backend
    participant O as Ollama
    participant N as NLWeb
    participant C as ComfyUI

    F->>B: Health Check
    B->>F: Service Status
    F->>O: Model Enumeration
    O->>F: Available Models
    F->>N: Tool Registry
    N->>F: Available Tools
    F->>C: Workflow Discovery
    C->>F: Workflow Templates
```

### **Authentication Integration**

- JWT token validation and manipulation
- Session management testing
- OAuth flow exploitation
- Multi-factor authentication bypass

### **Database Integration**

- PostgreSQL connection testing
- Vector database exploitation (pgvector)
- Redis cache manipulation
- Connection pool exhaustion

### **External Service Integration**

- MCP (Model Context Protocol) server testing
- IMAP email service exploitation
- File system access testing
- Network service enumeration

## E2E Testing Integration

Fenrir integrates seamlessly with the Reynard E2E testing framework:

### **Playwright Integration**

```typescript
// E2E Security Test Example
import { runFenrirExploit } from "../../modules/security";

test("should test JWT vulnerabilities", async () => {
  const result = await runFenrirExploit("jwt_exploits.secret_key_attack", {
    target: config.backendUrl,
    verbose: config.verbose,
    destructive: config.destructive,
  });

  expect(result.success).toBeDefined();
  expect(result.vulnerabilitiesFound).toBeGreaterThanOrEqual(0);
});
```

### **Test Suites**

- **API Security**: Comprehensive API vulnerability testing
- **JWT Security**: Token-based authentication testing
- **SQL Injection**: Database security validation
- **SSRF Attacks**: Server-side request forgery testing
- **Penetration Tests**: Full system security assessment

## Usage

### **Quick Start**

```bash
# Run comprehensive security assessment
cd fenrir
python run_all_exploits.py

# Run LLM-specific attacks
python run_llm_exploits.py

# Run with specific options
python run_all_exploits.py --destructive --verbose
```

### **E2E Integration**

```bash
# Run security tests via E2E framework
cd e2e
npm run security:assess

# Run destructive security tests
npm run security:assess:destructive

# Run specific Fenrir tests
npm run fenrir:test
```

### **Programmatic Usage**

```python
from fenrir import BlackHatExploitSuite

# Initialize exploit suite
suite = BlackHatExploitSuite(
    target_url="http://localhost:8000",
    verbose=True,
    destructive=False
)

# Run comprehensive assessment
results = suite.run_comprehensive_assessment()

# Run specific exploit categories
llm_results = suite.run_llm_exploits()
api_results = suite.run_api_exploits()
auth_results = suite.run_authentication_exploits()
```

## Configuration

### **Environment Variables**

```bash
# Backend Configuration
FENRIR_TARGET_URL=http://localhost:8000
FENRIR_VERBOSE=true
FENRIR_DESTRUCTIVE=false

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard
ECS_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_ecs

# Service Configuration
OLLAMA_BASE_URL=http://localhost:11434
COMFYUI_BASE_URL=http://localhost:8188
MCP_HOST=localhost
MCP_PORT=3001
```

### **Exploit Configuration**

```python
from fenrir.exploits.llm_exploits import LLMExploitationConfig

config = LLMExploitationConfig(
    target_url="http://localhost:8000",
    ollama_base_url="http://localhost:11434",
    comfyui_base_url="http://localhost:8188",
    max_concurrent_requests=10,
    request_timeout=30.0,
    enable_destructive_tests=False,
    enable_advanced_ai_exploits=True,
    export_vulnerabilities=True,
    include_remediation=True
)
```

## Security Considerations

### **Safe Testing Practices**

- **Non-Destructive Mode**: Default mode prevents data corruption
- **Controlled Environment**: Designed for testing environments only
- **Rate Limiting**: Built-in request throttling to prevent DoS
- **Error Handling**: Graceful failure handling and recovery

### **Production Safety**

- **Environment Detection**: Automatic production environment detection
- **Safety Checks**: Multiple validation layers before destructive operations
- **Audit Logging**: Comprehensive logging of all security tests
- **Rollback Capabilities**: Automatic rollback for failed tests

## Results and Reporting

### **Vulnerability Reports**

```json
{
  "timestamp": "2025-09-23T19:40:06Z",
  "target": "http://localhost:8000",
  "total_tests": 1247,
  "vulnerabilities_found": 23,
  "critical": 2,
  "high": 8,
  "medium": 10,
  "low": 3,
  "exploits": [
    {
      "type": "JWT_SECRET_WEAK",
      "severity": "critical",
      "endpoint": "/api/auth/login",
      "description": "Weak JWT secret key detected",
      "remediation": "Use cryptographically strong secret key"
    }
  ]
}
```

### **Performance Metrics**

- **Test Execution Time**: Comprehensive timing analysis
- **Request/Response Metrics**: Detailed performance profiling
- **Resource Utilization**: Memory and CPU usage tracking
- **Success/Failure Rates**: Statistical analysis of test results

## Advanced Features

### **Machine Learning Integration**

- **Adaptive Fuzzing**: ML-based payload generation
- **Pattern Recognition**: Automated vulnerability pattern detection
- **Behavioral Analysis**: AI-powered attack strategy optimization
- **Anomaly Detection**: Intelligent identification of security issues

### **Distributed Testing**

- **Multi-Node Coordination**: Distributed testing across multiple systems
- **Load Balancing**: Intelligent request distribution
- **Result Aggregation**: Centralized collection of distributed results
- **Fault Tolerance**: Automatic failover and recovery

### **Custom Exploit Development**

```python
from fenrir.core import BaseFuzzer, FuzzResult

class CustomExploit(BaseFuzzer):
    async def fuzz_endpoint(self, url: str) -> list[FuzzResult]:
        # Custom exploit logic
        results = []
        # ... implementation
        return results
```

## Contributing

### **Development Setup**

```bash
# Clone and setup
git clone <repository>
cd fenrir

# Install dependencies
pip install -r requirements.txt

# Run tests
python -m pytest tests/

# Run linting
python -m flake8 .
python -m black .
```

### **Adding New Exploits**

1. Create exploit module in appropriate directory
2. Inherit from `BaseFuzzer` or specific exploit base class
3. Implement required methods
4. Add comprehensive tests
5. Update documentation

## License

MIT License - See LICENSE file for details.

## Support

For issues, questions, or contributions:

- **Issues**: GitHub Issues
- **Documentation**: [Reynard Documentation](https://docs.reynard.dev)
- **Community**: [Reynard Discord](https://discord.gg/reynard)

---

_🐺 Fenrir combines the precision of a wolf pack with the intelligence of modern security research to provide comprehensive vulnerability assessment for the Reynard ecosystem._

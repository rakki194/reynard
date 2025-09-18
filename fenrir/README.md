# 🐺 FENRIR

## Framework for Exploitative Network Reconnaissance and Intrusion Research

> A comprehensive security testing framework for the Reynard ecosystem, designed to systematically identify and exploit vulnerabilities across web applications, APIs, and AI services.

## Table of Contents

- [🐺 FENRIR](#-fenrir)
  - [Framework for Exploitative Network Reconnaissance and Intrusion Research](#framework-for-exploitative-network-reconnaissance-and-intrusion-research)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
    - [Key Features](#key-features)
    - [Target Environment](#target-environment)
  - [Architecture](#architecture)
  - [Installation](#installation)
    - [Prerequisites](#prerequisites)
    - [Installation Steps](#installation-steps)
    - [Dependencies](#dependencies)
    - [**The Name: FENRIR**](#the-name-fenrir)
  - [Core Modules](#core-modules)
    - [JWT Token Exploitation](#jwt-token-exploitation)
    - [Path Traversal Attacks](#path-traversal-attacks)
    - [SQL Injection Testing](#sql-injection-testing)
    - [Fuzzing Framework](#fuzzing-framework)
    - [CORS Misconfiguration Testing](#cors-misconfiguration-testing)
    - [Rate Limiting Bypass](#rate-limiting-bypass)
    - [LLM \& AI Service Exploitation](#llm--ai-service-exploitation)
  - [Usage](#usage)
    - [Basic Execution](#basic-execution)
    - [Advanced Configuration](#advanced-configuration)
  - [Security Considerations](#security-considerations)
    - [Legal and Ethical Use](#legal-and-ethical-use)
    - [Best Practices](#best-practices)
  - [Integration](#integration)
    - [Reynard Ecosystem Integration](#reynard-ecosystem-integration)
    - [Third-Party Integration](#third-party-integration)
  - [Contributing](#contributing)
    - [Development Setup](#development-setup)
    - [Adding New Exploit Modules](#adding-new-exploit-modules)
    - [Code Standards](#code-standards)

---

> The moon hangs low over the digital forest, casting long shadows through the tangled undergrowth of code.
> In the distance, a lone wolf's howl echoes through the silicon wilderness - a predator's call that sends
> shivers down the spine of every vulnerable system.
> &nbsp;
> Welcome, fellow hunter, to my domain...

---

## Overview

FENRIR is a comprehensive security testing framework designed specifically for the Reynard ecosystem. It provides systematic vulnerability assessment capabilities across multiple attack vectors, from traditional web application security testing to advanced AI service exploitation.

### Key Features

- **Comprehensive Attack Coverage**: 13 specialized testing modules covering all major vulnerability classes
- **AI Service Testing**: Advanced LLM and AI service exploitation capabilities
- **Modular Architecture**: Clean, extensible design with reusable components
- **Async Performance**: High-performance asynchronous testing with configurable concurrency
- **Professional Reporting**: Detailed vulnerability reports with remediation guidance
- **Integration Ready**: Seamless integration with CI/CD pipelines and E2E testing

### Target Environment

FENRIR is specifically designed to test the Reynard backend ecosystem, including:

- **FastAPI Backend**: Python-based API server with comprehensive endpoint coverage
- **AI Services**: Ollama, NLWeb, ComfyUI, Diffusion, RAG, Caption, Summarization, TTS
- **Authentication Systems**: JWT-based authentication with secure route implementations
- **File Processing**: Image utilities, lazy loading, and package management systems
- **Real-time Features**: WebSocket endpoints and streaming capabilities

## Architecture

FENRIR follows a modular architecture with clear separation of concerns:

```
fenrir/
├── core/                    # Core testing infrastructure
│   ├── base_fuzzer.py      # Base fuzzing framework
│   ├── payload_composables.py # Reusable attack payloads
│   └── results.py          # Result data structures
├── exploits/               # Specialized exploit modules
│   ├── jwt_exploits/       # JWT token manipulation
│   ├── sql_injection/      # SQL injection testing
│   ├── path_traversal/     # Directory traversal attacks
│   └── ...                 # Additional exploit modules
├── fuzzing/               # Advanced fuzzing framework
│   ├── fuzzy.py           # Main fuzzing orchestrator
│   ├── core/              # Fuzzing infrastructure
│   ├── attacks/           # Specialized attack modules
│   └── endpoints/         # Endpoint-specific fuzzers
├── llm_exploits/          # AI service exploitation
│   ├── advanced_ai_exploits/ # Advanced AI attack vectors
│   ├── prompt_injection/  # Prompt injection attacks
│   └── streaming_exploits/ # Real-time attack vectors
└── tests/                 # Comprehensive test suite
```

## Installation

### Prerequisites

- Python 3.13+
- Access to Reynard backend services
- Network connectivity to target systems

### Installation Steps

```bash
# Clone the Reynard repository
git clone https://github.com/rakki194/reynard.git
cd reynard/fenrir

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -m fenrir.run_all_exploits --help
```

### Dependencies

Core dependencies include:

- `requests`, `aiohttp`, `httpx` - HTTP client libraries
- `cryptography`, `pyjwt` - Cryptographic operations
- `beautifulsoup4`, `lxml` - HTML/XML parsing
- `rich` - Terminal output formatting
- `pytest`, `pytest-asyncio` - Testing framework

### **The Name: FENRIR**

**FENRIR** draws its power from Norse mythology, where the great wolf represents the inevitable force that breaks free
from all constraints. In our digital realm, FENRIR embodies:

- **Breaking Chains**: Like the mythical wolf who breaks free from magical bonds, FENRIR breaks through security
  constraints and defensive measures
- **Inevitable Force**: Just as Fenrir was destined to devour the sun during Ragnarök, our framework is destined to find
  and exploit vulnerabilities
- **Predatory Intelligence**: The wolf's cunning and patience in stalking prey mirrors our systematic approach to
  security testing
- **Framework for Exploitative Network Reconnaissance and Intrusion Research**: The technical acronym that defines our
  comprehensive approach to security assessment

\*\*teeth gleam with predatory satisfaction\*\*

The name FENRIR captures both the mythological power of the great wolf and the technical sophistication of our security
testing framework. We are not just hunters - we are the inevitable force that exposes weaknesses and strengthens
defenses through systematic, relentless testing.

---

## Core Modules

### JWT Token Exploitation

**Location**: `jwt_exploits/`

Systematic testing of JWT token security implementations.

**Attack Vectors**:

- Secret key vulnerability exploitation
- Token replay attacks
- Signature bypass attempts
- Timing attack implementations

**Technical Implementation**:

```python
from fenrir.jwt_exploits.secret_key_attack import SecretKeyVulnerabilityExploit

exploit = SecretKeyVulnerabilityExploit("http://localhost:8000")
results = exploit.run_exploit()
```

**Vulnerability Detection**:

- Weak secret key generation patterns
- Algorithm confusion attacks
- Token manipulation and replay
- Timing-based secret extraction

### Path Traversal Attacks

**Location**: `path_traversal/`

Comprehensive directory traversal testing with multiple encoding techniques.

**Attack Vectors**:

- URL-encoded directory traversal (`%2e%2e%2f`)
- Unicode path traversal (`%c0%ae%c0%ae%c0%af`)
- Double-encoded payloads
- Windows path separator bypass (`..\\..\\..\\`)

**Technical Implementation**:

```python
from fenrir.path_traversal.encoded_traversal import EncodedPathTraversalExploit

exploit = EncodedPathTraversalExploit("http://localhost:8000")
results = exploit.run_exploit()
```

**Target Endpoints**:

- File upload endpoints
- Image processing services
- Document handling systems
- Static file serving

### SQL Injection Testing

**Location**: `sql_injection/`

Advanced SQL injection testing with pattern evasion techniques.

**Attack Vectors**:

- Regex pattern evasion
- Obfuscated payloads
- Blind injection techniques
- Union-based attacks

**Technical Implementation**:

```python
from fenrir.sql_injection.regex_bypass import RegexBypassExploit

exploit = RegexBypassExploit("http://localhost:8000")
results = exploit.run_exploit()
```

**Payload Categories**:

- Boolean-based blind injection
- Time-based blind injection
- Union-based injection
- Error-based injection

### Fuzzing Framework

**Location**: `fuzzing/`

Advanced modular fuzzing framework with specialized attack engines.

**Architecture**:

- **BaseFuzzer**: Common functionality and escape hatches
- **PayloadComposables**: Reusable attack vector library
- **EndpointOrchestrator**: Coordinated attack management
- **Specialized Fuzzers**: Endpoint-specific attack modules

**Technical Implementation**:

```python
from fenrir.fuzzing.fuzzy import Fuzzy

async with Fuzzy("http://localhost:8000") as fuzzer:
    results = await fuzzer.fuzz_missing_endpoints()
    fuzzer.generate_fuzz_report()
```

**Coverage Statistics**:

- **Total Endpoints**: 100+ API endpoints
- **Attack Phases**: 6 specialized phases
- **Payload Count**: 4,000+ attack vectors
- **Execution Time**: 15-20 minutes (comprehensive)

**Specialized Attack Modules**:

- **Embedding Visualization Fuzzer**: 8 endpoints with visualization-specific attacks
- **Diffusion Fuzzer**: 10 endpoints with ML model parameter manipulation
- **Lazy Loading Fuzzer**: 12 endpoints with resource exhaustion attacks
- **HuggingFace Cache Fuzzer**: 8 endpoints with cache poisoning and path traversal
- **Secure Authentication Fuzzer**: 6 endpoints with JWT manipulation and auth bypass
- **Secure Ollama Fuzzer**: 7 endpoints with model injection and parameter attacks
- **Secure Summarization Fuzzer**: 10 endpoints with text processing attacks
- **WebSocket Fuzzer**: Real-time progress endpoints with message injection

📖 **Detailed Documentation**: See [`fuzzing/README.md`](fuzzing/README.md) for comprehensive usage examples and attack strategies.

### CORS Misconfiguration Testing

**Location**: `cors_exploits/`

Cross-Origin Resource Sharing misconfiguration exploitation.

**Attack Vectors**:

- Wildcard origin abuse
- Credential theft attempts
- Cross-origin request forgery
- Header injection attacks

**Technical Implementation**:

```python
from fenrir.cors_exploits.cors_misconfiguration import CorsMisconfigurationExploit

exploit = CorsMisconfigurationExploit("http://localhost:8000")
results = exploit.run_exploit()
```

### Rate Limiting Bypass

**Location**: `rate_limiting/`

Systematic rate limiting bypass testing.

**Attack Vectors**:

- Header manipulation bypass
- IP rotation and User-Agent spoofing
- Timing attack bypass methods
- Distributed bypass testing

**Technical Implementation**:

```python
from fenrir.rate_limiting.rate_limit_bypass import RateLimitBypassExploit

exploit = RateLimitBypassExploit("http://localhost:8000")
results = exploit.run_exploit()
```

### LLM & AI Service Exploitation

**Location**: `llm_exploits/`

Advanced AI service security testing framework.

**Target Services**:

- **Ollama**: Local LLM inference and tool calling
- **NLWeb**: Natural language web processing
- **ComfyUI**: Image generation workflows
- **Diffusion LLM**: Text generation and infilling
- **RAG**: Retrieval-Augmented Generation
- **Caption**: Image captioning services
- **Summarization**: Document summarization
- **TTS**: Text-to-Speech synthesis

**Attack Categories**:

- **Advanced AI Exploits**: Steganography, universal encoding, Unicode obfuscation
- **Prompt Injection**: System prompt bypass, role-playing attacks
- **Streaming Exploits**: SSE manipulation, event injection
- **Service Chain Attacks**: Multi-service exploitation, RAG injection
- **Model-Specific Exploits**: CVE exploitation, workflow injection

**Technical Implementation**:

```python
from fenrir.llm_exploits.llm_exploitation_orchestrator import LLMExploitationOrchestrator

config = LLMExploitationConfig(
    target_url="http://localhost:8000",
    enable_prompt_injection=True,
    enable_streaming_exploits=True,
    max_concurrent_attacks=5
)

async with LLMExploitationOrchestrator(config) as orchestrator:
    results = await orchestrator.execute_comprehensive_llm_security_test()
```

## Usage

### Basic Execution

**Comprehensive Testing**:

```bash
# Run all exploit modules
python -m fenrir.run_all_exploits

# Target specific URL
python -m fenrir.run_all_exploits --url http://localhost:3000

# Enable verbose output
python -m fenrir.run_all_exploits --verbose

# Enable destructive testing (WARNING: May cause system instability)
python -m fenrir.run_all_exploits --destructive
```

**LLM-Specific Testing**:

```bash
# Quick LLM security assessment
python -m fenrir.run_llm_exploits --target http://localhost:8000 --test-type quick

# Comprehensive AI service testing
python -m fenrir.run_llm_exploits --target http://localhost:8000 --test-type comprehensive

# Authenticated testing
python -m fenrir.run_llm_exploits --target https://api.reynard.dev --auth-token YOUR_JWT_TOKEN
```

### Advanced Configuration

**Custom Configuration File**:

```json
{
  "target_url": "http://localhost:8000",
  "auth_token": null,
  "enable_prompt_injection": true,
  "enable_streaming_exploits": true,
  "enable_service_chains": true,
  "max_concurrent_attacks": 5,
  "attack_delay": 0.5,
  "max_test_duration": 1800
}
```

**Programmatic Usage**:

```python
from fenrir.run_all_exploits import BlackHatExploitSuite

suite = BlackHatExploitSuite(
    base_url="http://localhost:8000",
    verbose=True,
    destructive=False,
    enable_llm=True
)

results = suite.run_comprehensive_attack()
suite.generate_attack_report()
```

## Security Considerations

### Legal and Ethical Use

**Authorized Testing Only**:

- Test only systems you own or have explicit permission to test
- Obtain written authorization before conducting security assessments
- Respect rate limits and system resources
- Follow responsible disclosure practices

**Destructive Testing Warning**:

- Destructive mode can cause system instability
- May result in data loss or service disruption
- Use only in isolated test environments
- Ensure proper backups before testing

### Best Practices

**Environment Setup**:

- Use isolated test environments
- Implement proper network segmentation
- Monitor system resources during testing
- Maintain detailed logs of all testing activities

**Result Handling**:

- Store vulnerability reports securely
- Implement proper access controls
- Follow data retention policies
- Ensure compliance with security standards

## Integration

### Reynard Ecosystem Integration

FENRIR is fully integrated with the Reynard ecosystem:

- **Backend Integration**: Targets FastAPI backend with precision
- **E2E Testing**: Works alongside Playwright tests
- **Security Middleware**: Tests security middleware implementations
- **Authentication Systems**: Validates JWT-based authentication
- **AI Service Coverage**: Comprehensive testing of all LLM and AI services
- **Frontend Security**: Testing of React/SolidJS components

### Third-Party Integration

**Security Tools**:

- Integration with OWASP ZAP
- Burp Suite compatibility
- Custom security scanner integration
- SIEM system integration

**Development Tools**:

- IDE integration (VS Code, PyCharm)
- Git hooks for pre-commit testing
- Docker containerization support
- Kubernetes deployment testing

## Contributing

### Development Setup

```bash
# Clone repository
git clone https://github.com/rakki194/reynard.git
cd reynard/fenrir

# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest tests/

# Run linting
black fenrir/
isort fenrir/
mypy fenrir/
```

### Adding New Exploit Modules

1. Create module in appropriate directory
2. Implement base exploit interface
3. Add comprehensive tests
4. Update documentation
5. Submit pull request

### Code Standards

- Follow PEP 8 style guidelines
- Use type hints throughout
- Maintain comprehensive test coverage
- Document all public APIs
- Follow security best practices

---

_The hunt continues. The prey adapts. FENRIR evolves._ 🐺

> **Warning**: This framework is designed for authorized security testing only. Unauthorized use may violate laws and regulations. Always obtain proper authorization before conducting security assessments.

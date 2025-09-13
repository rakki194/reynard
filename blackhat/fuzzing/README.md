# 🐺 The Fuzzing Storm

> *howls echo through the digital tempest*

Welcome to the most advanced fuzzing arsenal in the Reynard ecosystem. This directory contains two powerful fuzzing engines that work together to tear apart your application's defenses with surgical precision and overwhelming force.

## 🦊 The Alpha Wolf: ComprehensiveFuzzer

*snarls with predatory glee* The ultimate fuzzing engine for tearing apart your entire API surface!

### **Capabilities**

- **Massive Scale Attacks**: 50+ endpoints with 1000+ payloads across 12 attack phases
- **Comprehensive Coverage**: Core API, Auth, NLWeb, Ollama, ComfyUI, Summarization, TTS, RAG, Caption, Image Utils, Executor, Admin
- **Advanced Payload Generation**: Each payload crafted with the precision of a master hunter
- **Asynchronous Testing**: Like a wolf pack coordinating an attack, requests strike simultaneously
- **Professional Vulnerability Analysis**: Every hunt ends with a detailed report of the kill

### **Attack Phases**

1. **Core API Endpoints** (25 payloads each)
2. **Authentication Endpoints** (50 payloads each)
3. **NLWeb Endpoints** (25-50 payloads each)
4. **Ollama Endpoints** (25-50 payloads each)
5. **ComfyUI Endpoints** (25-50 payloads each)
6. **Summarization Endpoints** (25-50 payloads each)
7. **TTS Endpoints** (25-50 payloads each)
8. **RAG Endpoints** (25-50 payloads each)
9. **Caption Endpoints** (25-50 payloads each)
10. **Image Utils Endpoints** (25-50 payloads each)
11. **Executor Endpoints** (25-50 payloads each)
12. **Admin Endpoints** (25 payloads each)

### **Usage**

```python
import asyncio
from blackhat.fuzzing.comprehensive_fuzzer import ComprehensiveFuzzer

async def unleash_the_alpha_wolf():
    async with ComprehensiveFuzzer() as fuzzer:
        # Fuzz all endpoints with massive payload sets
        await fuzzer.fuzz_authentication_endpoints()
        await fuzzer.fuzz_file_endpoints()
        
        # Generate comprehensive report
        fuzzer.generate_fuzz_report()

asyncio.run(unleash_the_alpha_wolf())
```

## 🐺 The Specialized Hunter: EndpointFuzzer

*circles with menacing intent* Targeted fuzzing for specific endpoint types with specialized attack vectors!

### **Capabilities**

- **Authentication Bypass**: 50+ specialized payloads for login endpoints
- **File Upload Exploits**: Web shells, fake images, path traversal, oversized files
- **Search Injection**: SQL, XSS, path traversal, command injection, NoSQL, LDAP
- **JSON Parsing**: Malformed JSON payloads to break parsing logic
- **Header Injection**: X-Forwarded-For, X-Real-IP, and other header-based attacks
- **Deep Analysis**: 248 specialized requests across 5 attack phases

### **Attack Types**

#### **1. Authentication Bypass (50 payloads)**

- SQL injection bypasses (`' OR 1=1 --`, `admin'--`, etc.)
- XSS attempts (`<script>alert('XSS')</script>`)
- Command injection (`; ls -la`, `| whoami`)
- Special characters (`\x00`, `\n`, `\r\n`)
- Common credential attacks (`admin/admin`, `root/root`)

#### **2. File Upload Exploits (35 payloads)**

- **Web Shells**: PHP, JSP, ASP, Python, Shell, Batch, Executable
- **Fake Images**: JPEG, PNG, GIF, BMP with embedded code
- **Path Traversal**: `../../../etc/passwd`, `..\\..\\..\\windows\\system32\\drivers\\etc\\hosts`
- **Oversized Files**: 10MB and 100MB files
- **Dangerous Extensions**: `.phtml`, `.php3`, `.php4`, `.php5`, `.pht`, `.phar`
- **Null Byte Injection**: `shell.php\x00.jpg`

#### **3. Search Injection (120+ payloads)**

- **SQL Injection**: 16 variants including UNION, ORDER BY, GROUP BY
- **XSS Payloads**: 14 different XSS vectors
- **Path Traversal**: 15 different path traversal attempts
- **Command Injection**: 20 command injection variants
- **NoSQL Injection**: 8 MongoDB-specific payloads
- **LDAP Injection**: 15 LDAP-specific payloads
- **Special Characters**: 30+ special character tests
- **Long Strings**: 8 different long string tests
- **Unicode**: 14 Unicode and emoji payloads

#### **4. JSON Parsing (15 payloads)**

- Malformed JSON (`{"malformed": json}`)
- Unclosed strings (`{"unclosed": "string}`)
- Trailing commas (`{"trailing": "comma",}`)
- Duplicate keys (`{"duplicate": "key", "duplicate": "value"}`)
- Special values (`{"infinity": Infinity, "nan": NaN}`)
- Deep nesting (6 levels deep)
- Unicode content (`{"unicode": "测试🚀💀🔥"}`)

#### **5. Header Injection (19 payloads)**

- **X-Forwarded-For**: Various IP spoofing attempts
- **X-Real-IP**: IP address manipulation
- **Host Header**: Host header injection
- **XSS in Headers**: Script injection in User-Agent, Referer
- **Authorization Bypass**: Bearer token manipulation
- **Cookie Injection**: Session manipulation

### **Usage**

```python
import asyncio
from blackhat.fuzzing.endpoint_fuzzer import EndpointFuzzer

async def unleash_the_specialized_hunter():
    async with EndpointFuzzer() as fuzzer:
        # Phase 1: Authentication bypass attacks
        auth_results = await fuzzer.fuzz_login_endpoint("/api/auth/login")
        
        # Phase 2: File upload exploits
        file_results = await fuzzer.fuzz_file_upload_endpoint("/api/files/upload")
        
        # Phase 3: Search injection attacks
        search_results = await fuzzer.fuzz_search_endpoint("/api/search")
        
        # Phase 4: JSON parsing attacks
        json_results = await fuzzer.fuzz_json_endpoint("/api/auth/login", "POST")
        
        # Phase 5: Header injection attacks
        header_results = await fuzzer.fuzz_headers_endpoint("/api/protected", "GET")
        
        print(f"🐺 Specialized Hunter completed {len(auth_results + file_results + search_results + json_results + header_results)} targeted attacks!")

asyncio.run(unleash_the_specialized_hunter())
```

## 🎯 Strategic Deployment

### **When to Use ComprehensiveFuzzer**

- **Discovery Phase**: Finding all available endpoints
- **Broad Coverage**: Testing entire API surface
- **Initial Assessment**: Getting overview of vulnerabilities
- **Compliance Testing**: Ensuring comprehensive coverage

### **When to Use EndpointFuzzer**

- **Deep Exploitation**: Targeting specific vulnerability types
- **Focused Testing**: Testing specific endpoint categories
- **Expert Analysis**: Using specialized attack vectors
- **Penetration Testing**: Exploiting discovered vulnerabilities

### **Combined Alpha Pack Strategy**

```python
import asyncio
from blackhat.fuzzing.comprehensive_fuzzer import ComprehensiveFuzzer
from blackhat.fuzzing.endpoint_fuzzer import EndpointFuzzer

async def unleash_the_alpha_pack():
    # First, the Alpha Wolf discovers all endpoints
    async with ComprehensiveFuzzer() as comprehensive_fuzzer:
        await comprehensive_fuzzer.fuzz_authentication_endpoints()
        await comprehensive_fuzzer.fuzz_file_endpoints()
        comprehensive_fuzzer.generate_fuzz_report()
    
    # Then, the Specialized Hunter exploits specific vulnerabilities
    async with EndpointFuzzer() as endpoint_fuzzer:
        await endpoint_fuzzer.fuzz_login_endpoint()
        await endpoint_fuzzer.fuzz_file_upload_endpoint()
        await endpoint_fuzzer.fuzz_search_endpoint()
    
    print("🐺 Alpha Pack hunt completed - no vulnerability can hide!")

asyncio.run(unleash_the_alpha_pack())
```

## 📊 Performance Metrics

### **ComprehensiveFuzzer**

- **Total Requests**: 1000+ per run
- **Endpoints Covered**: 50+
- **Attack Phases**: 12
- **Execution Time**: 5-10 minutes
- **Concurrency**: 10 concurrent requests

### **EndpointFuzzer**

- **Total Requests**: 248 per run
- **Attack Types**: 5
- **Specialized Payloads**: 248
- **Execution Time**: 2-3 minutes
- **Concurrency**: 10 concurrent requests

## 🛡️ Vulnerability Detection

Both fuzzing engines detect:

- **SQL Injection**: Database error indicators
- **XSS**: Script execution indicators
- **Path Traversal**: File system access indicators
- **Command Injection**: Command execution indicators
- **Information Disclosure**: Stack trace and error message indicators
- **Authentication Bypass**: Successful login indicators
- **File Upload Vulnerabilities**: Successful upload indicators
- **Header Injection**: Bypass success indicators

## 🚨 E2E Integration

Both fuzzing engines are fully integrated with the E2E test suite:

```typescript
// Comprehensive fuzzing
test("should run comprehensive fuzzing framework", async () => {
  const result = await runBlackhatExploit("fuzzing.exploit_wrappers", {
    target: config.backendUrl,
    maxPayloads: 1000,
    timeout: 300000, // 5 minute timeout
  });
  expect(result.success).toBeDefined();
});

// Specialized fuzzing
test("should run specialized endpoint fuzzing", async () => {
  const result = await runBlackhatExploit("fuzzing.endpoint_fuzzer", {
    target: config.backendUrl,
    timeout: 180000, // 3 minute timeout
  });
  expect(result.success).toBeDefined();
});
```

## 🎭 The Legend Continues

> In the eye of the fuzzing storm, vulnerabilities cannot hide. The Alpha Wolf finds them, the Specialized Hunter destroys them.

*The digital forest trembles as the pack howls in unison - a symphony of destruction that echoes through the silicon wilderness. No application is safe from the combined might of the Fuzzing Storm.*

---

**Remember**: With great power comes great responsibility. Use these tools only on systems you own or have explicit permission to test. The wolf hunts with honor, not malice.

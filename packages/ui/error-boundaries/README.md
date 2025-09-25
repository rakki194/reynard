# reynard-error-boundaries

> **Comprehensive Error Boundary System for Reynard Framework** 🦊

An error boundary system that provides graceful error handling, recovery mechanisms, logging, and
comprehensive error reporting for SolidJS applications built with Reynard.

## 🏗️ System Architecture

The Reynard Error Boundary System is built on a multi-layered architecture that provides comprehensive error handling, intelligent analysis, structured logging, and automated recovery mechanisms.

```mermaid
graph TB
    subgraph "🦊 Reynard Error Boundary System"
        subgraph "Error Detection Layer"
            EB[ErrorBoundary Component]
            GE[Global Error Handlers]
            UPR[Unhandled Promise Rejection]
        end

        subgraph "Error Analysis Layer"
            EA[ErrorAnalyzer]
            EC[ErrorContext Creation]
            ES[ErrorSerializer]
        end

        subgraph "Logging System"
            RL[ReynardLogger]
            subgraph "Log Destinations"
                CON[Console]
                MEM[Memory Buffer]
                REM[Remote Endpoint]
                FILE[File System]
            end
            subgraph "Log Processing"
                REDACT[Data Redaction]
                SAMPLE[Sampling]
                FORMAT[Formatting]
            end
        end

        subgraph "Recovery System"
            RS[RecoveryStrategies]
            subgraph "Built-in Strategies"
                RETRY[Retry]
                RESET[Reset]
                FALLBACK[Fallback UI]
                REDIRECT[Redirect]
                RELOAD[Reload]
            end
        end

        subgraph "Reporting System"
            ER[ErrorReporting]
            subgraph "Report Processing"
                FILTER[Error Filters]
                BATCH[Batch Processing]
                METRICS[Analytics]
            end
        end

        subgraph "UI Components"
            EF[ErrorFallback]
            UEB[useErrorBoundary]
            UER[useErrorReporting]
        end
    end

    %% Error Flow
    EB --> EA
    GE --> EA
    UPR --> EA

    %% Analysis Flow
    EA --> EC
    EC --> ES

    %% Logging Flow
    EA --> RL
    ES --> RL
    RL --> REDACT
    REDACT --> SAMPLE
    SAMPLE --> FORMAT
    FORMAT --> CON
    FORMAT --> MEM
    FORMAT --> REM
    FORMAT --> FILE

    %% Recovery Flow
    EA --> RS
    RS --> RETRY
    RS --> RESET
    RS --> FALLBACK
    RS --> REDIRECT
    RS --> RELOAD

    %% Reporting Flow
    ES --> ER
    ER --> FILTER
    FILTER --> BATCH
    BATCH --> METRICS

    %% UI Integration
    EB --> EF
    UEB --> EB
    UER --> ER

    %% Styling
    classDef errorBoundary fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef logging fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff
    classDef recovery fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef reporting fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#fff
    classDef ui fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#fff

    class EB,GE,UPR errorBoundary
    class RL,CON,MEM,REM,FILE,REDACT,SAMPLE,FORMAT logging
    class RS,RETRY,RESET,FALLBACK,REDIRECT,RELOAD recovery
    class ER,FILTER,BATCH,METRICS reporting
    class EF,UEB,UER ui
```

## 🔍 ReynardLogger System

The ReynardLogger is a comprehensive logging system designed specifically for the Reynard ecosystem. It provides structured logging, context-aware tracking, performance monitoring, and security features.

### Logging Architecture

```mermaid
graph TB
    subgraph "🦊 ReynardLogger Architecture"
        subgraph "Log Entry Creation"
            LOG[Log Methods]
            subgraph "Log Levels"
                DEBUG[DEBUG]
                INFO[INFO]
                WARN[WARN]
                ERROR[ERROR]
                FATAL[FATAL]
            end
            subgraph "Specialized Logging"
                PERF[Performance]
                SEC[Security]
                ANAL[Analytics]
            end
        end

        subgraph "Log Processing Pipeline"
            CONTEXT[Context Enrichment]
            REDACT[Data Redaction]
            SAMPLE[Sampling Filter]
            FORMAT[Formatting]
        end

        subgraph "Log Destinations"
            CONSOLE[Console Output]
            MEMORY[Memory Buffer]
            REMOTE[Remote Endpoint]
            FILE[File System]
        end

        subgraph "Configuration"
            CONFIG[LoggerConfig]
            subgraph "Features"
                ENV[Environment Detection]
                SESSION[Session Management]
                SECURITY[Security Patterns]
                PERFORMANCE[Performance Tracking]
            end
        end

        subgraph "Data Management"
            BUFFER[Memory Buffer]
            FLUSH[Auto Flush]
            CLEANUP[Cleanup Operations]
        end
    end

    %% Log Flow
    LOG --> DEBUG
    LOG --> INFO
    LOG --> WARN
    LOG --> ERROR
    LOG --> FATAL
    LOG --> PERF
    LOG --> SEC
    LOG --> ANAL

    %% Processing Flow
    DEBUG --> CONTEXT
    INFO --> CONTEXT
    WARN --> CONTEXT
    ERROR --> CONTEXT
    FATAL --> CONTEXT
    PERF --> CONTEXT
    SEC --> CONTEXT
    ANAL --> CONTEXT

    CONTEXT --> REDACT
    REDACT --> SAMPLE
    SAMPLE --> FORMAT

    %% Destination Flow
    FORMAT --> CONSOLE
    FORMAT --> MEMORY
    FORMAT --> REMOTE
    FORMAT --> FILE

    %% Configuration Flow
    CONFIG --> ENV
    CONFIG --> SESSION
    CONFIG --> SECURITY
    CONFIG --> PERFORMANCE

    %% Memory Management
    MEMORY --> BUFFER
    BUFFER --> FLUSH
    FLUSH --> CLEANUP

    %% Styling
    classDef logLevel fill:#e17055,stroke:#d63031,stroke-width:2px,color:#fff
    classDef processing fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff
    classDef destination fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef config fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#fff
    classDef memory fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#fff

    class DEBUG,INFO,WARN,ERROR,FATAL,PERF,SEC,ANAL logLevel
    class CONTEXT,REDACT,SAMPLE,FORMAT processing
    class CONSOLE,MEMORY,REMOTE,FILE destination
    class CONFIG,ENV,SESSION,SECURITY,PERFORMANCE config
    class BUFFER,FLUSH,CLEANUP memory
```

### Logging Flow Process

```mermaid
sequenceDiagram
    participant App as Application
    participant Logger as ReynardLogger
    participant Context as Context Enrichment
    participant Redact as Data Redaction
    participant Sample as Sampling
    participant Format as Formatting
    participant Dest as Destinations

    App->>Logger: log.error(message, error, data)
    Logger->>Context: Enrich with session, package, timestamp
    Context->>Redact: Remove sensitive data
    Redact->>Sample: Apply sampling rate
    Sample->>Format: Format for output
    Format->>Dest: Write to console
    Format->>Dest: Write to memory buffer
    Format->>Dest: Write to remote endpoint
    Format->>Dest: Write to file system
    Dest-->>App: Log entry processed
```

### Key Features

- **Structured Logging**: JSON-formatted log entries with consistent schema
- **Context Awareness**: Automatic package, component, and session tracking
- **Data Redaction**: Automatic removal of sensitive information (passwords, tokens, API keys)
- **Performance Monitoring**: Built-in performance metrics and memory usage tracking
- **Security Logging**: Dedicated security event logging with pattern matching
- **Analytics Integration**: User behavior and application analytics
- **Configurable Destinations**: Console, memory, remote endpoints, and file system
- **Sampling Control**: Configurable sampling rates for high-volume logging
- **Memory Management**: Automatic buffer management with configurable limits
- **Environment Detection**: Automatic development/production environment detection

## 🔬 Error Analysis & Classification

The error analysis system provides intelligent error classification, severity assessment, and recovery recommendations through a sophisticated analysis pipeline.

### Error Analysis Flow

```mermaid
graph TB
    subgraph "🦊 Error Analysis Pipeline"
        subgraph "Error Input"
            ERROR[Error Object]
            INFO[Error Info]
            STACK[Stack Trace]
        end

        subgraph "Analysis Engine"
            CATEGORIZE[Category Detection]
            SEVERITY[Severity Assessment]
            RECOVER[Recoverability Check]
            METADATA[Metadata Extraction]
        end

        subgraph "Error Categories"
            NET[Network Errors]
            AUTH[Authentication]
            PERM[Permission]
            VAL[Validation]
            RES[Resource]
            RENDER[Rendering]
            TIMEOUT[Timeout]
            UNKNOWN[Unknown]
        end

        subgraph "Severity Levels"
            LOW[Low]
            MED[Medium]
            HIGH[High]
            CRIT[Critical]
        end

        subgraph "Context Creation"
            CONTEXT[Error Context]
            SESSION[Session Info]
            COMPONENT[Component Stack]
            BROWSER[Browser Info]
        end
    end

    %% Analysis Flow
    ERROR --> CATEGORIZE
    INFO --> CATEGORIZE
    STACK --> CATEGORIZE

    CATEGORIZE --> NET
    CATEGORIZE --> AUTH
    CATEGORIZE --> PERM
    CATEGORIZE --> VAL
    CATEGORIZE --> RES
    CATEGORIZE --> RENDER
    CATEGORIZE --> TIMEOUT
    CATEGORIZE --> UNKNOWN

    CATEGORIZE --> SEVERITY
    SEVERITY --> LOW
    SEVERITY --> MED
    SEVERITY --> HIGH
    SEVERITY --> CRIT

    SEVERITY --> RECOVER
    CATEGORIZE --> METADATA

    METADATA --> CONTEXT
    RECOVER --> CONTEXT
    CONTEXT --> SESSION
    CONTEXT --> COMPONENT
    CONTEXT --> BROWSER

    %% Styling
    classDef input fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef analysis fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff
    classDef category fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef severity fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#fff
    classDef context fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#fff

    class ERROR,INFO,STACK input
    class CATEGORIZE,SEVERITY,RECOVER,METADATA analysis
    class NET,AUTH,PERM,VAL,RES,RENDER,TIMEOUT,UNKNOWN category
    class LOW,MED,HIGH,CRIT severity
    class CONTEXT,SESSION,COMPONENT,BROWSER context
```

### Error Classification Rules

```mermaid
flowchart TD
    START[Error Occurs] --> CHECK_NAME{Check Error Name}
    CHECK_NAME -->|network, fetch, timeout| NETWORK[Network Error]
    CHECK_NAME -->|auth, unauthorized, 401, 403| AUTH[Authentication Error]
    CHECK_NAME -->|permission, access denied| PERM[Permission Error]
    CHECK_NAME -->|validation, invalid, required| VAL[Validation Error]
    CHECK_NAME -->|not found, 404, file not found| RES[Resource Error]
    CHECK_NAME -->|render, component| RENDER[Rendering Error]
    CHECK_NAME -->|timeout, timed out| TIMEOUT[Timeout Error]
    CHECK_NAME -->|other| UNKNOWN[Unknown Error]

    NETWORK --> SEVERITY_CHECK{Severity Assessment}
    AUTH --> SEVERITY_CHECK
    PERM --> SEVERITY_CHECK
    VAL --> SEVERITY_CHECK
    RES --> SEVERITY_CHECK
    RENDER --> SEVERITY_CHECK
    TIMEOUT --> SEVERITY_CHECK
    UNKNOWN --> SEVERITY_CHECK

    SEVERITY_CHECK -->|Critical| CRIT[Critical Severity]
    SEVERITY_CHECK -->|High Impact| HIGH[High Severity]
    SEVERITY_CHECK -->|Medium Impact| MED[Medium Severity]
    SEVERITY_CHECK -->|Low Impact| LOW[Low Severity]

    CRIT --> RECOVER_CHECK{Recoverable?}
    HIGH --> RECOVER_CHECK
    MED --> RECOVER_CHECK
    LOW --> RECOVER_CHECK

    RECOVER_CHECK -->|Yes| RECOVERABLE[Recoverable Error]
    RECOVER_CHECK -->|No| NON_RECOVERABLE[Non-Recoverable Error]

    RECOVERABLE --> CONTEXT_CREATE[Create Error Context]
    NON_RECOVERABLE --> CONTEXT_CREATE

    CONTEXT_CREATE --> END[Error Analysis Complete]

    %% Styling
    classDef start fill:#e17055,stroke:#d63031,stroke-width:3px,color:#fff
    classDef network fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff
    classDef auth fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef perm fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#fff
    classDef val fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef res fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#fff
    classDef render fill:#fd79a8,stroke:#e84393,stroke-width:2px,color:#fff
    classDef timeout fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#fff
    classDef unknown fill:#636e72,stroke:#2d3436,stroke-width:2px,color:#fff
    classDef severity fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef recoverable fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef nonRecoverable fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef end fill:#2d3436,stroke:#636e72,stroke-width:3px,color:#fff

    class START start
    class NETWORK network
    class AUTH auth
    class PERM perm
    class VAL val
    class RES res
    class RENDER render
    class TIMEOUT timeout
    class UNKNOWN unknown
    class CRIT,HIGH,MED,LOW severity
    class RECOVERABLE recoverable
    class NON_RECOVERABLE nonRecoverable
    class END end
```

## 🔄 Recovery Strategies System

The recovery system provides intelligent error recovery mechanisms with configurable strategies and priority-based execution.

### Recovery Strategy Flow

```mermaid
graph TB
    subgraph "🦊 Recovery Strategies System"
        subgraph "Strategy Selection"
            ERROR_INPUT[Error + Context]
            STRATEGY_MATCH[Strategy Matching]
            PRIORITY_SORT[Priority Sorting]
        end

        subgraph "Built-in Strategies"
            RETRY[Retry Strategy]
            RESET[Reset Strategy]
            FALLBACK[Fallback UI Strategy]
            REDIRECT[Redirect Strategy]
            RELOAD[Reload Strategy]
        end

        subgraph "Custom Strategies"
            CUSTOM[Custom Strategy]
            USER_DEFINED[User-Defined Logic]
        end

        subgraph "Strategy Execution"
            EXECUTE[Execute Strategy]
            TIMEOUT[Timeout Handling]
            RESULT[Result Processing]
        end

        subgraph "Recovery Outcomes"
            SUCCESS[Recovery Success]
            FAILURE[Recovery Failure]
            FALLBACK_UI[Show Fallback UI]
        end
    end

    %% Strategy Flow
    ERROR_INPUT --> STRATEGY_MATCH
    STRATEGY_MATCH --> RETRY
    STRATEGY_MATCH --> RESET
    STRATEGY_MATCH --> FALLBACK
    STRATEGY_MATCH --> REDIRECT
    STRATEGY_MATCH --> RELOAD
    STRATEGY_MATCH --> CUSTOM

    CUSTOM --> USER_DEFINED

    RETRY --> PRIORITY_SORT
    RESET --> PRIORITY_SORT
    FALLBACK --> PRIORITY_SORT
    REDIRECT --> PRIORITY_SORT
    RELOAD --> PRIORITY_SORT
    USER_DEFINED --> PRIORITY_SORT

    PRIORITY_SORT --> EXECUTE
    EXECUTE --> TIMEOUT
    TIMEOUT --> RESULT

    RESULT --> SUCCESS
    RESULT --> FAILURE
    RESULT --> FALLBACK_UI

    %% Styling
    classDef input fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef builtin fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef custom fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#fff
    classDef execution fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff
    classDef outcome fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#fff

    class ERROR_INPUT,STRATEGY_MATCH,PRIORITY_SORT input
    class RETRY,RESET,FALLBACK,REDIRECT,RELOAD builtin
    class CUSTOM,USER_DEFINED custom
    class EXECUTE,TIMEOUT,RESULT execution
    class SUCCESS,FAILURE,FALLBACK_UI outcome
```

### Recovery Strategy Decision Tree

```mermaid
flowchart TD
    START[Error Occurs] --> ANALYZE[Analyze Error]
    ANALYZE --> CATEGORY{Error Category?}

    CATEGORY -->|Network| NETWORK_CHECK{Network Error?}
    CATEGORY -->|Rendering| RENDER_CHECK{Rendering Error?}
    CATEGORY -->|Resource| RESOURCE_CHECK{Resource Error?}
    CATEGORY -->|Validation| VALIDATION_CHECK{Validation Error?}
    CATEGORY -->|Authentication| AUTH_CHECK{Auth Error?}
    CATEGORY -->|Other| OTHER_CHECK{Other Error?}

    NETWORK_CHECK -->|Yes| RETRY_STRATEGY[Retry Strategy]
    NETWORK_CHECK -->|No| FALLBACK_STRATEGY[Fallback Strategy]

    RENDER_CHECK -->|Yes| RESET_STRATEGY[Reset Strategy]
    RENDER_CHECK -->|No| FALLBACK_STRATEGY

    RESOURCE_CHECK -->|Yes| RETRY_STRATEGY
    RESOURCE_CHECK -->|No| REDIRECT_STRATEGY[Redirect Strategy]

    VALIDATION_CHECK -->|Yes| RESET_STRATEGY
    VALIDATION_CHECK -->|No| FALLBACK_STRATEGY

    AUTH_CHECK -->|Yes| REDIRECT_STRATEGY
    AUTH_CHECK -->|No| RELOAD_STRATEGY[Reload Strategy]

    OTHER_CHECK -->|Yes| FALLBACK_STRATEGY
    OTHER_CHECK -->|No| RELOAD_STRATEGY

    RETRY_STRATEGY --> EXECUTE[Execute Strategy]
    RESET_STRATEGY --> EXECUTE
    FALLBACK_STRATEGY --> EXECUTE
    REDIRECT_STRATEGY --> EXECUTE
    RELOAD_STRATEGY --> EXECUTE

    EXECUTE --> SUCCESS{Success?}
    SUCCESS -->|Yes| RECOVERY_SUCCESS[Recovery Success]
    SUCCESS -->|No| NEXT_STRATEGY{More Strategies?}

    NEXT_STRATEGY -->|Yes| EXECUTE
    NEXT_STRATEGY -->|No| RECOVERY_FAILED[Recovery Failed]

    RECOVERY_SUCCESS --> END[End]
    RECOVERY_FAILED --> END

    %% Styling
    classDef start fill:#e17055,stroke:#d63031,stroke-width:3px,color:#fff
    classDef network fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff
    classDef render fill:#fd79a8,stroke:#e84393,stroke-width:2px,color:#fff
    classDef resource fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#fff
    classDef validation fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef auth fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef other fill:#636e72,stroke:#2d3436,stroke-width:2px,color:#fff
    classDef strategy fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#fff
    classDef success fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef failure fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef end fill:#2d3436,stroke:#636e72,stroke-width:3px,color:#fff

    class START start
    class NETWORK_CHECK,NETWORK_CHECK network
    class RENDER_CHECK,RENDER_CHECK render
    class RESOURCE_CHECK,RESOURCE_CHECK resource
    class VALIDATION_CHECK,VALIDATION_CHECK validation
    class AUTH_CHECK,AUTH_CHECK auth
    class OTHER_CHECK,OTHER_CHECK other
    class RETRY_STRATEGY,RESET_STRATEGY,FALLBACK_STRATEGY,REDIRECT_STRATEGY,RELOAD_STRATEGY strategy
    class RECOVERY_SUCCESS success
    class RECOVERY_FAILED failure
    class END end
```

## 📊 Error Reporting & Analytics System

The error reporting system provides comprehensive error tracking, analytics, and monitoring capabilities with configurable filtering and batch processing.

### Error Reporting Architecture

```mermaid
graph TB
    subgraph "🦊 Error Reporting System"
        subgraph "Report Generation"
            ERROR_REPORT[Error Report Creation]
            CONTEXT_DATA[Context Data Collection]
            USER_REPORT[User Report Input]
        end

        subgraph "Report Processing"
            FILTER_ENGINE[Filter Engine]
            BATCH_PROCESSOR[Batch Processor]
            METRICS_CALC[Metrics Calculator]
        end

        subgraph "Filter Types"
            SEVERITY_FILTER[Severity Filter]
            CATEGORY_FILTER[Category Filter]
            MESSAGE_FILTER[Message Filter]
            COMPONENT_FILTER[Component Filter]
        end

        subgraph "Report Destinations"
            REMOTE_API[Remote API]
            LOCAL_STORAGE[Local Storage]
            ANALYTICS_SERVICE[Analytics Service]
        end

        subgraph "Analytics & Metrics"
            ERROR_METRICS[Error Metrics]
            TREND_ANALYSIS[Trend Analysis]
            PERFORMANCE_IMPACT[Performance Impact]
            USER_IMPACT[User Impact Analysis]
        end
    end

    %% Report Flow
    ERROR_REPORT --> CONTEXT_DATA
    CONTEXT_DATA --> USER_REPORT
    USER_REPORT --> FILTER_ENGINE

    %% Filter Processing
    FILTER_ENGINE --> SEVERITY_FILTER
    FILTER_ENGINE --> CATEGORY_FILTER
    FILTER_ENGINE --> MESSAGE_FILTER
    FILTER_ENGINE --> COMPONENT_FILTER

    SEVERITY_FILTER --> BATCH_PROCESSOR
    CATEGORY_FILTER --> BATCH_PROCESSOR
    MESSAGE_FILTER --> BATCH_PROCESSOR
    COMPONENT_FILTER --> BATCH_PROCESSOR

    %% Destination Flow
    BATCH_PROCESSOR --> REMOTE_API
    BATCH_PROCESSOR --> LOCAL_STORAGE
    BATCH_PROCESSOR --> ANALYTICS_SERVICE

    %% Analytics Flow
    BATCH_PROCESSOR --> METRICS_CALC
    METRICS_CALC --> ERROR_METRICS
    METRICS_CALC --> TREND_ANALYSIS
    METRICS_CALC --> PERFORMANCE_IMPACT
    METRICS_CALC --> USER_IMPACT

    %% Styling
    classDef report fill:#ff6b6b,stroke:#d63031,stroke-width:2px,color:#fff
    classDef processing fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#fff
    classDef filter fill:#00b894,stroke:#00a085,stroke-width:2px,color:#fff
    classDef destination fill:#fdcb6e,stroke:#e17055,stroke-width:2px,color:#fff
    classDef analytics fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#fff

    class ERROR_REPORT,CONTEXT_DATA,USER_REPORT report
    class FILTER_ENGINE,BATCH_PROCESSOR,METRICS_CALC processing
    class SEVERITY_FILTER,CATEGORY_FILTER,MESSAGE_FILTER,COMPONENT_FILTER filter
    class REMOTE_API,LOCAL_STORAGE,ANALYTICS_SERVICE destination
    class ERROR_METRICS,TREND_ANALYSIS,PERFORMANCE_IMPACT,USER_IMPACT analytics
```

### Error Reporting Flow

```mermaid
sequenceDiagram
    participant App as Application
    participant EB as ErrorBoundary
    participant ER as ErrorReporter
    participant Filter as Filter Engine
    participant Batch as Batch Processor
    participant API as Remote API
    participant Analytics as Analytics Service

    App->>EB: Error Occurs
    EB->>ER: Create Error Report
    ER->>Filter: Apply Filters
    Filter->>Filter: Check Severity
    Filter->>Filter: Check Category
    Filter->>Filter: Check Message
    Filter->>Filter: Check Component

    alt Filter Passes
        Filter->>Batch: Add to Batch
        Batch->>Batch: Check Batch Size

        alt Batch Full
            Batch->>API: Send Batch
            Batch->>Analytics: Send Analytics
            API-->>Batch: Confirmation
            Analytics-->>Batch: Confirmation
        else Batch Not Full
            Batch->>Batch: Wait for More
        end
    else Filter Fails
        Filter->>ER: Discard Report
    end

    ER-->>EB: Report Processed
    EB-->>App: Error Handled
```

## 🔧 Technical Documentation

### ReynardLogger Implementation Details

The ReynardLogger is a singleton-based logging system designed for the Reynard ecosystem. It provides comprehensive logging capabilities with the following key features:

#### Core Architecture

```typescript
export class ReynardLogger {
  private static instance: ReynardLogger;
  private config: LoggerConfig;
  private destinations: Map<string, LogDestination> = new Map();
  private memoryBuffer: LogEntry[] = [];
  private performanceMetrics: Map<string, number> = new Map();
  private sessionId: string;
  private flushTimer?: NodeJS.Timeout;
}
```

#### Log Entry Structure

```typescript
interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
  performance?: {
    duration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  metadata?: Record<string, unknown>;
}
```

#### Context Enrichment

The logger automatically enriches log entries with contextual information:

```typescript
interface LogContext {
  package: string;
  component?: string;
  function?: string;
  userId?: string;
  sessionId: string;
  requestId?: string;
  correlationId?: string;
  environment: string;
  version: string;
  timestamp: number;
  [key: string]: unknown;
}
```

#### Data Redaction System

The logger includes comprehensive data redaction to protect sensitive information:

```typescript
private redactPatterns: RegExp[] = [
  /password/i,
  /token/i,
  /secret/i,
  /auth/i,
  /credential/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
  /refresh[_-]?token/i
];
```

#### Performance Monitoring

Built-in performance tracking capabilities:

```typescript
public performance(name: string, duration: number, context?: Partial<LogContext>): void {
  if (!this.config.enablePerformance) return;

  this.performanceMetrics.set(name, duration);
  this.log('INFO', `Performance: ${name}`, { duration }, context);
}
```

#### Security Logging

Dedicated security event logging:

```typescript
public security(event: string, data?: unknown, context?: Partial<LogContext>): void {
  if (!this.config.enableSecurity) return;

  this.log('WARN', `Security: ${event}`, data, context);
}
```

#### Analytics Integration

User behavior and application analytics:

```typescript
public analytics(event: string, data?: unknown, context?: Partial<LogContext>): void {
  if (!this.config.enableAnalytics) return;

  this.log('INFO', `Analytics: ${event}`, data, context);
}
```

### Error Analysis System

The error analysis system provides intelligent error classification and context creation:

#### Error Classification

```typescript
export function analyzeError(
  error: Error,
  errorInfo: any
): {
  severity: ErrorSeverity;
  category: ErrorCategory;
  recoverable: boolean;
  metadata: Record<string, unknown>;
};
```

#### Error Categories

- **NETWORK**: Network-related errors (fetch, timeout, connection)
- **AUTHENTICATION**: Authentication and authorization errors
- **PERMISSION**: Permission and access control errors
- **VALIDATION**: Input validation and format errors
- **RESOURCE**: Resource not found or unavailable errors
- **RENDERING**: Component rendering and UI errors
- **TIMEOUT**: Operation timeout errors
- **UNKNOWN**: Unclassified errors

#### Severity Levels

- **CRITICAL**: Errors that break the entire application
- **HIGH**: Errors that significantly impact functionality
- **MEDIUM**: Errors that impact some functionality
- **LOW**: Errors with minimal impact

### Recovery Strategies System

The recovery system provides intelligent error recovery with configurable strategies:

#### Built-in Strategies

1. **Retry Strategy**: For network and resource errors
2. **Reset Strategy**: For component state errors
3. **Fallback UI Strategy**: For rendering errors
4. **Redirect Strategy**: For critical errors
5. **Reload Strategy**: For application-level errors

#### Custom Strategy Creation

```typescript
const customStrategy = createRecoveryStrategy(
  "custom-retry",
  "Custom Retry",
  "Retry with custom logic",
  (error, context) => context.category === "network",
  async (error, context) => {
    // Custom recovery logic
    await customRetryLogic();
    return {
      success: true,
      action: "retry",
      message: "Custom retry successful",
    };
  },
  1 // Priority
);
```

### Error Reporting System

The error reporting system provides comprehensive error tracking and analytics:

#### Report Structure

```typescript
interface ErrorReport {
  id: string;
  timestamp: number;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: ErrorContext;
  userReport?: string;
  metadata: Record<string, unknown>;
}
```

#### Filter System

```typescript
interface ErrorFilter {
  type: "severity" | "category" | "message" | "component";
  value: string;
  action: "include" | "exclude";
}
```

#### Batch Processing

- Configurable batch sizes (default: 10)
- Automatic flush intervals (default: 30 seconds)
- Retry logic for failed transmissions
- Local storage fallback

### Configuration Options

#### Logger Configuration

```typescript
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  enableMemory: boolean;
  enablePerformance: boolean;
  enableSecurity: boolean;
  enableAnalytics: boolean;
  package: string;
  environment: string;
  version: string;
  maxMemoryEntries: number;
  batchSize: number;
  flushInterval: number;
  remoteEndpoint?: string;
  apiKey?: string;
  redactPatterns: RegExp[];
  samplingRate: number;
}
```

#### Error Boundary Configuration

```typescript
interface ErrorBoundaryConfig {
  fallback?: Component<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecovery?: (recoveryAction: RecoveryAction) => void;
  recoveryStrategies?: RecoveryStrategy[];
  isolate?: boolean;
  reportErrors?: boolean;
  errorReporting?: ErrorReportingConfig;
}
```

### Best Practices

#### Development Configuration

```typescript
import { enableDebugLogging } from "reynard-error-boundaries";

// Enable comprehensive logging for development
enableDebugLogging("my-package");
```

#### Production Configuration

```typescript
import { enableProductionLogging } from "reynard-error-boundaries";

// Enable production-optimized logging
enableProductionLogging("my-package");
```

#### Custom Package Logger

```typescript
import { createPackageLogger } from "reynard-error-boundaries";

const logger = createPackageLogger("my-package", {
  level: "INFO",
  enableConsole: true,
  enablePerformance: true,
  enableSecurity: true,
});
```

## ✨ Features

### 🛡️ **Error Boundary System**

- **Hierarchical Error Boundaries**: Multiple levels of error isolation
- **Automatic Error Classification**: Smart categorization of errors by type and severity
- **Recovery Strategies**: Built-in and custom recovery mechanisms
- **Error Isolation**: Prevent error propagation with configurable isolation
- **Global Error Handling**: Catch unhandled errors and promise rejections

### 🔄 **Recovery System**

- **Built-in Recovery Strategies**: Retry, reset, fallback UI, redirect, reload
- **Custom Recovery Strategies**: Create your own recovery logic
- **Recovery Priority System**: Intelligent strategy selection based on error type
- **Recovery Timeout**: Prevent hanging recovery operations
- **Recovery Analytics**: Track recovery success rates

### 📊 **Error Reporting & Analytics**

- **Automatic Error Reporting**: Send errors to external services
- **Error Filtering**: Include/exclude errors based on criteria
- **Batch Reporting**: Efficient error transmission
- **Error Metrics**: Comprehensive error analytics
- **User Reports**: Allow users to provide additional context

### 🎨 **UI Components**

- **Default Error Fallback**: Beautiful, accessible error UI
- **Custom Error Fallbacks**: Use your own error display components
- **Recovery Actions**: Interactive recovery options
- **Technical Details**: Expandable error information
- **Responsive Design**: Works on all device sizes

## 📦 Installation

```bash
npm install reynard-error-boundaries reynard-core reynard-components
```

## 🚀 Quick Start

### Basic Error Boundary

```tsx
import { ErrorBoundary } from "reynard-error-boundaries";
import { ErrorFallback } from "reynard-error-boundaries";

function App() {
  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Error caught:", error, errorInfo);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Error Boundary with Recovery

```tsx
import { ErrorBoundary, builtInRecoveryStrategies } from "reynard-error-boundaries";

function App() {
  return (
    <ErrorBoundary
      recoveryStrategies={builtInRecoveryStrategies}
      onRecovery={action => {
        console.log("Recovery action executed:", action);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Error Boundary with Reporting

```tsx
import { ErrorBoundary } from "reynard-error-boundaries";

function App() {
  return (
    <ErrorBoundary
      reportErrors={true}
      errorReporting={{
        enabled: true,
        endpoint: "/api/errors",
        apiKey: "your-api-key",
        batchSize: 10,
        flushInterval: 30000,
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

## 📚 API Reference

### ErrorBoundary Component

```tsx
interface ErrorBoundaryConfig {
  children: JSX.Element;
  fallback?: Component<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecovery?: (recoveryAction: RecoveryAction) => void;
  recoveryStrategies?: RecoveryStrategy[];
  isolate?: boolean;
  reportErrors?: boolean;
  errorReporting?: ErrorReportingConfig;
}
```

### Recovery Strategies

```tsx
interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  canRecover: (error: Error, context: ErrorContext) => boolean;
  recover: (error: Error, context: ErrorContext) => Promise<RecoveryResult>;
  priority: number;
  timeout?: number;
}
```

### Error Reporting

```tsx
interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  includeStackTrace?: boolean;
  includeUserContext?: boolean;
  filters?: ErrorFilter[];
}
```

## 🎯 Advanced Usage

### Custom Recovery Strategy

```tsx
import { createRecoveryStrategy } from "reynard-error-boundaries";

const customStrategy = createRecoveryStrategy(
  "custom-retry",
  "Custom Retry",
  "Retry with custom logic",
  (error, context) => context.category === "network",
  async (error, context) => {
    // Custom recovery logic
    await customRetryLogic();
    return {
      success: true,
      action: "retry",
      message: "Custom retry successful",
    };
  },
  1 // Priority
);

<ErrorBoundary recoveryStrategies={[customStrategy]}>
  <YourApp />
</ErrorBoundary>;
```

### Error Reporting with Filters

```tsx
<ErrorBoundary
  reportErrors={true}
  errorReporting={{
    enabled: true,
    endpoint: "/api/errors",
    filters: [
      { type: "severity", value: "critical", action: "include" },
      { type: "category", value: "network", action: "exclude" },
    ],
  }}
>
  <YourApp />
</ErrorBoundary>
```

### Using Error Boundary Hook

```tsx
import { useErrorBoundary } from "reynard-error-boundaries";

function MyComponent() {
  const { error, handleError, retry, executeRecovery } = useErrorBoundary({
    onError: (error, context) => {
      console.log("Error occurred:", error, context);
    },
  });

  const handleAsyncOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      handleError(error, { componentStack: "MyComponent" });
    }
  };

  return (
    <div>
      {error() && (
        <div>
          <p>Error: {error()?.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
      <button onClick={handleAsyncOperation}>Risky Operation</button>
    </div>
  );
}
```

## 🧪 Testing

```tsx
import { render, screen } from "reynard-testing";
import { ErrorBoundary } from "reynard-error-boundaries";

const ThrowError = () => {
  throw new Error("Test error");
};

test("should catch and display errors", () => {
  render(() => (
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  ));

  expect(screen.getByText("Something went wrong")).toBeInTheDocument();
});
```

## 🎨 Theming

The error boundary components integrate seamlessly with Reynard's theming system:

```css
/* Custom error fallback styles */
.reynard-error-fallback {
  --error-bg: var(--bg-color);
  --error-text: var(--text-primary);
  --error-accent: var(--accent);
}
```

## 📊 Error Analytics

```tsx
import { useErrorReporting } from "reynard-error-boundaries";

function ErrorDashboard() {
  const { getMetrics } = useErrorReporting({
    enabled: true,
    endpoint: "/api/errors",
  });

  const metrics = getMetrics();

  return (
    <div>
      <h2>Error Metrics</h2>
      <p>Total Errors: {metrics.totalReports}</p>
      <p>Average per Hour: {metrics.averageReportsPerHour}</p>
    </div>
  );
}
```

## 🔧 Configuration

### Error Classification

Errors are automatically classified by:

- **Category**: rendering, network, validation, authentication, permission, resource, timeout, unknown
- **Severity**: low, medium, high, critical
- **Recoverability**: whether the error can be automatically recovered

### Recovery Strategies

Built-in recovery strategies:

- **Retry**: For network and resource errors
- **Fallback UI**: For rendering errors
- **Reset**: For component state errors
- **Redirect**: For critical errors
- **Reload**: For application-level errors

## 🤝 Contributing

See the main [Reynard repository](../../../README.md) for contribution guidelines.

---

**Built with ❤️ using SolidJS and the Reynard framework** 🦊

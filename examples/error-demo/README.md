# 🦊 Reynard Error Boundary Demo

A comprehensive demonstration of the Reynard Error Boundary System, showcasing advanced error handling,
recovery strategies, and analytics.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python 3** (v3.8 or higher)
- **npm** (v8 or higher)

### Installation & Running

1. **Clone and navigate to the demo:**

   ```bash
   cd examples/error-demo
   ```

2. **Start the demo (recommended):**

   ```bash
   ./start.sh
   ```

   Or manually:

3. **Install dependencies:**

   ```bash
   # Install Python dependencies
   cd backend
   pip3 install -r requirements.txt
   cd ..

   # Install Node.js dependencies
   npm install
   ```

4. **Start both servers:**

   ```bash
   npm run dev:full
   ```

5. **Access the demo:**
   - **Frontend:** <http://localhost:3002>
   - **Backend API:** <http://localhost:8000>
   - **API Documentation:** <http://localhost:8000/docs>

## 🎯 Features Demonstrated

### 🛡️ Error Boundaries

- **Hierarchical Error Isolation:** Multiple error boundaries with different scopes
- **Automatic Error Classification:** Network, validation, auth, permission, resource, timeout, rendering errors
- **Severity Assessment:** Low, medium, high, critical error levels
- **Context Preservation:** Error context, stack traces, and user information

### 🔄 Recovery Strategies

- **Retry Strategy:** Automatic retry with exponential backoff
- **Reset Strategy:** Component reset to initial state
- **Fallback UI Strategy:** Graceful degradation to simplified interface
- **Redirect Strategy:** Safe page redirection for critical errors
- **Reload Strategy:** Full application reload as last resort
- **Priority-Based Execution:** Strategies executed in order of priority

### 📊 Error Analytics

- **Real-time Monitoring:** Live error tracking and reporting
- **Recovery Statistics:** Success rates, timing, and performance metrics
- **Error Classification:** Categorized error reports with severity levels
- **Performance Metrics:** System health and response time monitoring

### 🎨 User Experience

- **Beautiful Error UI:** Accessible, user-friendly error interfaces
- **Interactive Recovery:** User-controlled recovery actions
- **Technical Details:** Expandable error information for developers
- **Responsive Design:** Works on desktop and mobile devices

## 🏗️ Architecture

### Frontend (SolidJS)

```
src/
├── App.tsx                 # Main application component
├── components/
│   ├── ErrorDemo.tsx      # Error simulation components
│   ├── RecoveryDemo.tsx   # Recovery strategy demonstrations
│   └── AnalyticsDashboard.tsx # Analytics and monitoring
├── main.tsx               # Application entry point
└── index.css              # Application styles
```

### Backend (FastAPI)

```
backend/
├── main.py                # FastAPI server with error endpoints
└── requirements.txt       # Python dependencies
```

## 🧪 Error Scenarios

### Network Errors

- **Simulation:** API connectivity issues, server unavailability
- **Recovery:** Automatic retry, fallback data, offline mode
- **Classification:** Network category, medium severity

### Timeout Errors

- **Simulation:** Slow server responses, request timeouts
- **Recovery:** Retry with backoff, timeout handling
- **Classification:** Network category, medium severity

### Validation Errors

- **Simulation:** Invalid input data, form validation failures
- **Recovery:** Input correction, validation feedback
- **Classification:** Validation category, low severity

### Authentication Errors

- **Simulation:** Session expiration, invalid credentials
- **Recovery:** Re-authentication, session refresh
- **Classification:** Authentication category, high severity

### Permission Errors

- **Simulation:** Access control violations, insufficient privileges
- **Recovery:** Permission request, role elevation
- **Classification:** Permission category, high severity

### Resource Errors

- **Simulation:** Missing data, file not found
- **Recovery:** Resource creation, alternative resources
- **Classification:** Resource category, medium severity

### Critical Errors

- **Simulation:** System failures, unexpected errors
- **Recovery:** Application reload, emergency fallback
- **Classification:** Critical severity, immediate attention

### Rendering Errors

- **Simulation:** Component failures, React errors
- **Recovery:** Component reset, fallback UI
- **Classification:** Rendering category, medium severity

## 🔧 Configuration

### Error Boundary Configuration

```typescript
<ErrorBoundary
  fallback={(error, retry, reset) => <CustomErrorUI />}
  onError={(error, errorInfo) => {
    // Custom error handling
  }}
  recoveryStrategies={[
    retryStrategy,
    fallbackUIStrategy,
    resetStrategy
  ]}
  reporting={{
    enabled: true,
    endpoint: "/api/reports/error",
    batchSize: 10
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Recovery Strategy Configuration

```typescript
const customStrategy = createRecoveryStrategy({
  id: "custom-recovery",
  name: "Custom Recovery",
  description: "Custom recovery logic",
  canRecover: (error, context) => {
    return context.category === ErrorCategory.NETWORK;
  },
  recover: async (error, context) => {
    // Custom recovery logic
    return { success: true, message: "Recovered" };
  },
  priority: 1,
  timeout: 5000,
});
```

## 📈 Analytics & Monitoring

### Error Metrics

- **Total Errors:** Count of all errors encountered
- **Error Rate:** Errors per time period
- **Recovery Success Rate:** Percentage of successful recoveries
- **Average Recovery Time:** Time taken for recovery operations

### Performance Metrics

- **System Uptime:** Application availability
- **Response Times:** API and recovery operation timing
- **Error Categories:** Distribution of error types
- **Recovery Strategies:** Usage and success rates

## 🎮 Interactive Demo

### Error Simulation

1. Navigate to **Error Demos** tab
2. Click error simulation buttons
3. Observe error boundary behavior
4. Test different error categories

### Recovery Testing

1. Navigate to **Recovery** tab
2. Execute different recovery strategies
3. Observe recovery behavior and timing
4. Test strategy priority and fallback

### Analytics Monitoring

1. Navigate to **Analytics** tab
2. View real-time error statistics
3. Monitor recovery performance
4. Track system health metrics

## 🔍 API Endpoints

### Error Simulation

- `GET /api/errors/network` - Simulate network errors
- `GET /api/errors/timeout` - Simulate timeout errors
- `GET /api/errors/validation` - Simulate validation errors
- `GET /api/errors/authentication` - Simulate auth errors
- `GET /api/errors/permission` - Simulate permission errors
- `GET /api/errors/resource` - Simulate resource errors
- `GET /api/errors/critical` - Simulate critical errors
- `GET /api/errors/rendering` - Simulate rendering errors

### Recovery Operations

- `POST /api/recovery/retry` - Execute retry strategy
- `POST /api/recovery/reset` - Execute reset strategy
- `POST /api/recovery/fallback` - Execute fallback strategy
- `POST /api/recovery/redirect` - Execute redirect strategy
- `POST /api/recovery/reload` - Execute reload strategy

### Analytics & Reporting

- `GET /api/analytics/errors` - Get error analytics
- `GET /api/analytics/recovery` - Get recovery analytics
- `POST /api/reports/error` - Report an error
- `GET /api/demo/status` - Get demo status
- `POST /api/demo/reset` - Reset demo state

## 🛠️ Development

### Adding New Error Types

1. Add error simulation endpoint in `backend/main.py`
2. Create error component in `src/components/ErrorDemo.tsx`
3. Add error boundary wrapper
4. Test error classification and recovery

### Adding New Recovery Strategies

1. Implement strategy in `backend/main.py`
2. Create demo component in `src/components/RecoveryDemo.tsx`
3. Add strategy to error boundary configuration
4. Test strategy execution and priority

### Customizing Error UI

1. Modify `ErrorFallback` component in error-boundaries package
2. Update CSS styles in `src/index.css`
3. Add custom error reporting logic
4. Test accessibility and responsiveness

## 📚 Learn More

- **Reynard Framework:** [Documentation](../../README.md)
- **Error Boundaries Package:** [Package Documentation](../../packages/error-boundaries/README.md)
- **SolidJS:** [Official Documentation](https://www.solidjs.com/)
- **FastAPI:** [Official Documentation](https://fastapi.tiangolo.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../../LICENSE.md) file for details.

---

**🦊 Built with Reynard Framework** - A comprehensive SolidJS framework for modern web applications.

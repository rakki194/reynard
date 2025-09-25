# 🌐 Reynard Browser Automation Service

Advanced browser automation service with comprehensive web automation capabilities using Playwright.

## 🌟 Features

- **Screenshot Capture**: Full page and element-specific screenshots
- **Web Scraping**: Advanced content extraction with link and image extraction
- **PDF Generation**: Convert web pages to PDF documents
- **JavaScript Execution**: Run custom JavaScript on web pages
- **Interactive Automation**: Perform complex user interactions
- **Proxy Support**: Built-in proxy configuration
- **Custom User Agents**: Flexible user agent customization
- **Performance Optimization**: Efficient browser pool management

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -e .

# Install Playwright browsers
playwright install chromium
```

### Running the Service

```bash
# Start the FastAPI server
uvicorn reynard_browser_automation.api:app --host 0.0.0.0 --port 8001
```

### API Usage

#### Take Screenshot

```bash
curl -X POST "http://localhost:8001/screenshot" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "viewport_width": 1920,
    "viewport_height": 1080,
    "full_page": true
  }' \
  --output screenshot.png
```

#### Scrape Webpage

```bash
curl -X POST "http://localhost:8001/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "extract_links": true,
    "extract_images": true
  }'
```

#### Generate PDF

```bash
curl -X POST "http://localhost:8001/pdf" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "pdf_options": {
      "format": "A4",
      "print_background": true
    }
  }' \
  --output document.pdf
```

## 📚 API Reference

### Endpoints

| Endpoint           | Method | Description               |
| ------------------ | ------ | ------------------------- |
| `/health`          | GET    | Health check              |
| `/info`            | GET    | Service information       |
| `/screenshot`      | POST   | Take screenshot           |
| `/screenshot/save` | POST   | Save screenshot to file   |
| `/scrape`          | POST   | Scrape webpage content    |
| `/pdf`             | POST   | Generate PDF              |
| `/pdf/save`        | POST   | Save PDF to file          |
| `/javascript`      | POST   | Execute JavaScript        |
| `/interact`        | POST   | Perform page interactions |

### Request Models

#### ScreenshotRequest

```json
{
  "url": "string (required)",
  "viewport_width": "integer (default: 1920)",
  "viewport_height": "integer (default: 1080)",
  "full_page": "boolean (default: true)",
  "quality": "integer (default: 100)",
  "selector": "string (optional)",
  "wait_for": "string (optional)",
  "wait_timeout": "integer (default: 30000)",
  "user_agent": "string (optional)",
  "proxy": "object (optional)"
}
```

#### ScrapingRequest

```json
{
  "url": "string (required)",
  "selector": "string (optional)",
  "viewport_width": "integer (default: 1920)",
  "viewport_height": "integer (default: 1080)",
  "wait_for": "string (optional)",
  "wait_timeout": "integer (default: 30000)",
  "user_agent": "string (optional)",
  "proxy": "object (optional)",
  "extract_links": "boolean (default: false)",
  "extract_images": "boolean (default: false)"
}
```

## 🎯 Advanced Features

### Interactive Automation

Perform complex user interactions with the `/interact` endpoint:

```json
{
  "url": "https://example.com",
  "interactions": [
    {
      "action": "click",
      "selector": "#login-button",
      "wait": 1000
    },
    {
      "action": "type",
      "selector": "#username",
      "value": "myusername",
      "wait": 500
    },
    {
      "action": "type",
      "selector": "#password",
      "value": "mypassword",
      "wait": 500
    },
    {
      "action": "click",
      "selector": "#submit",
      "wait": 2000
    },
    {
      "action": "screenshot",
      "wait": 1000
    }
  ]
}
```

### JavaScript Execution

Execute custom JavaScript on web pages:

```json
{
  "url": "https://example.com",
  "script": "return document.title + ' - ' + window.location.href;"
}
```

### Proxy Configuration

Use proxy servers for requests:

```json
{
  "url": "https://example.com",
  "proxy": {
    "server": "http://proxy.example.com:8080",
    "username": "user",
    "password": "pass"
  }
}
```

## 🔧 Configuration

### PDF Options

Customize PDF generation:

```json
{
  "url": "https://example.com",
  "pdf_options": {
    "format": "A4",
    "print_background": true,
    "margin": {
      "top": "2cm",
      "right": "2cm",
      "bottom": "2cm",
      "left": "2cm"
    },
    "display_header_footer": true,
    "header_template": "<div>Header</div>",
    "footer_template": "<div>Footer</div>"
  }
}
```

### Viewport Configuration

Customize browser viewport:

```json
{
  "url": "https://example.com",
  "viewport_width": 1280,
  "viewport_height": 720
}
```

## 🧪 Testing

```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=reynard_browser_automation tests/
```

## 🏗️ Architecture

The service is built with a modular architecture:

- **`browser_service.py`**: Core browser automation logic
- **`api.py`**: FastAPI application and endpoints

## 🔍 Health Monitoring

Monitor service health:

```bash
curl http://localhost:8001/health
```

Returns detailed health information including:

- Service availability
- Browser service status
- Performance metrics

## 🚀 Performance

- **Optimized Browser Management**: Efficient browser lifecycle management
- **Resource Pooling**: Browser pool for improved performance
- **Memory Management**: Proper cleanup and resource management
- **Error Handling**: Comprehensive error handling and recovery

## 🔒 Security

- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Secure error messages without sensitive information
- **Resource Limits**: Proper resource management and cleanup
- **Proxy Support**: Secure proxy configuration

## 📈 Use Cases

### Web Scraping

- Extract content from dynamic websites
- Scrape e-commerce product information
- Monitor website changes
- Data collection and analysis

### Screenshot Automation

- Website monitoring and testing
- Visual regression testing
- Documentation generation
- Quality assurance

### PDF Generation

- Convert web pages to documents
- Generate reports from web data
- Create printable versions of web content
- Document archiving

### Interactive Automation

- Form filling and submission
- User flow testing
- E2E testing automation
- Workflow automation

## 🎯 Integration

This service integrates seamlessly with:

- **Reynard MCP Server**: Enhanced browser automation tools
- **Reynard Backend**: FastAPI service integration
- **Third-party Applications**: REST API compatibility

## 🐛 Troubleshooting

### Common Issues

1. **Playwright not available**: Install with `playwright install chromium`
2. **Browser crashes**: Check system resources and browser installation
3. **Timeout errors**: Increase wait_timeout values
4. **Memory issues**: Ensure adequate system memory for browser automation

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📄 License

Part of the Reynard ecosystem. See main project license.

## 🤝 Contributing

Contributions are welcome! Please follow the Reynard coding standards and submit pull requests to the main repository.

---

_Built with 🦊 Reynard precision and 🌐 web automation expertise_

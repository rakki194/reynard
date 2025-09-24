# 🎨 Reynard Mermaid Renderer

A comprehensive Mermaid diagram rendering service with SVG, PNG, and PDF support, built with Playwright and FastAPI.

## 🌟 Features

- **Multiple Output Formats**: SVG, PNG, and PDF rendering
- **Advanced Theming**: Support for all Mermaid themes (default, neutral, dark, forest, base, autumn, winter)
- **High Performance**: Optimized Playwright browser automation
- **REST API**: Clean FastAPI-based REST endpoints
- **Comprehensive Validation**: Diagram syntax validation and error reporting
- **Statistics**: Detailed diagram analysis and metrics
- **Health Monitoring**: Built-in health checks and service monitoring

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
uvicorn reynard_mermaid_renderer.api:app --host 0.0.0.0 --port 8000
```

### API Usage

#### Render to SVG

```bash
curl -X POST "http://localhost:8000/render/svg" \
  -H "Content-Type: application/json" \
  -d '{
    "diagram": "graph TD\n    A[Start] --> B[End]",
    "theme": "default"
  }'
```

#### Render to PNG

```bash
curl -X POST "http://localhost:8000/render/png" \
  -H "Content-Type: application/json" \
  -d '{
    "diagram": "graph TD\n    A[Start] --> B[End]",
    "theme": "dark"
  }' \
  --output diagram.png
```

#### Validate Diagram

```bash
curl -X POST "http://localhost:8000/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "diagram": "graph TD\n    A[Start] --> B[End]"
  }'
```

## 📚 API Reference

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/info` | GET | Service information |
| `/themes` | GET | Available themes |
| `/render/svg` | POST | Render to SVG |
| `/render/png` | POST | Render to PNG |
| `/render/pdf` | POST | Render to PDF |
| `/validate` | POST | Validate diagram |
| `/stats` | POST | Get diagram statistics |
| `/save/svg` | POST | Save as SVG file |
| `/save/png` | POST | Save as PNG file |
| `/save/pdf` | POST | Save as PDF file |

### Request Models

#### RenderRequest

```json
{
  "diagram": "string (required)",
  "theme": "string (default: 'default')",
  "bg_color": "string (optional)",
  "width": "integer (optional)",
  "height": "integer (optional)",
  "config": "object (optional)"
}
```

#### ValidationRequest

```json
{
  "diagram": "string (required)"
}
```

## 🎨 Supported Themes

- `default` - Default Mermaid theme
- `neutral` - Neutral color scheme
- `dark` - Dark theme
- `forest` - Forest green theme
- `base` - Base theme
- `autumn` - Autumn colors
- `winter` - Winter theme

## 🔧 Configuration

### Custom Mermaid Configuration

You can provide custom Mermaid configuration through the `config` parameter:

```json
{
  "diagram": "graph TD\n    A[Start] --> B[End]",
  "config": {
    "flowchart": {
      "nodeSpacing": 100,
      "rankSpacing": 100
    },
    "theme": "dark"
  }
}
```

### PDF Options

For PDF rendering, you can customize PDF generation:

```json
{
  "diagram": "graph TD\n    A[Start] --> B[End]",
  "pdf_options": {
    "format": "A4",
    "margin": {
      "top": "2cm",
      "right": "2cm",
      "bottom": "2cm",
      "left": "2cm"
    }
  }
}
```

## 🧪 Testing

```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=reynard_mermaid_renderer tests/
```

## 🏗️ Architecture

The service is built with a modular architecture:

- **`browser_service.py`**: Enhanced Playwright browser automation
- **`mermaid_renderer.py`**: Core Mermaid rendering logic
- **`service.py`**: Main service interface
- **`api.py`**: FastAPI application and endpoints

## 🔍 Health Monitoring

The service provides comprehensive health monitoring:

```bash
curl http://localhost:8000/health
```

Returns detailed health information including:

- Service availability
- Test diagram validation
- Browser service status
- Performance metrics

## 🚀 Performance

- **Optimized Browser Automation**: Uses Chromium with optimized settings
- **Efficient Rendering**: Minimal overhead for diagram processing
- **Memory Management**: Proper browser lifecycle management
- **Error Handling**: Comprehensive error handling and recovery

## 🔒 Security

- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Secure error messages without sensitive information
- **Resource Limits**: Proper resource management and cleanup

## 📈 Statistics

Get detailed statistics about your diagrams:

```bash
curl -X POST "http://localhost:8000/stats" \
  -H "Content-Type: application/json" \
  -d '{"diagram": "graph TD\n    A[Start] --> B[End]"}'
```

Returns:

- Diagram validity
- File sizes for different formats
- Line counts and complexity metrics
- Available themes and versions

## 🎯 Integration

This service is designed to integrate seamlessly with:

- **Reynard MCP Server**: Enhanced Mermaid tools
- **Reynard Backend**: FastAPI service integration
- **Third-party Applications**: REST API compatibility

## 🐛 Troubleshooting

### Common Issues

1. **Playwright not available**: Install with `playwright install chromium`
2. **Browser crashes**: Check system resources and browser installation
3. **Rendering errors**: Validate diagram syntax first
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

*Built with 🦊 Reynard precision and 🎨 artistic flair*

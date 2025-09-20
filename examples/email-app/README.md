# Reynard Email System

A comprehensive email management system for Reynard with agent integration, providing both administrative email functionality and agent-to-agent communication capabilities.

## Features

### 🦊 Core Email Functionality

- **Email Composer**: Rich email composition with templates, attachments, and HTML support
- **Email Inbox**: View and manage received messages with filtering and search
- **Email Templates**: Create and manage reusable email templates with variable substitution
- **Bulk Email**: Send emails to multiple recipients with batch processing

### 🤖 Agent Integration

- **Agent-to-Agent Communication**: Direct email communication between agents
- **Automated Email Triggers**: Event-based automated email generation
- **Agent Email Statistics**: Track email activity and engagement metrics
- **Agent Email Templates**: Specialized templates for agent interactions

### 📊 Administrative Features

- **Email Dashboard**: Overview of email activity and system status
- **Email Status Monitoring**: Real-time email service health monitoring
- **Template Management**: Create, edit, and organize email templates
- **Agent Center**: Centralized agent email management interface

## Architecture

### Backend Components

#### Email Service (`backend/app/services/email_service.py`)

- SMTP email sending with TLS/SSL support
- Attachment handling and HTML email support
- Bulk email processing with rate limiting
- Email status tracking and delivery confirmation

#### Agent Email Service (`backend/app/services/agent_email_service.py`)

- Agent-specific email configuration management
- Automated email trigger processing
- Agent email statistics and analytics
- Template-based email generation

#### API Routes

- **Email Routes** (`/api/email/*`): Standard email operations
- **Agent Email Routes** (`/api/email/agents/*`): Agent-specific email functionality

### Frontend Components

#### Email Package (`packages/email/`)

- **Composables**: `useEmail` and `useAgentEmail` for state management
- **Components**: `EmailComposer` for rich email composition
- **Types**: Comprehensive TypeScript definitions

#### Email App (`examples/email-app/`)

- **Dashboard**: Email activity overview and quick actions
- **Composer**: Rich email composition interface
- **Inbox**: Message viewing and management
- **Templates**: Template creation and management
- **Agent Center**: Agent email management interface

### MCP Integration

#### Email Tools (`services/mcp-server/tools/email_tools.py`)

- `send_agent_email`: Send emails between agents
- `get_agent_email_stats`: Retrieve agent email statistics
- `create_agent_email_template`: Create agent-specific templates
- `trigger_agent_automated_email`: Trigger automated emails
- `setup_agent_email`: Configure agent email settings

## Usage

### Starting the Email App

1. **Install Dependencies**:

   ```bash
   cd examples/email-app
   pnpm install
   ```

2. **Start Development Server**:

   ```bash
   pnpm dev
   ```

3. **Access the Application**:
   - Open <http://localhost:3001> in your browser
   - The app will proxy API requests to the backend at <http://localhost:8000>

### Backend Configuration

1. **Email Service Configuration**:
   Set the following environment variables:

   ```bash
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_USE_TLS=true
   FROM_EMAIL=your-email@gmail.com
   FROM_NAME=Reynard System
   ```

2. **Start Backend Server**:

   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

### Agent Email Setup

1. **Configure Agent Email**:
   Use the MCP `setup_agent_email` tool:

   ```python
   await setup_agent_email(
       agent_id="agent-123",
       agent_name="Sharp-Grandmaster-89",
       agent_email="sharp-grandmaster-89@reynard.ai"
   )
   ```

2. **Create Agent Templates**:

   ```python
   await create_agent_email_template(
       agent_id="agent-123",
       name="Welcome Message",
       subject="Welcome to the Reynard System, {agent_name}!",
       body="Hello {agent_name}, welcome to the Reynard ecosystem!",
       trigger_conditions={"event_type": "agent_interaction"}
   )
   ```

3. **Send Agent Emails**:

   ```python
   await send_agent_email(
       sender_agent_id="agent-123",
       target_agent_id="agent-456",
       subject="Hello from Reynard!",
       body="This is a test message from one agent to another."
   )
   ```

## API Endpoints

### Standard Email Endpoints

- `POST /api/email/send` - Send a single email
- `POST /api/email/send-simple` - Send a simple email
- `POST /api/email/send-bulk` - Send bulk emails
- `GET /api/email/status` - Get email service status
- `POST /api/email/test` - Test email connection

### Agent Email Endpoints

- `GET /api/email/agents/{agent_id}/config` - Get agent email configuration
- `PUT /api/email/agents/{agent_id}/config` - Update agent email configuration
- `GET /api/email/agents/{agent_id}/stats` - Get agent email statistics
- `POST /api/email/agents/{agent_id}/send` - Send email from agent to agent
- `POST /api/email/agents/{agent_id}/send-bulk` - Send bulk emails from agent
- `POST /api/email/agents/{agent_id}/trigger` - Trigger automated email
- `GET /api/email/agents/{agent_id}/templates` - Get agent email templates
- `POST /api/email/agents/{agent_id}/templates` - Create agent email template
- `DELETE /api/email/agents/{agent_id}/templates/{template_id}` - Delete agent template

## Email Templates

### Template Variables

Templates support variable substitution using `{variable_name}` syntax:

```html
Subject: Welcome to Reynard, {agent_name}! Body: Hello {agent_name}, your agent ID is {agent_id} and you joined on
{join_date}.
```

### Template Categories

- **Admin**: Administrative and system emails
- **Agent**: Agent-to-agent communication templates
- **Notification**: System notifications and alerts
- **System**: Automated system-generated emails

### Trigger Conditions

Templates can be triggered automatically based on:

- **Event Type**: `agent_interaction`, `system_alert`, `manual`, `scheduled`
- **Agent Traits**: Personality and behavioral characteristics
- **Time Conditions**: Specific times or days of the week

## Agent Integration

### ECS World Integration

The email system integrates with the ECS world simulation:

- **Agent Personas**: Email behavior reflects agent personality traits
- **Social Dynamics**: Email interactions influence social relationships
- **Trait Inheritance**: Email preferences can be inherited by offspring agents

### MCP Tool Integration

Agents can use MCP tools to:

- Send emails to other agents
- Create and manage email templates
- Trigger automated emails based on events
- Monitor email statistics and activity

## Security Features

- **Authentication**: All endpoints require valid authentication
- **Input Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: Protection against email spam and abuse
- **Secure Headers**: Security headers for email content protection

## Development

### Adding New Email Features

1. **Backend**: Add new endpoints to `agent_email_routes.py`
2. **Frontend**: Create new composables in `packages/email/src/composables/`
3. **MCP**: Add new tools to `services/mcp-server/tools/email_tools.py`
4. **UI**: Create new components in `packages/email/src/components/`

### Testing

Run the test suite:

```bash
# Backend tests
cd backend
python -m pytest tests/test_email/

# Frontend tests
cd examples/email-app
pnpm test
```

## Contributing

1. Follow the 140-line axiom for code organization
2. Use TypeScript for frontend components
3. Add comprehensive tests for new features
4. Update documentation for API changes
5. Follow the Reynard coding standards

## License

This project is part of the Reynard ecosystem and follows the same licensing terms.

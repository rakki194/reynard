# Customer Modeling Microservice

Enterprise-grade customer modeling and analytics service built with FastAPI.

## Overview

The Customer Modeling Microservice provides comprehensive customer behavior analysis, predictive modeling, and real-time personalization capabilities. It's designed as a separate ECS world from the playful agent system, ensuring enterprise-grade customer analytics.

## Features

- **Customer Identity Management**: Complete customer profile management with demographics
- **Behavioral Analytics**: Real-time behavior tracking and metrics collection
- **Predictive Modeling**: Churn prediction, lifetime value, and purchase probability
- **Customer Journey Tracking**: Complete customer journey orchestration
- **Privacy & Compliance**: GDPR/CCPA compliant data management
- **Real-time Segmentation**: Dynamic customer segmentation engine
- **Analytics Dashboard**: Comprehensive customer insights and reporting

## Architecture

```
services/customer-modeling/
├── app/
│   ├── api/                    # API endpoints
│   ├── core/                   # Core configuration
│   ├── models/                 # Database models
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business logic
│   └── main.py                 # FastAPI application
├── requirements.txt
├── Dockerfile
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 13+
- Redis 6+

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Set environment variables:

   ```bash
   export DATABASE_URL="postgresql://user:password@localhost/customer_modeling"
   export REDIS_URL="redis://localhost:6379"
   export SECRET_KEY="your-secret-key"
   ```

4. Run the application:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Docker

```bash
docker build -t customer-modeling .
docker run -p 8001:8001 customer-modeling
```

## API Documentation

Once running, visit:

- Swagger UI: <http://localhost:8001/docs>
- ReDoc: <http://localhost:8001/redoc>

## Key Endpoints

- `POST /api/v1/customer-modeling/customers` - Create customer
- `GET /api/v1/customer-modeling/customers/{uuid}` - Get customer
- `POST /api/v1/customer-modeling/customers/{uuid}/behavior-metrics` - Record metrics
- `GET /api/v1/customer-modeling/customers/{uuid}/predictive-data` - Get predictions
- `GET /api/v1/customer-modeling/segmentation` - Get customer segments
- `POST /api/v1/customer-modeling/analytics/update-predictions` - Update predictions

## Configuration

Key environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `SECRET_KEY`: Application secret key
- `DEBUG`: Enable debug mode
- `PRIVACY_LEVEL`: Privacy anonymization level (level_1 to level_4)
- `GDPR_COMPLIANCE`: Enable GDPR compliance features

## Development

### Running Tests

```bash
pytest
```

### Code Quality

```bash
black .
isort .
flake8 .
mypy .
```

## Integration

This microservice integrates with:

- **Backend ECS World**: `backend/app/ecs/customer_modeling/`
- **Customer Data Platform**: `backend/app/services/customer-platform/`
- **Analytics Engine**: `backend/app/services/customer-analytics/`

## License

Part of the Reynard Commerce Ecosystem.

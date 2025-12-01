# Implementation Summary: Configuration Template and Instance APIs

## Overview
Added comprehensive APIs to the `packages/server` package for reading configuration templates and managing configuration instances (CRUD operations).

## Changes Made

### 1. New Route Files

#### `/packages/server/src/routes/templates.ts`
- **GET /api/templates** - List all available configuration templates
- **GET /api/templates/:templateId** - Get detailed information about a specific template

Features:
- Returns template metadata including provider, supported models, default config, and secret fields
- Properly handles initialization of LLMManager
- Includes error handling for not-found cases

#### `/packages/server/src/routes/instances.ts`
- **GET /api/instances** - List all configuration instances
- **GET /api/instances/current** - Get the currently selected instance
- **GET /api/instances/:instanceId** - Get details of a specific instance
- **POST /api/instances** - Create a new instance from a template
- **PUT /api/instances/:instanceId** - Update an existing instance
- **PUT /api/instances/:instanceId/select** - Set an instance as the current active instance

Features:
- Full CRUD operations for configuration instances
- Supports creating instances with custom config and secrets
- Allows updating instance properties including name, config, secrets, and selected model
- Enables switching between different provider instances
- Comprehensive error handling and validation

### 2. Updated Files

#### `/packages/server/src/index.ts`
- Added imports for new routes (`templatesRouter`, `instancesRouter`)
- Registered new routes at `/api/templates` and `/api/instances`
- Updated server info endpoint to include new API endpoints in the response

#### `/packages/server/README.md`
- Updated API documentation with complete examples for all new endpoints
- Added curl examples for:
  - Listing and retrieving templates
  - Creating, reading, updating instances
  - Selecting current instance
- Added detailed request/response examples with proper JSON structure
- Updated the root endpoint response to include new endpoints

## API Endpoints Summary

### Templates (Read-Only)
```
GET /api/templates          - List all templates
GET /api/templates/:id      - Get specific template
```

### Instances (Full CRUD)
```
GET    /api/instances                    - List all instances
GET    /api/instances/current            - Get current instance
GET    /api/instances/:id                - Get specific instance
POST   /api/instances                    - Create new instance
PUT    /api/instances/:id                - Update instance
PUT    /api/instances/:id/select         - Set as current instance
```

## Integration with Core Package

The implementation leverages existing methods from `@unillm-ts/core`:
- `LLMManager.getConfigTemplates()` - Retrieve template list
- `LLMManager.listInstances()` - List all instances
- `LLMManager.getInstance(id)` - Get specific instance
- `LLMManager.getCurrentInstance()` - Get current instance
- `LLMManager.createInstanceFromTemplate()` - Create instance
- `LLMManager.updateInstance()` - Update instance
- `LLMManager.setCurrentInstance()` - Switch current instance

## Response Format

All endpoints follow a consistent response format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

## Use Cases

1. **Template Discovery**: Frontend can list available providers and their configurations
2. **Instance Management**: Users can create and manage multiple instances for different providers
3. **Provider Switching**: Easy switching between different LLM providers by selecting instances
4. **Configuration Customization**: Update instance settings like timeouts, base URLs, etc.
5. **Secret Management**: Securely configure API keys through the instance API

## Testing Recommendations

To test the new APIs:

```bash
# List templates
curl http://localhost:3000/api/templates

# Create an OpenAI instance
curl -X POST http://localhost:3000/api/instances \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "openai",
    "name": "My OpenAI",
    "secrets": {"api_key": "sk-..."},
    "selectedModelId": "gpt-4o"
  }'

# List instances
curl http://localhost:3000/api/instances

# Select instance
curl -X PUT http://localhost:3000/api/instances/openai-default/select

# Get current instance
curl http://localhost:3000/api/instances/current
```

## Notes

- All endpoints properly initialize the LLMManager before operations
- Error handling is consistent across all routes using Express error middleware
- TypeScript types are properly utilized from the core package
- The implementation follows the existing code style and conventions

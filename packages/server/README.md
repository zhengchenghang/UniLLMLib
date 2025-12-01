# @unillm-ts/server

RESTful API server for unillm-ts, providing HTTP endpoints for LLM operations.

## Installation

From the monorepo root:

```bash
pnpm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cd packages/server
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development
```

## Development

From the monorepo root:

```bash
# Build all packages first
pnpm build

# Start the server in development mode
pnpm dev:server
```

Or from the server package directory:

```bash
cd packages/server
pnpm dev
```

## Production

```bash
# Build all packages
pnpm build

# Start the server
pnpm start:server
```

## API Endpoints

### Root

#### GET /

Get server information and available endpoints.

**Response:**
```json
{
  "name": "@unillm-ts/server",
  "version": "1.0.0",
  "description": "RESTful API server for unillm-ts",
  "endpoints": {
    "chat": "/api/chat",
    "chatStream": "/api/chat/stream",
    "models": "/api/models",
    "secrets": "/api/secrets",
    "templates": "/api/templates",
    "instances": "/api/instances"
  }
}
```

### Chat

#### POST /api/chat

Send a non-streaming chat request.

**Request Body:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "content": "Hello! How can I help you today?",
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 15,
      "total_tokens": 25
    }
  }
}
```

#### POST /api/chat/stream

Send a streaming chat request using Server-Sent Events (SSE).

**Request Body:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**

Server-Sent Events (SSE) stream:

```
data: {"content":"Hello"}

data: {"content":"!"}

data: {"content":" How"}

data: [DONE]
```

**Example with curl:**

```bash
curl -N -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      { "role": "user", "content": "Write a haiku" }
    ]
  }'
```

### Models

#### GET /api/models

List all available models.

**Response:**
```json
{
  "success": true,
  "data": {
    "models": ["gpt-3.5-turbo", "gpt-4", "qwen-plus", ...],
    "count": 10
  }
}
```

#### GET /api/models/:modelName

Get detailed information about a specific model.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "gpt-3.5-turbo",
    "name": "GPT-3.5 Turbo",
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "description": "Fast and efficient model",
    "parameters": {...},
    "dataFormats": {
      "input": ["text"],
      "output": ["text"]
    }
  }
}
```

### Secrets (API Keys)

#### POST /api/secrets

Store a secret (API key).

**Request Body:**
```json
{
  "key": "openai-default-api_key",
  "value": "sk-..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Secret set successfully"
}
```

#### GET /api/secrets/:key

Get a stored secret value.

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "openai-default-api_key",
    "value": "sk-..."
  }
}
```

#### DELETE /api/secrets/:key

Delete a secret.

**Response:**
```json
{
  "success": true,
  "message": "Secret deleted successfully"
}
```

#### GET /api/secrets

List all secret keys (values included - use with caution!).

**Response:**
```json
{
  "success": true,
  "data": ["openai-default-api_key", "qwen-default-api_key", ...]
}
```

#### DELETE /api/secrets

Clear all secrets.

**Response:**
```json
{
  "success": true,
  "message": "All secrets cleared successfully"
}
```

### Templates

#### GET /api/templates

List all available configuration templates.

**Response:**
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "openai",
        "name": "OpenAI",
        "provider": "openai",
        "description": "OpenAI REST API template covering GPT models.",
        "modelIds": ["gpt-4o"],
        "defaultConfig": {
          "base_url": "https://api.openai.com/v1",
          "timeout": 60000
        },
        "secretFields": [
          {
            "key": "api_key",
            "label": "API Key",
            "description": "OpenAI API Key",
            "required": true
          }
        ],
        "defaultInstance": {
          "name": "OpenAI 默认实例",
          "selectedModelId": "gpt-4o"
        }
      }
    ],
    "count": 5
  }
}
```

#### GET /api/templates/:templateId

Get detailed information about a specific template.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "openai",
    "name": "OpenAI",
    "provider": "openai",
    "description": "OpenAI REST API template covering GPT models.",
    "modelIds": ["gpt-4o"],
    "defaultConfig": {
      "base_url": "https://api.openai.com/v1",
      "timeout": 60000
    },
    "secretFields": [
      {
        "key": "api_key",
        "label": "API Key",
        "description": "OpenAI API Key",
        "required": true
      }
    ]
  }
}
```

### Instances

#### GET /api/instances

List all configuration instances.

**Response:**
```json
{
  "success": true,
  "data": {
    "instances": [
      {
        "id": "openai-default",
        "templateId": "openai",
        "name": "OpenAI 默认实例",
        "config": {
          "base_url": "https://api.openai.com/v1",
          "timeout": 60000
        },
        "secretKeys": {
          "api_key": "openai-default-api_key"
        },
        "selectedModelId": "gpt-4o",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "isDefault": true
      }
    ],
    "count": 5
  }
}
```

#### GET /api/instances/current

Get the currently selected instance.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "openai-default",
    "templateId": "openai",
    "name": "OpenAI 默认实例",
    "config": {...},
    "secretKeys": {...},
    "selectedModelId": "gpt-4o",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/instances/:instanceId

Get details of a specific instance.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "openai-default",
    "templateId": "openai",
    "name": "OpenAI 默认实例",
    "config": {...},
    "secretKeys": {...},
    "selectedModelId": "gpt-4o",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/instances

Create a new instance from a template.

**Request Body:**
```json
{
  "templateId": "openai",
  "name": "My OpenAI Instance",
  "config": {
    "base_url": "https://api.openai.com/v1",
    "timeout": 60000
  },
  "secrets": {
    "api_key": "sk-..."
  },
  "selectedModelId": "gpt-4o"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc-123",
    "templateId": "openai",
    "name": "My OpenAI Instance",
    "config": {...},
    "secretKeys": {...},
    "selectedModelId": "gpt-4o",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Instance created successfully"
}
```

#### PUT /api/instances/:instanceId

Update an existing instance.

**Request Body:**
```json
{
  "name": "Updated Instance Name",
  "config": {
    "timeout": 90000
  },
  "secrets": {
    "api_key": "sk-new-key"
  },
  "selectedModelId": "gpt-4o"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc-123",
    "templateId": "openai",
    "name": "Updated Instance Name",
    "config": {...},
    "secretKeys": {...},
    "selectedModelId": "gpt-4o",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  },
  "message": "Instance updated successfully"
}
```

#### PUT /api/instances/:instanceId/select

Set an instance as the current active instance.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc-123",
    "templateId": "openai",
    "name": "My OpenAI Instance",
    "config": {...},
    "secretKeys": {...},
    "selectedModelId": "gpt-4o"
  },
  "message": "Instance selected successfully"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Error description",
  "stack": "..." // Only in development mode
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## Example Usage

### Using curl

```bash
# List models
curl http://localhost:3000/api/models

# List templates
curl http://localhost:3000/api/templates

# Get specific template
curl http://localhost:3000/api/templates/openai

# List instances
curl http://localhost:3000/api/instances

# Get current instance
curl http://localhost:3000/api/instances/current

# Create new instance
curl -X POST http://localhost:3000/api/instances \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "openai",
    "name": "My OpenAI Instance",
    "secrets": {
      "api_key": "sk-..."
    },
    "selectedModelId": "gpt-4o"
  }'

# Update instance
curl -X PUT http://localhost:3000/api/instances/openai-default \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Instance",
    "config": {
      "timeout": 90000
    }
  }'

# Select instance as current
curl -X PUT http://localhost:3000/api/instances/openai-default/select

# Set API key
curl -X POST http://localhost:3000/api/secrets \
  -H "Content-Type: application/json" \
  -d '{"key": "openai-default-api_key", "value": "sk-..."}'

# Send chat request
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'

# Stream chat response
curl -N -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Write a poem"}
    ]
  }'
```

### Using JavaScript/TypeScript

```typescript
// Non-streaming chat
const response = await fetch('http://localhost:3000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
const data = await response.json();
console.log(data.data.content);

// Streaming chat
const response = await fetch('http://localhost:3000/api/chat/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Write a poem' }]
  })
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader!.read();
  if (done) break;
  
  const text = decoder.decode(value);
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;
      
      try {
        const json = JSON.parse(data);
        process.stdout.write(json.content);
      } catch (e) {}
    }
  }
}
```

## License

MIT

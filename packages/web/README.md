# @unillm-ts/web

Web frontend for unillm-ts - A unified LLM management interface.

## Features

- ✅ Instance Management - View, create, edit, and delete configuration instances
- ✅ Chat Interface - Interactive chat with model selection
- ✅ Real-time Streaming - Support for streaming responses
- ✅ Multi-instance Support - Easy switching between different configurations
- ✅ Modern UI - Built with Ant Design for a professional look

## Tech Stack

- React 18
- TypeScript
- Vite
- Ant Design 5
- React Router 6
- Axios

## Development

```bash
# Install dependencies (from root)
pnpm install

# Start the development server
pnpm dev:web

# Or run from this directory
cd packages/web
pnpm dev
```

The web interface will be available at `http://localhost:5173`

Make sure the API server is running at `http://localhost:3000`:

```bash
# In another terminal
pnpm dev:server
```

## Build

```bash
# Build for production
pnpm build:web

# Preview the production build
pnpm preview
```

## Features

### Instance Management

- View all configuration instances in a table
- Create new instances from templates
- Edit existing instances
- Delete non-default instances
- Switch between instances
- See which instance is currently active

### Chat Interface

- Select active instance for chat
- Real-time streaming responses
- Message history
- Clear conversation
- Markdown support in messages

## License

MIT

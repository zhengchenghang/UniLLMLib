# Migration Guide: From Single Package to Monorepo

This guide helps you migrate from the old single-package structure to the new monorepo structure.

## What Changed?

UniLLM-TS has been restructured from a single package into a monorepo with multiple packages:

- **Old**: Single package `unillm-ts`
- **New**: Monorepo with `@unillm-ts/core`, `@unillm-ts/server`, `@unillm-ts/web`

## For Library Users

### If You Use UniLLM-TS as a Library

**Good News**: Your existing code continues to work with minimal changes!

### Old Way (Still Works)

```bash
npm install unillm-ts
```

```typescript
import { LLMManager } from 'unillm-ts';
```

### New Recommended Way

```bash
npm install @unillm-ts/core
```

```typescript
import { LLMManager } from '@unillm-ts/core';
```

### Migration Steps

1. Update your `package.json`:
   ```diff
   {
     "dependencies": {
   -   "unillm-ts": "^1.0.0"
   +   "@unillm-ts/core": "^1.0.0"
     }
   }
   ```

2. Update your imports (optional, but recommended):
   ```diff
   - import { LLMManager } from 'unillm-ts';
   + import { LLMManager } from '@unillm-ts/core';
   ```

3. That's it! The API remains the same.

## For Contributors

### Old Development Setup

```bash
git clone <repo>
npm install
npm run build
```

### New Development Setup

```bash
git clone <repo>
pnpm install  # Note: now using pnpm
pnpm build
```

### Changed Commands

| Old Command | New Command | Notes |
|------------|-------------|-------|
| `npm install` | `pnpm install` | Now using pnpm workspaces |
| `npm run build` | `pnpm build` | Builds all packages |
| - | `pnpm build:core` | Build core only |
| - | `pnpm build:server` | Build server only |
| - | `pnpm clean` | Clean all build artifacts |
| - | `pnpm dev:server` | Run API server |

### Project Structure

**Old**:
```
unillm-ts/
├── src/
├── build/
├── examples/
├── package.json
└── tsconfig.json
```

**New**:
```
unillm-ts/
├── packages/
│   ├── core/           # Original code moved here
│   ├── server/         # New REST API server
│   └── web/           # Future web frontend
├── pnpm-workspace.yaml
├── package.json        # Root config
└── tsconfig.json       # Shared config
```

### File Locations

| Old Location | New Location |
|--------------|--------------|
| `src/` | `packages/core/src/` |
| `build/` | `packages/core/build/` |
| `examples/` | `packages/core/examples/` |
| `dist/` | `packages/core/dist/` |
| - | `packages/server/` (NEW) |
| - | `packages/web/` (NEW, placeholder) |

## New Features

### REST API Server

The monorepo includes a new Express-based REST API server:

```bash
# Start the server
pnpm build
pnpm dev:server
```

**API Endpoints**:
- `POST /api/chat` - Send chat requests
- `POST /api/chat/stream` - Streaming chat (SSE)
- `GET /api/models` - List available models
- `POST /api/secrets` - Manage API keys

See [packages/server/README.md](./packages/server/README.md) for full API documentation.

### Independent Packages

Each package can now be:
- Developed independently
- Published independently to npm
- Versioned independently
- Used in isolation

## Breaking Changes

### For End Users

**None!** The core library API remains unchanged.

### For Contributors

1. **Package Manager**: Must use `pnpm` instead of `npm`
   - Install: `npm install -g pnpm`

2. **Build Process**: Must build in correct order
   - Core must be built before server
   - Use `pnpm build` to build everything

3. **Import Paths**: In development, may need to update TypeScript paths
   - Old: imports from root `src/`
   - New: imports from `packages/*/src/`

## FAQ

### Q: Do I need to change my existing code?

**A**: No, if you're using the library as-is. The API is identical.

### Q: Can I still use `npm`?

**A**: For using the library, yes. For development, pnpm is required for the monorepo.

### Q: Why the change to monorepo?

**A**: To support multiple related packages:
- Core library (pure functionality)
- REST API server (for web integration)
- Web frontend (coming soon)
- Future packages (CLI, mobile, etc.)

### Q: Will the old `unillm-ts` package be deprecated?

**A**: It may be kept as an alias to `@unillm-ts/core` for backward compatibility.

### Q: Where do I report issues?

**A**: Same repository! Issues related to:
- Core library → Label with `package:core`
- API server → Label with `package:server`
- General → No label needed

### Q: How do I install pnpm?

**A**: `npm install -g pnpm`

### Q: Can I use only the server without the core?

**A**: No, the server depends on the core. But you can use the core without the server.

## Getting Help

- **Documentation**: See [MONOREPO.md](./MONOREPO.md) for architecture details
- **Core Library**: See [packages/core/README.md](./packages/core/README.md)
- **API Server**: See [packages/server/README.md](./packages/server/README.md)
- **Issues**: Open an issue on GitHub
- **Discussions**: Use GitHub Discussions

## Timeline

- **v1.0.0**: Single package structure
- **v1.1.0+**: Monorepo structure with backward compatibility
- **v2.0.0** (future): May deprecate old package names

## Summary

**For Library Users**: Minimal impact, optional migration to `@unillm-ts/core`

**For Contributors**: Must use pnpm, new project structure, more packages

**For Everyone**: More features, better organization, easier maintenance!

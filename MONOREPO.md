# UniLLM-TS Monorepo Architecture

This document describes the monorepo structure and architecture of the UniLLM-TS project.

## Overview

UniLLM-TS is organized as a monorepo using pnpm workspaces. This architecture allows us to:

1. **Share code efficiently** - Core library is used by server without duplication
2. **Unified versioning** - All packages can be versioned together
3. **Simplified development** - Single repository for all related packages
4. **Independent publishing** - Each package can be published separately to npm
5. **Future extensibility** - Easy to add new packages (e.g., CLI, web frontend)

## Package Structure

```
unillm-ts/
├── packages/
│   ├── core/           # Core library package
│   ├── server/         # API server package
│   └── web/           # Web frontend (planned)
├── pnpm-workspace.yaml
├── package.json
└── tsconfig.json
```

## Packages

### @unillm-ts/core

**Purpose**: Core library providing unified interface to multiple LLM providers

**Key Features**:
- Unified chat API for all providers
- Secure credential storage
- Multi-user context management
- Configuration templates and instances
- Support for OpenAI, Qwen, ZhiPu, Moonshot, Spark

**Usage**:
- Can be used standalone as a library
- Imported by `@unillm-ts/server`
- Can be published to npm independently

**Entry Points**:
- CommonJS: `dist/cjs/index.js`
- ES Modules: `dist/esm/index.js`
- TypeScript: `dist/types/index.d.ts`

**Build Tool**: Rollup (for optimal bundle size)

### @unillm-ts/server

**Purpose**: RESTful API server wrapping the core library

**Key Features**:
- Express-based HTTP server
- RESTful API endpoints for chat, models, secrets
- Server-Sent Events (SSE) for streaming
- CORS support
- Error handling and logging middleware

**Usage**:
- Development: `pnpm dev:server`
- Production: `pnpm build && pnpm start:server`

**Dependencies**:
- `@unillm-ts/core` (workspace dependency)
- `express`, `cors`, `dotenv`

**Entry Point**: `dist/index.js`

**Build Tool**: TypeScript compiler (tsc)

### @unillm-ts/web (Planned)

**Purpose**: Web frontend for visual interaction with LLM services

**Planned Features**:
- Chat interface
- Model selection
- API key management
- Multi-model comparison
- Conversation history

**Technology Stack** (TBD):
- React / Vue / Svelte
- TypeScript
- Vite
- TailwindCSS / Ant Design / Material-UI

## Workspace Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - 'packages/*'
```

This tells pnpm to treat all directories under `packages/` as workspace packages.

### Root package.json

The root package.json contains:

1. **Private flag**: `"private": true` - root is not published
2. **Workspace scripts**: Commands that work across all packages
3. **Shared devDependencies**: TypeScript, @types/node

### Workspace Dependencies

Packages reference each other using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@unillm-ts/core": "workspace:*"
  }
}
```

This ensures packages always use the local workspace version during development.

## Build System

### Build Order

Packages are built in dependency order:

1. **core** - Has no dependencies on other packages
2. **server** - Depends on core, must be built after core
3. **web** - Will depend on server API

### Build Commands

From the root:

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:server

# Clean all build artifacts
pnpm clean
```

### Build Tools

- **Core**: Uses Rollup for optimized bundles
  - Outputs: CJS, ESM, and TypeScript declarations
  - Tree-shaking and minification
  - Multiple entry points support

- **Server**: Uses TypeScript compiler (tsc)
  - Outputs: CommonJS modules for Node.js
  - Source maps for debugging
  - Declaration files for type safety

## Development Workflow

### Initial Setup

```bash
# Install pnpm globally
npm install -g pnpm

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Working on Core Library

```bash
# Make changes to packages/core/src/

# Rebuild core
pnpm build:core

# Run examples
pnpm examples:core
```

### Working on Server

```bash
# Make changes to packages/server/src/

# Rebuild server
pnpm build:server

# Start in development mode (with auto-reload)
pnpm dev:server
```

### Adding New Dependencies

**For core package**:
```bash
cd packages/core
pnpm add <package-name>
```

**For server package**:
```bash
cd packages/server
pnpm add <package-name>
```

**Shared dev dependencies** (at root):
```bash
pnpm add -D -w <package-name>
```

## TypeScript Configuration

### Root tsconfig.json

Shared base configuration for all packages:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    // ... other shared options
    "paths": {
      "@unillm-ts/core": ["./packages/core/src"],
      "@unillm-ts/server": ["./packages/server/src"]
    }
  }
}
```

### Package-Specific tsconfig.json

Each package can extend the root config:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## Publishing Strategy

### Independent Publishing

Each package can be published independently:

```bash
# Publish core
cd packages/core
npm publish

# Publish server
cd packages/server
npm publish
```

### Version Management

Options for versioning:

1. **Independent versioning**: Each package has its own version
2. **Unified versioning**: All packages share the same version
3. **Hybrid**: Core has independent version, others follow

Current approach: **Independent versioning**

### Pre-publish Checklist

Before publishing any package:

1. ✅ Build succeeds without errors
2. ✅ All tests pass (when implemented)
3. ✅ README is up-to-date
4. ✅ CHANGELOG is updated
5. ✅ Version is bumped appropriately
6. ✅ Dependencies are correct

## Future Expansion

### Adding New Packages

To add a new package:

1. Create directory under `packages/`
2. Add `package.json` with appropriate name (`@unillm-ts/<name>`)
3. Configure build system (tsconfig.json, build scripts)
4. Add README and documentation
5. Update root scripts if needed

### Potential Future Packages

- **@unillm-ts/cli** - Command-line interface
- **@unillm-ts/web** - Web frontend
- **@unillm-ts/mobile** - React Native app
- **@unillm-ts/desktop** - Electron app
- **@unillm-ts/adapters** - Additional provider adapters
- **@unillm-ts/utils** - Shared utilities

## Best Practices

### 1. Package Independence

- Each package should be independently usable
- Minimize cross-package dependencies
- Clear dependency hierarchy

### 2. Shared Code

- Extract common utilities to shared package
- Don't duplicate code across packages
- Use workspace dependencies

### 3. Documentation

- Each package has its own README
- API documentation in package directory
- Root README provides overview

### 4. Testing

- Test packages independently
- Integration tests at root level
- Shared test utilities

### 5. CI/CD

- Build all packages in CI
- Run all tests
- Publish only changed packages
- Version management automation

## Troubleshooting

### Build Errors

**Error**: Cannot find module '@unillm-ts/core'
- **Solution**: Build core first: `pnpm build:core`

**Error**: Type errors in server
- **Solution**: Ensure core types are generated: `pnpm build:core`

### Dependency Issues

**Error**: pnpm install fails
- **Solution**: Clear cache: `pnpm store prune && pnpm install`

**Error**: Workspace dependency not found
- **Solution**: Check pnpm-workspace.yaml is correct

### Development Issues

**Error**: Changes not reflected
- **Solution**: Rebuild affected packages: `pnpm build`

**Error**: Server won't start
- **Solution**: Check if core is built and server is built

## Resources

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)

## Contributing

When contributing to this monorepo:

1. Follow the package structure
2. Update documentation when adding features
3. Test changes in all affected packages
4. Update this document if architecture changes

## License

MIT

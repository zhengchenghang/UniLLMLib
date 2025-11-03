# Contributing Guide

Thank you for your interest in UniLLM-TS! We welcome contributions of every kind.

## How to Contribute

### Report Issues

If you discover a bug or have a feature request:

1. Search the existing [issues](https://github.com/your-repo/unillm-ts/issues) to avoid duplicates.
2. Open a new issue with:
   - A clear description of the problem or suggestion
   - Steps to reproduce (if applicable)
   - Expected vs. actual behavior
   - Environment details (Node version, operating system, etc.)

### Submit Code

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/unillm-ts.git
   cd unillm-ts
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Develop**
   ```bash
   npm run dev  # start watch mode
   ```

5. **Test**
   - Ensure there are no linter errors
   - Test your changes manually or with automated tests
   - Add unit tests when appropriate

6. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   # or
   git commit -m "fix: resolve bug description"
   ```

   Commit message prefixes:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation updates
   - `style:` formatting-only changes
   - `refactor:` code refactoring
   - `test:` test-related changes
   - `chore:` tooling or build updates

7. **Push and open a PR**
   ```bash
   git push origin your-branch-name
   ```

   Then open a Pull Request on GitHub.

## Development Guidelines

### Project Structure

See [STRUCTURE.md](./STRUCTURE.md) for an overview of the repository layout.

### Adding a New Provider

1. Create a new file in `src/providers/`
2. Extend the `LLMProvider` abstract class
3. Implement the `chatCompletion` method
4. Register the provider in `manager.ts`
5. Update configuration examples
6. Update the documentation

Example:
```typescript
// src/providers/mynewprovider.ts
import { LLMProvider } from './base';
import { ChatCompletionOptions, ChatCompletionResponse } from '../types';

export class MyNewProvider extends LLMProvider {
  async chatCompletion(
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResponse | AsyncGenerator<string>> {
    const { api_key, model } = this.config;

    // Implement the provider-specific API logic here

    if (options.stream) {
      return this.handleStream(response);
    } else {
      return {
        content: 'response content',
        role: 'assistant',
      };
    }
  }

  private async *handleStream(response: Response): AsyncGenerator<string> {
    // Implement streaming response handling
  }
}
```

### Coding Standards

- Use TypeScript
- Follow the existing code style
- Add comments only when they genuinely aid understanding
- Exported functions/classes should include JSDoc comments
- Keep code clean and readable

### Testing

- Test your changes
- Ensure existing functionality continues to work
- Add new test cases when applicable

### Documentation

If your change affects usage, update:
- README.md
- API.md
- Relevant examples
- CHANGELOG.md

## PR Checklist

Before opening a PR, confirm that:

- [ ] Code follows project conventions
- [ ] No TypeScript compilation errors remain
- [ ] No linter errors remain
- [ ] Tests pass
- [ ] Documentation has been updated
- [ ] CHANGELOG.md is updated
- [ ] Commit messages are clear and descriptive

## Contribution Priorities

We especially appreciate help with the following:

### High Priority
1. **Unit tests**: improve coverage
2. **iFlytek Spark**: complete the WebSocket implementation
3. **Error handling**: improve error messaging and resilience
4. **Documentation**: improve docs and examples

### Medium Priority
1. **New providers**: support additional LLM services
2. **Retry strategy**: add automatic retry support
3. **Timeout control**: expose request timeouts
4. **Logging**: add configurable logging

### Low Priority
1. **Multimodal support**: images, audio, and more
2. **Streaming optimizations**
3. **Performance improvements**

## Code of Conduct

- Be respectful to all contributors
- Provide constructive feedback
- Maintain a friendly and inclusive atmosphere
- Focus discussions on improving the project

## Getting Help

If you have questions:

1. Review the existing documentation
2. Search the issue tracker
3. Open a new issue with your question
4. Join ongoing discussions

## License

All contributions are released under the MIT License.

## Thanks

Thank you to every developer who contributes to the project!

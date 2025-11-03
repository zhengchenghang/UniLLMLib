# Example Code

This directory contains usage examples for UniLLM-TS.

## Running the Examples

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure credentials:
   - **Recommended**: set the following environment variables so the scripts can read them automatically:
     - `OPENAI_API_KEY`
     - `QWEN_API_KEY`
     - `QWEN_ACCESS_KEY_ID`
     - `QWEN_ACCESS_KEY_SECRET`
     - `ZHIPU_API_KEY`
     - `MOONSHOT_API_KEY`
     - `SPARK_APP_ID`
     - `SPARK_API_KEY`
     - `SPARK_API_SECRET`
   - Or run `npm run examples:setup` to inspect missing fields for each instance and get instructions on how to populate them.

On platforms where secure storage is not available yet, the examples fall back to saving credentials in `~/.unillm/examples-secrets.json`. Use this only for local debugging—do not rely on it in production.

## Example List

### 1. `basic.ts` – Core usage

Demonstrates the key features of the library:
- Initialization
- Listing models
- Model selection
- Simple chat
- Streaming chat
- Advanced chat interface

Run it with:
```bash
npm run examples:basic
```

### 2. `multi-model.ts` – Model comparison

Shows how to send the same question to different models to compare their responses.

Run it with:
```bash
npm run examples:multi-model
```

### 3. `conversation.ts` – Multi-turn conversations

Demonstrates how to maintain conversation history for multi-turn chat experiences.

Run it with:
```bash
npm run examples:conversation
```

### 4. `setup-keys.ts` – Credential helper

Helps you inspect the current credential status and outputs environment variable samples or `setSecret` usage.

Run it with:
```bash
npm run examples:setup
```

### 5. `multi-user.ts` – User isolation

Shows how to isolate secrets for different users using the user context helpers—ideal for multi-tenant applications.

Run it with:
```bash
npm run examples:multi-user
```

You can also run all examples (except credential inspection) in one go:

```bash
npm run examples:all
```

## Create Your Own Example

Feel free to build on these scripts:

```typescript
import llmManager from 'unillm-ts';

async function myApp() {
  await llmManager.init();
  
  // Your code here...
}

myApp();
```

## Notes

1. **API key security**: never hard-code API keys in source code.
2. **Error handling**: add robust error handling in production scenarios.
3. **Rate limiting**: respect the rate limits of each provider.
4. **Cost management**: monitor token usage and associated costs.

## More Resources

- [Full documentation](../README.md)
- [API reference](../API.md)
- [Quick start guide](../QUICKSTART.md)

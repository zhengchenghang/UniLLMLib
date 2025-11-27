import { Router, Request, Response, NextFunction } from 'express';
import { LLMManager } from '@unillm-ts/core';

const router: Router = Router();
const manager = new LLMManager();

let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await manager.init();
    initialized = true;
  }
}

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const { model, messages, temperature, max_tokens } = req.body;

    if (!model || !messages) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'model and messages are required'
      });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'messages must be an array'
      });
    }

    const response = await manager.chat(
      {
        messages,
        stream: false,
        temperature,
        max_tokens
      },
      model
    );

    if (typeof response === 'object' && 'content' in response) {
      res.json({
        success: true,
        data: response
      });
    } else {
      throw new Error('Unexpected response type');
    }
  } catch (error: any) {
    next(error);
  }
});

router.post('/stream', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const { model, messages, temperature, max_tokens } = req.body;

    if (!model || !messages) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'model and messages are required'
      });
    }

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'messages must be an array'
      });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const response = await manager.chat(
      {
        messages,
        stream: true,
        temperature,
        max_tokens
      },
      model
    );

    if (typeof response === 'object' && Symbol.asyncIterator in response) {
      for await (const chunk of response as AsyncGenerator<string>) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      throw new Error('Expected stream response');
    }
  } catch (error: any) {
    next(error);
  }
});

export default router;

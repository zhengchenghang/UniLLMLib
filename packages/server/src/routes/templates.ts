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

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const templates = manager.getConfigTemplates();

    res.json({
      success: true,
      data: {
        templates,
        count: templates.length
      }
    });
  } catch (error: any) {
    next(error);
  }
});

router.get('/:templateId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const { templateId } = req.params;
    const templates = manager.getConfigTemplates();
    const template = templates.find(t => t.id === templateId);

    if (!template) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Template '${templateId}' not found`
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;

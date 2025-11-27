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

    const models = manager.listModels();

    res.json({
      success: true,
      data: {
        models,
        count: models.length
      }
    });
  } catch (error: any) {
    next(error);
  }
});

router.get('/:modelName', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const { modelName } = req.params;
    const allModels = manager.getModelsInfo();
    const modelInfo = allModels.find(m => m.id === modelName);

    if (!modelInfo) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Model '${modelName}' not found`
      });
    }

    res.json({
      success: true,
      data: modelInfo
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;

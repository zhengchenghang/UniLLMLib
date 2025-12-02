import { Router, Request, Response, NextFunction } from 'express';
import { getManager, ensureInitialized } from '../lib/manager';

const router: Router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
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

    const manager = getManager();
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

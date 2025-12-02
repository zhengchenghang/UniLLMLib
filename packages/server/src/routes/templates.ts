import { Router, Request, Response, NextFunction } from 'express';
import { getManager, ensureInitialized } from '../lib/manager';

const router: Router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
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

    const manager = getManager();
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

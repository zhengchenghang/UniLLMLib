import { Router, Request, Response, NextFunction } from 'express';
import { getManager, ensureInitialized } from '../lib/manager';

const router: Router = Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
    const instances = manager.listInstances();

    res.json({
      success: true,
      data: {
        instances,
        count: instances.length
      }
    });
  } catch (error: any) {
    next(error);
  }
});

router.get('/current', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
    const currentInstance = manager.getCurrentInstance();

    if (!currentInstance) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No current instance selected'
      });
    }

    res.json({
      success: true,
      data: currentInstance
    });
  } catch (error: any) {
    next(error);
  }
});

router.get('/:instanceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
    const { instanceId } = req.params;
    const instance = manager.getInstance(instanceId);

    if (!instance) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Instance '${instanceId}' not found`
      });
    }

    res.json({
      success: true,
      data: instance
    });
  } catch (error: any) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
    const { templateId, name, config, secrets, selectedModelId } = req.body;

    if (!templateId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'templateId is required'
      });
    }

    const instance = await manager.createInstanceFromTemplate(templateId, {
      name,
      config,
      secrets,
      selectedModelId
    });

    res.status(201).json({
      success: true,
      data: instance,
      message: 'Instance created successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

router.put('/:instanceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
    const { instanceId } = req.params;
    const { name, config, secrets, selectedModelId } = req.body;

    const instance = await manager.updateInstance(instanceId, {
      name,
      config,
      secrets,
      selectedModelId
    });

    res.json({
      success: true,
      data: instance,
      message: 'Instance updated successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

router.put('/:instanceId/select', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
    const { instanceId } = req.params;

    await manager.setCurrentInstance(instanceId);

    const currentInstance = manager.getCurrentInstance();

    res.json({
      success: true,
      data: currentInstance,
      message: 'Instance selected successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

router.delete('/:instanceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureInitialized();

    const manager = getManager();
    const { instanceId } = req.params;

    await manager.deleteInstance(instanceId);

    res.json({
      success: true,
      message: 'Instance deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;

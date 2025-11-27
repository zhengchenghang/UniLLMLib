import { Router, Request, Response, NextFunction } from 'express';
import { setSecret, getSecret, deleteSecret, getAllSecrets, clearAllSecrets } from '@unillm-ts/core';

const router: Router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'key and value are required'
      });
    }

    await setSecret(key, value);

    res.json({
      success: true,
      message: 'Secret set successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;

    const value = await getSecret(key);

    if (!value) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Secret not found'
      });
    }

    res.json({
      success: true,
      data: {
        key,
        value
      }
    });
  } catch (error: any) {
    next(error);
  }
});

router.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key } = req.params;

    const deleted = await deleteSecret(key);

    if (!deleted) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Secret not found'
      });
    }

    res.json({
      success: true,
      message: 'Secret deleted successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secrets = await getAllSecrets();

    res.json({
      success: true,
      data: secrets
    });
  } catch (error: any) {
    next(error);
  }
});

router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clearAllSecrets();

    res.json({
      success: true,
      message: 'All secrets cleared successfully'
    });
  } catch (error: any) {
    next(error);
  }
});

export default router;

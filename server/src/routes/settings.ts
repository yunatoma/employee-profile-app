import { Router, Request, Response, NextFunction } from 'express';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { settingsRepository } from '../repositories/FirestoreSettingsRepository';

const router = Router();

// GET /api/v1/settings — 認証済み全員
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsRepository.get();
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/settings — admin のみ
router.put('/', roleMiddleware('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsRepository.update(req.body);
    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export { router as settingsRouter };

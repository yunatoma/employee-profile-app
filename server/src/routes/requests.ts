import { Router, Request, Response, NextFunction } from 'express';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { requestRepository } from '../repositories/FirestoreRequestRepository';
import { settingsRepository } from '../repositories/FirestoreSettingsRepository';

const router = Router();

// POST /api/v1/requests — 認証済み全員（メンバーも申請可能）
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, value, category, reason, requestedByName } = req.body as {
      type: string;
      value: string;
      category?: string;
      reason?: string;
      requestedByName?: string;
    };

    if (!type || !value?.trim()) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'type と value は必須です' } });
      return;
    }
    if (type !== 'skill' && type !== 'project') {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'type は skill または project である必要があります' } });
      return;
    }

    const request = await requestRepository.create({
      type,
      value: value.trim(),
      category: category?.trim() || undefined,
      reason: reason?.trim() || undefined,
      requestedBy: req.user!.uid,
      requestedByName: requestedByName?.trim() || req.user!.email,
      organizationId: req.user!.organizationId!,
    });
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/requests/my — 自分の申請一覧（認証済み全員）
router.get('/my', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await requestRepository.listByUser(req.user!.organizationId!, req.user!.uid);
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/requests — admin のみ（全申請一覧）
router.get('/', roleMiddleware('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const validStatuses = ['pending', 'approved', 'rejected'];
    const requests = await requestRepository.listByOrg(
      req.user!.organizationId!,
      validStatuses.includes(status ?? '') ? (status as any) : undefined,
    );
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/requests/:id — admin のみ（承認・却下）
router.patch('/:id', roleMiddleware('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body as { status: string };
    if (status !== 'approved' && status !== 'rejected') {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'status は approved または rejected である必要があります' } });
      return;
    }

    const updated = await requestRepository.updateStatus(req.user!.organizationId!, req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: '申請が見つかりません' } });
      return;
    }

    // 承認時はマスタ設定に自動反映
    if (status === 'approved') {
      const settings = await settingsRepository.get();

      if (updated.type === 'project') {
        if (!settings.projects.includes(updated.value)) {
          await settingsRepository.update({ projects: [...settings.projects, updated.value] });
        }
      } else if (updated.type === 'skill') {
        const targetCategory = updated.category || 'その他';
        const catIndex = settings.skillCategories.findIndex((c) => c.category === targetCategory);
        const updatedCategories = [...settings.skillCategories];

        if (catIndex >= 0) {
          if (!updatedCategories[catIndex].skills.includes(updated.value)) {
            updatedCategories[catIndex] = {
              ...updatedCategories[catIndex],
              skills: [...updatedCategories[catIndex].skills, updated.value],
            };
          }
        } else {
          updatedCategories.push({ category: targetCategory, skills: [updated.value] });
        }

        await settingsRepository.update({ skillCategories: updatedCategories });
      }
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export { router as requestsRouter };

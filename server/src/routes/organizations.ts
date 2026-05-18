import { Router } from 'express';
import { OrganizationService } from '../services/OrganizationService';
import { orgMiddleware } from '../middleware/orgMiddleware';

export const organizationsRouter = Router();
const service = new OrganizationService();

// POST /api/v1/organizations — 組織新規作成（orgMiddleware 不要: 組織未所属のユーザーが呼ぶ）
organizationsRouter.post('/', async (req, res, next) => {
  try {
    const { name, logoUrl, creatorName } = req.body as { name: string; logoUrl?: string; creatorName?: string };
    // SP-10: 既に組織所属のユーザーの重複作成を防止
    if (req.user!.organizationId) {
      res.status(409).json({ error: { code: 'CONFLICT', message: '既に組織に所属しています' } });
      return;
    }
    if (!name?.trim()) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: '組織名は必須です' } });
      return;
    }
    const result = await service.create(
      name,
      req.user!.uid,
      req.user!.email,
      creatorName ?? req.user!.email,
      logoUrl,
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/organizations/:orgId — 組織取得（組織所属必須）
organizationsRouter.get('/:orgId', orgMiddleware, async (req, res, next) => {
  try {
    const org = await service.getById(String(req.params.orgId), req.user!.organizationId!);
    res.json(org);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/organizations/:orgId — 組織更新（admin のみ・組織所属必須）
organizationsRouter.put('/:orgId', orgMiddleware, async (req, res, next) => {
  try {
    const { name, logoUrl } = req.body as { name?: string; logoUrl?: string };
    const org = await service.update(
      String(req.params.orgId),
      { name, logoUrl },
      req.user!.organizationId!,
      req.user!.role ?? '',
    );
    res.json(org);
  } catch (err) {
    next(err);
  }
});

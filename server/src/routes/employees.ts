import { Router, Request, Response, NextFunction } from 'express';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { EmployeeService } from '../services/EmployeeService';

const router = Router();
const service = new EmployeeService();

// GET /api/v1/employees — 一覧取得（認証済み全員）
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await service.getAll(req.user!.organizationId!);
    res.json(employees);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/employees/search?q=keyword — アプリ内検索（認証済み全員）
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keyword = typeof req.query.q === 'string' ? req.query.q : '';
    const result = await service.search(req.user!.organizationId!, keyword);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/employees/:id — 詳細取得（認証済み全員）
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const employee = await service.getById(req.params.id, req.user!.organizationId!);
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/employees — 新規登録（admin のみ）
router.post('/', roleMiddleware('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await service.create(req.body, req.user!);
    res.status(201).json(employee);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/employees/:id — 更新（admin or 本人）
router.put('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    // ロール取得のため Firestore を確認（roleMiddleware 相当の処理を EmployeeService 内で実施）
    const employee = await service.update(req.params.id, req.body, req.user!);
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/employees/:id/retire — 退職処理（admin のみ）
router.patch('/:id/retire', roleMiddleware('admin'), async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const employee = await service.retire(req.params.id, req.user!.organizationId!);
    res.json(employee);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/employees/:id — 完全削除（admin のみ）
router.delete('/:id', roleMiddleware('admin'), async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    await service.delete(req.params.id, req.user!.organizationId!, req.user!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as employeesRouter };

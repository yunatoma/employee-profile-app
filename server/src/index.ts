import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV ?? 'development'}` });
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/authMiddleware';
import { orgMiddleware } from './middleware/orgMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { employeesRouter } from './routes/employees';
import { settingsRouter } from './routes/settings';
import { organizationsRouter } from './routes/organizations';
import { EmployeeService } from './services/EmployeeService';

const app = express();
const PORT = process.env.PORT ?? 3001;
const employeeService = new EmployeeService();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json());

// 全 /api/v1 ルートに認証を適用
app.use('/api/v1', authMiddleware);

// orgMiddleware 不要なルート（組織未所属ユーザーが呼ぶ）
app.use('/api/v1/organizations', organizationsRouter);

// POST /api/v1/employees/link-uid — uid 紐付け（組織参加前に呼ぶため orgMiddleware の前に登録）
app.post('/api/v1/employees/link-uid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, uid } = req.body as { email: string; uid: string };
    if (!email || !uid) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'email と uid は必須です' } });
      return;
    }
    // SP-09: リクエストの uid がトークンの uid と一致することを検証
    if (uid !== req.user!.uid) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: '不正なリクエストです' } });
      return;
    }
    const result = await employeeService.linkUid(email, uid);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 組織所属が必要なルートに orgMiddleware を適用
app.use('/api/v1', orgMiddleware);
app.use('/api/v1/employees', employeesRouter);
app.use('/api/v1/settings', settingsRouter);

// グローバルエラーハンドラ（最後に配置）
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

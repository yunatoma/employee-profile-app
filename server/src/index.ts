import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/authMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';
import { employeesRouter } from './routes/employees';
import { settingsRouter } from './routes/settings';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.ALLOWED_ORIGIN }));
app.use(express.json());

// 全 /api/v1 ルートに認証を適用
app.use('/api/v1', authMiddleware);
app.use('/api/v1/employees', employeesRouter);
app.use('/api/v1/settings', settingsRouter);

// グローバルエラーハンドラ（最後に配置）
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

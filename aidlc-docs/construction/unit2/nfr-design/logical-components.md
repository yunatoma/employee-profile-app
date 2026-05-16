# Logical Components — Unit 2: Firebase Integration

## バックエンド（server/）

### LC-01: authMiddleware

**責務**: Firebase ID トークンを検証し、`req.user` にユーザー情報をセットする

**インターフェース**:
```typescript
// req.user の型定義
interface AuthUser {
  uid: string;
  email: string;
}

// Express Request 拡張
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser & { role?: string };
    }
  }
}
```

**処理フロー**:
```
1. Authorization ヘッダーを取得
2. "Bearer <token>" の形式を検証
3. admin.auth().verifyIdToken(token) で検証
4. req.user = { uid, email } をセット
5. next()
エラー時: 401 UNAUTHORIZED を返す
```

---

### LC-02: roleMiddleware（ファクトリ関数）

**責務**: 指定ロール以上の権限を持つユーザーのみ通過させる

**インターフェース**:
```typescript
// 使用例
router.post('/', authMiddleware, roleMiddleware('admin'), createEmployee);

function roleMiddleware(requiredRole: 'admin' | 'user'): RequestHandler
```

**処理フロー**:
```
1. req.user.uid を使って Firestore users/{uid} を取得
2. ドキュメントが存在しない → 403 FORBIDDEN
3. user.role が requiredRole と一致しない → 403 FORBIDDEN
4. req.user.role = user.role をセット → next()
```

---

### LC-03: errorMiddleware

**責務**: ルートハンドラから `next(err)` で転送されたエラーを統一形式に変換して返す

**処理フロー**:
```
(err, req, res, next) => {
  statusCode = err.statusCode || 500
  code = err.code || 'INTERNAL_ERROR'
  message = err.message || 'Internal server error'
  res.status(statusCode).json({ error: { code, message } })
}
```

---

### LC-04: EmployeeService

**責務**: CRUD ビジネスロジックの実装。`createdAt` / `updatedAt` の付与。自己編集権限チェック。

**主要メソッド**:
```typescript
class EmployeeService {
  getAll(): Promise<Employee[]>
  getById(id: string): Promise<Employee>
  create(data: EmployeeInput): Promise<Employee>
  update(id: string, data: Partial<EmployeeInput>, requestingUser: AuthUser & { role: string }): Promise<Employee>
  retire(id: string): Promise<Employee>
  delete(id: string): Promise<void>
}
```

**自己編集チェック（update）**:
```
role === 'admin' → 全社員を編集可
role === 'user'  → employee.email === requestingUser.email の場合のみ編集可
               → 不一致なら 403 FORBIDDEN
```

---

### LC-05: FirestoreEmployeeRepository

**責務**: Firestore `employees` コレクションへの CRUD 操作。EmployeeService から呼ばれる。

**主要メソッド**:
```typescript
class FirestoreEmployeeRepository {
  findAll(): Promise<Employee[]>
  findById(id: string): Promise<Employee | null>
  create(employee: Employee): Promise<Employee>
  update(id: string, data: Partial<Employee>): Promise<Employee>
  delete(id: string): Promise<void>
}
```

---

### LC-06: setup-admin スクリプト

**責務**: Firestore の `users/{uid}` ドキュメントの `role` を `'admin'` に更新する CLI スクリプト

**実行方法**:
```bash
npm run setup-admin -- --email user@example.com
# または
npm run setup-admin -- --uid <firebase-uid>
```

---

## フロントエンド（src/）

### LC-07: authService（Firebase SDK ラッパー）

**責務**: Google ログイン / サインアウト / 現在ユーザー取得 / ID トークン取得

```typescript
// src/features/auth/api/authService.ts
export const signInWithGoogle = (): Promise<UserCredential>
export const signOut = (): Promise<void>
export const getIdToken = (): Promise<string>   // currentUser.getIdToken()
export const onAuthStateChanged = (callback: (user: User | null) => void): Unsubscribe
```

---

### LC-08: authSlice

**責務**: 認証状態（user 情報・role・loading）の Redux 管理

**State**:
```typescript
interface AuthState {
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: 'admin' | 'user' | null;
  } | null;
  loading: boolean;
  error: string | null;
}
```

**AsyncThunks**:
- `loginWithGoogle`: Google ログイン → Firestore `users/{uid}` を確認（存在しなければ初回登録） → role を取得
- `logout`: Firebase サインアウト → state リセット

---

### LC-09: ProtectedRoute

**責務**: 未認証ユーザーを `/login` へリダイレクト。認証中は LoadingSpinner を表示。

```typescript
// src/features/auth/components/ProtectedRoute.tsx
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // authSlice.loading === true → <LoadingSpinner />
  // authSlice.user === null   → <Navigate to="/login" replace />
  // authSlice.user あり       → children
}
```

---

### LC-10: apiClient（fetchラッパー）

**責務**: 全 API リクエストに Bearer トークンを付与。401 時に強制サインアウト + `/login` リダイレクト。

```typescript
// src/features/auth/api/apiClient.ts
async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const token = await getIdToken();   // SDK 自動リフレッシュ（Q1: A）
  const res = await fetch(`/api/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
  if (res.status === 401) {
    await signOut();
    window.location.href = '/login';  // 強制リダイレクト（Q3: A）
  }
  return res;
}
```

---

### LC-11: employeeRepository（API クライアント実装）

**責務**: Unit 1 の `LocalEmployeeRepository` を `ApiEmployeeRepository` に差し替え。`apiFetch` を使って Node.js API を呼ぶ。

```typescript
// src/features/employees/api/employeeRepository.ts
export class ApiEmployeeRepository implements IEmployeeRepository {
  getAll(): Promise<Employee[]>
  getById(id: string): Promise<Employee>
  create(data: EmployeeFormValues): Promise<Employee>
  update(id: string, data: EmployeeFormValues): Promise<Employee>
  retire(id: string): Promise<Employee>
  delete(id: string): Promise<void>
}
```

---

## ミドルウェア適用順序（Express）

```
app.use(cors({ origin: process.env.ALLOWED_ORIGIN }))   // LC: CP-01
app.use(express.json())
app.use('/api/v1', authMiddleware)                       // LC-01: 全ルートに適用
router.post('/', roleMiddleware('admin'), handler)        // LC-02: 必要なルートのみ
app.use(errorMiddleware)                                 // LC-03: 最後に配置
```

---

## コンポーネント間の依存関係

```
[フロントエンド]
  LoginPage
    └── authService (LC-07) ← signInWithGoogle
  ProtectedRoute (LC-09)
    └── authSlice (LC-08)
  employeeSlice (既存)
    └── ApiEmployeeRepository (LC-11)
        └── apiClient (LC-10)
            └── authService.getIdToken (LC-07)

[バックエンド]
  Express Router (employees)
    ├── authMiddleware (LC-01)
    ├── roleMiddleware (LC-02) ← 必要なルートのみ
    └── EmployeeService (LC-04)
        └── FirestoreEmployeeRepository (LC-05)
  errorMiddleware (LC-03)
```

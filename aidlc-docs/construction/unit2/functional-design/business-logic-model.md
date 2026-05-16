# Business Logic Model — Unit 2: Firebase Integration

## BLM-U2-01: Google ログインフロー

```
トリガー: LoginPage の「Google でログイン」ボタンクリック

処理:
1. Firebase Auth の signInWithPopup(GoogleAuthProvider) を実行
2. 成功時:
   a. uid を使って Firestore の users/{uid} を取得
   b. ドキュメントが存在しない場合:
      - { uid, email, displayName, role: 'user', createdAt } で新規作成
   c. ドキュメントが存在する場合:
      - 取得した role を使用
3. authSlice に { uid, email, displayName, role } を保存
4. ログイン前にアクセスしようとしていた URL へリダイレクト
   （存在しない場合は '/' へ）

失敗時:
- ポップアップキャンセル: エラー表示なし（ユーザーの意図的な操作）
- その他エラー: ErrorMessage を表示（"ログインに失敗しました"）
```

## BLM-U2-02: 認証状態の維持

```
アプリ起動時（App.tsx）:
1. Firebase Auth の onAuthStateChanged を監視
2. 認証済みユーザーがいる場合:
   a. Firestore から users/{uid} を取得
   b. authSlice に保存
3. 認証済みユーザーがいない場合:
   a. authSlice を null にリセット

目的: ページリロード後も認証状態を維持する
```

## BLM-U2-03: ログアウトフロー

```
トリガー: Layout のログアウトボタンクリック

処理:
1. Firebase Auth の signOut() を実行
2. authSlice を null にリセット
3. '/login' へリダイレクト
```

## BLM-U2-04: 権限チェックロジック（フロントエンド）

```typescript
// src/features/employees/utils/permissions.ts

type Permission = {
  canCreate: boolean;
  canEdit: (employee: Employee) => boolean;
  canRetire: boolean;
  canDelete: boolean;
};

function getPermissions(role: UserRole, currentUserEmail: string): Permission {
  if (role === 'admin') {
    return {
      canCreate: true,
      canEdit: () => true,
      canRetire: true,
      canDelete: true,
    };
  }
  // user ロール
  return {
    canCreate: false,
    canEdit: (employee) => employee.email === currentUserEmail,
    canRetire: false,
    canDelete: false,
  };
}
```

## BLM-U2-05: Node.js API 認証ミドルウェア

```
リクエスト受信:
1. Authorization ヘッダーから Bearer トークンを取得
2. Firebase Admin SDK で verifyIdToken(token) を実行
3. 成功: DecodedIdToken を req.user に付与して next()
4. 失敗: 401 Unauthorized を返す

使用方法: 全 /api/v1/* ルートに適用
```

## BLM-U2-06: Node.js API ロールミドルウェア

```
requireRole('admin') ミドルウェア:
1. req.user.uid で Firestore の users/{uid} を取得
2. role === 'admin' なら next()
3. role !== 'admin' なら 403 Forbidden を返す

適用箇所:
- POST   /api/v1/employees     → requireRole('admin')
- DELETE /api/v1/employees/:id → requireRole('admin')
```

## BLM-U2-07: 一般社員の自己編集チェック

```
PUT /api/v1/employees/:id:
1. authMiddleware で認証確認
2. Firestore から対象 Employee を取得
3. role が 'admin' の場合: 編集許可
4. role が 'user' の場合:
   - users/{uid}.email === employee.email なら許可
   - 一致しない場合: 403 Forbidden

※ status フィールドの変更は admin のみ許可
   一般社員が status を変更しようとした場合は元の値を維持
```

## BLM-U2-08: セットアップスクリプト（初回管理者設定）

```
実行: npm run setup-admin -- --email=admin@example.com

処理:
1. Firebase Admin SDK を初期化
2. 指定メールアドレスで Firebase Auth から uid を取得
3. Firestore の users/{uid} ドキュメントを取得または作成
4. role を 'admin' に更新
5. 成功メッセージを表示して終了
```

## BLM-U2-09: employeeRepository の差し替え

```
Unit 1: インメモリ（モックデータ）
Unit 2: Node.js API クライアント

IEmployeeRepository インターフェース（変更なし）:
- findAll()
- findById(id)
- create(employee)
- update(employee)
- delete(id)

ApiEmployeeRepository の実装:
- fetch('/api/v1/employees', { headers: { Authorization: `Bearer ${idToken}` } })
- Firebase Auth の currentUser.getIdToken() でトークンを取得
```

## BLM-U2-10: Vite プロキシ設定

```typescript
// vite.config.ts に追加
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

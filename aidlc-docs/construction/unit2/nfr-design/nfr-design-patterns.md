# NFR Design Patterns — Unit 2: Firebase Integration

## セキュリティパターン

### SP-01: Bearer Token 認証パターン

すべての API リクエストで Firebase ID トークンを Bearer ヘッダーで送信する。

**フロントエンド（API 呼び出し共通処理）**:
```
API 呼び出し前:
  1. firebase.auth().currentUser.getIdToken() を呼ぶ
     ├─ トークンが有効な場合: そのまま返す（Firebase SDK がキャッシュ）
     └─ 有効期限が近い/切れている場合: SDK が自動でリフレッシュして返す
  2. Authorization: Bearer <token> ヘッダーをセットしてリクエスト送信
```

**バックエンド（authMiddleware）**:
```
リクエスト受信:
  1. Authorization ヘッダーから Bearer トークンを抽出
     └─ ヘッダーなし → 401 { error: { code: 'UNAUTHORIZED', message: '...' } }
  2. admin.auth().verifyIdToken(token) で検証
     └─ 無効/期限切れ → 401 { error: { code: 'UNAUTHORIZED', message: '...' } }
  3. 検証成功 → req.user = { uid, email } をセットして next()
```

---

### SP-02: ロールベースアクセス制御（RBAC）パターン

**バックエンド（roleMiddleware）**:
```
req.user.uid を使って Firestore users/{uid} を読み取り:
  └─ ドキュメントなし → 403 { error: { code: 'FORBIDDEN', message: '...' } }
  └─ role が要求ロールと不一致 → 403 { error: { code: 'FORBIDDEN', message: '...' } }
  └─ ロール確認OK → req.user.role をセットして next()
```

**適用エンドポイント**:
| エンドポイント | 必要ロール |
|---------------|----------|
| POST /api/v1/employees | admin |
| PUT /api/v1/employees/:id | admin（自分のレコードは user も可・EmployeeService で判定） |
| PATCH /api/v1/employees/:id/retire | admin |
| DELETE /api/v1/employees/:id | admin |
| GET /api/v1/employees | 認証済み全員（roleMiddleware 不要） |
| GET /api/v1/employees/:id | 認証済み全員（roleMiddleware 不要） |

---

### SP-03: 認証エラー時の強制サインアウトパターン

**フロントエンド**:
```
API レスポンスが 401 の場合:
  1. firebase.auth().signOut() を呼ぶ
  2. Redux の authSlice をリセット（user: null）
  3. /login へリダイレクト
```

→ axiosインターセプター または fetchWrapper の共通エラーハンドラで実装する。

---

### SP-04: Firestore セキュリティルールパターン

```
employees コレクション:
  読み取り: 認証済みユーザーのみ（request.auth != null）
  書き込み: 拒否（Node.js API の Admin SDK 経由のみ）

users コレクション:
  読み取り: 自分のドキュメントのみ（request.auth.uid == userId）
  書き込み: 自分のドキュメントのみ（初回登録）
```

---

## エラーハンドリングパターン

### EH-01: 統一エラーレスポンス形式

すべての API エラーを以下の形式で返す:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "人間が読めるメッセージ"
  }
}
```

**エラーコード一覧**:
| HTTP Status | code | 用途 |
|-------------|------|------|
| 400 | VALIDATION_ERROR | バリデーション失敗 |
| 401 | UNAUTHORIZED | 未認証・トークン無効 |
| 403 | FORBIDDEN | 権限不足 |
| 404 | NOT_FOUND | リソースなし |
| 500 | INTERNAL_ERROR | 予期しないサーバーエラー |

---

### EH-02: Express グローバルエラーミドルウェアパターン

```
全ルートハンドラの後に errorMiddleware を配置:
  try/catch で捕捉した Error を next(err) で転送
  errorMiddleware が err.statusCode / err.code を解釈して統一形式で返す
  予期しない Error は 500 INTERNAL_ERROR として返す
```

---

## パフォーマンスパターン

### PP-01: Firestore 読み取り最小化

- 一覧取得: `employees` コレクション全件取得（個人開発スケールでは許容）
- ロール確認: リクエストごとに `users/{uid}` を 1 ドキュメント読み取り（1 read/req）
- フロントエンド側の Firestore 直接アクセス: なし（Node.js API 経由のみ）

---

## CORS パターン

### CP-01: 環境変数ベースの CORS 設定

```
ALLOWED_ORIGIN 環境変数で許可オリジンを制御:
  開発: http://localhost:5173
  本番: Firebase Hosting の URL（デプロイ時に設定）

cors({ origin: process.env.ALLOWED_ORIGIN }) として適用
```

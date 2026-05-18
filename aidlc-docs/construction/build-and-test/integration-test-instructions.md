# Integration Test Instructions — Unit 1 & Unit 2

## Unit 1 のスコープ

Unit 1 はフロントエンドのみ（モックデータ）のため、**外部サービスとの統合テストは N/A** です。

Unit 間の統合テストは以下のタイミングで追加します：

| テストシナリオ | 追加タイミング |
|------------|------------|
| フロントエンド ↔ Firebase Firestore | Unit 2 完了後 |
| フロントエンド ↔ Node.js API | Unit 2 完了後 |
| Node.js API ↔ OpenSearch | Unit 3 完了後 |

## Unit 1 で実施する手動動作確認

`npm run dev` 起動後、以下のシナリオを手動確認してください。

### シナリオ 1: ダッシュボード表示

1. `http://localhost:5173/` を開く
2. 統計カード（在籍社員数・稼働中・休業中）が表示される
3. 部署別テーブルが表示される
4. 注記「在籍中の社員のみ集計」が表示される

### シナリオ 2: 社員一覧 + フィルタ

1. `/employees` を開く
2. 社員一覧が表示される（デフォルト: 退職者除外）
3. ステータスドロップダウンで「退職者を含む」を選択 → 退職者が表示される
4. 「全て」に戻す → 退職者が非表示になる

### シナリオ 3: 社員登録

1. 「社員を登録する」ボタンをクリック
2. `/employees/new` が開く
3. 必須フィールドを空にして送信 → バリデーションエラーが表示される
4. 正しい情報を入力して送信 → 詳細ページへリダイレクト

### シナリオ 4: 社員編集

1. 社員詳細ページ → 「編集」ボタン
2. フォームに初期値が入っている
3. 変更して保存 → 詳細ページで変更が反映されている

### シナリオ 5: 退職処理・完全削除

1. 社員詳細 → 「退職処理」ボタン → 確認ダイアログ → 実行
2. ステータスバッジが「退職」になる
3. 「完全削除」ボタン → 危険スタイルのダイアログ → 実行 → 一覧ページへ遷移

---

## Unit 2: Firebase Integration — 統合テスト（手動）

### 前提条件

```bash
# フロントエンド + バックエンド同時起動
npm run dev
```

- フロントエンド: `http://localhost:5173`
- バックエンド: `http://localhost:3001`
- Firebase プロジェクト（Auth + Firestore）が稼働中であること

---

### シナリオ 1: Google ログイン

1. `http://localhost:5173` を開く → `/login` にリダイレクトされる
2. 「Google でログイン」ボタンをクリック
3. Google アカウントを選択してログイン
4. ダッシュボード（`/`）にリダイレクトされる
5. Firestore の `users/{uid}` ドキュメントが作成されている（role: 'user'）

**確認項目**: Layout 右下にユーザー名が表示される

---

### シナリオ 2: 認証状態の永続化

1. ログイン後にページをリロード
2. ログイン状態が維持され、ダッシュボードが表示される（`/login` にリダイレクトされない）

---

### シナリオ 3: 管理者セットアップ

```bash
cd server
npm run setup-admin -- --email your@email.com
```

1. Firestore の `users/{uid}` の `role` が `'admin'` に更新されている
2. ログインし直すと admin 権限が反映される
3. 「社員を登録する」リンクが表示される（admin のみ）

---

### シナリオ 4: 社員登録（admin）

1. admin でログイン
2. 「社員を登録する」→ フォームに入力（部署ドロップダウン・スキルチェックボックス）
3. 登録 → 詳細ページへリダイレクト
4. Firestore の `employees` コレクションにドキュメントが作成されている

---

### シナリオ 5: 権限制御

1. 一般ユーザー（role: 'user'）でログイン
2. `/employees/new` に直接アクセス → ダッシュボード（`/`）にリダイレクトされる
3. 他人の社員詳細ページ → 「編集」ボタンが表示されない
4. 自分のプロフィール（email 一致）→ 「編集」ボタンが表示される

---

### シナリオ 6: ログアウト

1. Layout 右下の「ログアウト」ボタンをクリック
2. Firebase からサインアウト
3. `/login` へリダイレクトされる
4. ダッシュボードに直接アクセスすると `/login` にリダイレクトされる

---

### シナリオ 7: API 認証エラー（手動確認）

1. ブラウザの開発者ツール → Application → Cookies → Firebase のセッションを削除
2. API リクエストを発生させる（例: 社員一覧を開く）
3. 401 エラーを受け取り、自動的に `/login` へリダイレクトされる

---

### API エンドポイント確認（curl）

```bash
# ログイン後、ブラウザの開発者ツールから ID トークンを取得
# Firebase Console → Authentication → ユーザーのトークンをコピー
TOKEN="your-id-token"

# 一覧取得
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/employees

# 詳細取得
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/v1/employees/{id}

# 新規登録（admin のみ）
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"テスト","email":"test@example.com","department":"開発部","position":"エンジニア","employmentType":"full-time","status":"active","joinedAt":"2024-01-01","skills":["TypeScript"],"profile":""}' \
  http://localhost:3001/api/v1/employees
```

---

## Unit Org-1/2/3: 組織機能 — 統合テスト（手動）

### 前提条件

```bash
npm run dev
```

- Firebase Storage が有効であること
- `firestore.rules` / `storage.rules` / `firestore.indexes.json` がデプロイ済みであること

---

### シナリオ 1: 新規ユーザーが組織を作成する（Unit Org-2）

1. 新規 Google アカウントでログイン
2. `/onboarding/new-org` にリダイレクトされること
3. 組織名を入力（ロゴはオプション）→「組織を作成する」
4. ダッシュボード（`/`）にリダイレクトされること
5. サイドバーヘッダーに作成した組織名が表示されること
6. Firestore `organizations` コレクションにドキュメントが作成されていること
7. `employees` コレクションに admin ステータスのドキュメントが作成されていること

**確認項目**: カスタムクレームに `organizationId` / `role: 'admin'` がセットされている

---

### シナリオ 2: 事前登録済みメールでの自動 uid 紐付け（Unit Org-2/Org-3）

1. admin でログイン
2. 「社員を登録する」→「事前登録」タブ → 名前とメールアドレスを入力 →「事前登録する」
3. 社員一覧で「招待待ち」バッジが表示されること
4. 事前登録したメールアドレスの Google アカウントでサインアウト → ログイン
5. ダッシュボードにリダイレクトされること（`/onboarding/new-org` に飛ばないこと）
6. Firestore `employees` ドキュメントの `uid` が更新・`status` が `'active'` になっていること

---

### シナリオ 3: 組織設定の更新（Unit Org-3）

1. admin でログイン
2. サイドバー「組織設定」をクリック → `/admin/organization` が表示されること
3. 組織名を変更 → 「保存する」
4. サイドバーヘッダーの組織名が更新されること
5. ロゴ画像をアップロード → 「保存する」
6. サイドバーにロゴが表示されること
7. Firebase Storage に画像が保存されていること

---

### シナリオ 4: 組織間データ分離（セキュリティ確認）

1. 組織 A の admin でログイン → 社員一覧を確認
2. 組織 B の admin でログイン → 組織 A の社員が見えないこと
3. Firestore Security Rules が機能していることを確認

```bash
# Firestore Security Rules のテスト（Firebase Emulator 使用時）
npx firebase-tools emulators:exec --only firestore "npx vitest --run"
```

---

### シナリオ 5: 重複組織作成防止（SP-10）

```bash
TOKEN="admin-id-token-who-already-has-org"

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"別の組織"}' \
  http://localhost:3001/api/v1/organizations
# → 409 CONFLICT が返ること
```

---

### シナリオ 6: link-uid の uid 一致検証（SP-09）

```bash
TOKEN="abc123"  # uid = "abc123" のユーザー

curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","uid":"different-uid"}' \
  http://localhost:3001/api/v1/employees/link-uid
# → 403 FORBIDDEN が返ること
```

---

### シナリオ 7: ProtectedRoute 3段階ガード（Unit Org-2）

| 状態 | アクセス先 | 期待される挙動 |
|------|----------|-------------|
| 未ログイン | `/` | `/login` にリダイレクト |
| ログイン済み・組織なし | `/` | `/onboarding/new-org` にリダイレクト |
| ログイン済み・組織あり | `/` | ダッシュボード表示 |
| ログイン済み・組織あり | `/onboarding/new-org` | `/` にリダイレクト（UX-04） |

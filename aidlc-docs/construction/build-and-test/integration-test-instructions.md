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

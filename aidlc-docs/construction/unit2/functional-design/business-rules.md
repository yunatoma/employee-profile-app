# Business Rules — Unit 2: Firebase Integration

## 認証ルール

### BR-U2-01: ログイン必須
- 全ページ（`/login` 以外）はログイン必須
- 未認証ユーザーが保護されたルートにアクセスした場合、`/login` へリダイレクト
- ログイン後は元のアクセス先 URL へリダイレクト（Q6: B）

### BR-U2-02: Google 認証のみ
- ログイン方法は Google OAuth のみ（メール・パスワード認証なし）
- Firebase Authentication の Google プロバイダーを使用

### BR-U2-03: 初回ログイン時のユーザー登録
- Google ログイン成功後、Firestore の `users/{uid}` ドキュメントが存在しない場合は自動作成
- 初回登録ユーザーのロールは `'user'`（一般社員）として作成

---

## 権限ルール

### BR-U2-04: 管理者（admin）の権限
- 全社員の一覧・詳細閲覧
- 全社員の登録・編集
- 全社員の退職処理・完全削除
- 管理者のみ「社員を登録する」「退職処理」「完全削除」ボタンが表示される

### BR-U2-05: 一般社員（user）の権限
- **閲覧**: 全社員の一覧・詳細閲覧は可（退職者はデフォルト非表示）
- **編集**: 自分のプロフィールのみ編集可（`employee.email === currentUser.email` で判定）
- **登録・削除**: 不可（ボタン非表示）

### BR-U2-06: 未紐付けユーザーの扱い
- Firebase Auth の uid と Firestore の `employees` コレクションは別管理
- 一般社員が自分の employee レコードを編集できるかどうかは、メールアドレスの一致で判定
- `employee.email === authUser.email` → 自分のレコードとみなす

---

## 管理者セットアップルール

### BR-U2-07: セットアップスクリプト（`npm run setup-admin`）
- Firebase Admin SDK を使用してコンソールから実行
- 対象ユーザーの uid または email を引数で指定
- 対象の `users/{uid}` ドキュメントの `role` を `'admin'` に更新
- スクリプトは `server/scripts/setup-admin.ts` に配置

---

## データ永続化ルール

### BR-U2-08: 社員データの Firestore 保存
- Unit 1 のモックデータは廃止し、Firestore から取得・保存する
- `employees` コレクションの ID は `crypto.randomUUID()` で生成（Unit 1 と同じ）
- `createdAt` / `updatedAt` は Node.js API サーバーで付与（クライアントでは付与しない）

### BR-U2-09: Node.js API 経由のアクセス
- フロントエンドは Firestore に直接アクセスしない
- 全 CRUD は Node.js API（`/api/v1/...`）経由で行う
- Node.js API は Firebase Admin SDK で Firestore にアクセス

---

## Firestore セキュリティルール

### BR-U2-10: Firestore セキュリティルール方針（Q8: B）
- `employees` コレクション:
  - 読み取り: 認証済みユーザーのみ
  - 書き込み: 拒否（Node.js API の Admin SDK 経由のみ許可）
- `users` コレクション:
  - 読み取り: 自分のドキュメントのみ（`uid == request.auth.uid`）
  - 書き込み: 自分のドキュメントのみ（初回登録時）/ admin は全件

---

## ローカル開発環境ルール

### BR-U2-11: 開発サーバー起動
- `concurrently` でフロントエンド（Vite: 5173）と API サーバー（Express: 3001）を同時起動
- コマンド: `npm run dev`（ルートの package.json から両方を起動）
- Vite の `proxy` 設定で `/api/v1` リクエストを `http://localhost:3001` に転送

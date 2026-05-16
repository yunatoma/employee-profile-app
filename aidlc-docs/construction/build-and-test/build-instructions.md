# Build Instructions — Unit 1 & Unit 2

## 前提条件

| 項目 | 内容 |
|------|------|
| Node.js | 現在インストール済みのバージョン（固定なし） |
| パッケージマネージャー | npm |
| ビルドツール | Vite 8 |

## ビルド手順

### 1. 依存関係のインストール

```bash
npm install
```

インストールされる主なパッケージ：
- `react-hook-form` — フォーム管理
- `vitest`, `@testing-library/react`, `fast-check` — テスト基盤
- `@vitest/coverage-v8` — カバレッジレポート

### 2. 開発サーバー起動（動作確認用）

```bash
npm run dev
```

- URL: `http://localhost:5173`
- ホットリロード対応

### 3. 本番ビルド

```bash
npm run build
```

- TypeScript コンパイル + Vite バンドル
- 成果物: `dist/` ディレクトリ

### 4. ビルド結果の確認

```bash
npm run preview
```

- URL: `http://localhost:4173`
- `dist/` の内容をローカルでプレビュー

## ビルド成功の確認

**期待される出力（`npm run build`）:**
```
✓ TypeScript compilation succeeded
✓ built in Xs
dist/index.html
dist/assets/index-[hash].js
dist/assets/index-[hash].css
```

## トラブルシューティング

### TypeScript エラーが出る場合
```bash
npx tsc --noEmit
```
エラー箇所を確認して修正する。

### `vitest` の型エラーが出る場合
`vite.config.ts` の先頭に以下があることを確認：
```typescript
/// <reference types="vitest" />
```
`npm install` を再実行して vitest を確実にインストールする。

---

## Unit 2: Firebase Integration — ビルド手順

### 前提条件（Unit 2 追加分）

| 項目 | 内容 |
|------|------|
| Firebase プロジェクト | 作成済み（Google Auth + Firestore 有効） |
| サービスアカウントキー | `server/serviceAccountKey.json` に配置済み |
| 環境変数 | `.env.local`（フロントエンド）と `server/.env`（バックエンド）を作成済み |

### 1. 環境変数ファイルの作成

```bash
# フロントエンド用
cp .env.example .env.local
# → VITE_FIREBASE_* の値を Firebase Console から取得して記入

# バックエンド用
cp server/.env.example server/.env
# → GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json を確認
#   ALLOWED_ORIGIN=http://localhost:5173
#   PORT=3001
```

### 2. 全依存関係のインストール

```bash
# フロントエンド（ルートで実行）
npm install

# バックエンド
cd server && npm install && cd ..
```

インストールされる主なパッケージ（Unit 2 追加分）：
- フロントエンド: `firebase`, `concurrently`
- バックエンド: `express`, `firebase-admin`, `cors`, `dotenv`, `tsx`, `typescript`

### 3. 管理者ユーザーのセットアップ（初回のみ）

```bash
cd server
npm run setup-admin -- --email your-admin@example.com
cd ..
```

### 4. 開発サーバー起動（フロントエンド + バックエンド同時）

```bash
npm run dev
```

- フロントエンド: `http://localhost:5173`
- バックエンド API: `http://localhost:3001`
- Vite proxy: `/api/v1/*` → `localhost:3001`

フロントエンドのみ起動する場合：
```bash
npm run dev:front
```

### 5. バックエンドの型チェック

```bash
cd server
npx tsc --noEmit
```

## トラブルシューティング（Unit 2 追加分）

### Firebase 認証エラーが出る場合
```
Error: Could not load the default credentials
```
- `server/serviceAccountKey.json` が存在するか確認
- `server/.env` の `GOOGLE_APPLICATION_CREDENTIALS` パスが正しいか確認

### CORS エラーが出る場合
- `server/.env` の `ALLOWED_ORIGIN=http://localhost:5173` を確認
- バックエンドが `:3001` で起動しているか確認

### `firebase` モジュールが見つからない場合
```bash
npm install firebase
```

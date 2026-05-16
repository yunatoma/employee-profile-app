# Infrastructure Design — Unit 1: Frontend MVP

## スコープ

Unit 1 はフロントエンドのみ（React + Vite + モックデータ）。
クラウドサービス・バックエンドは一切使用しない。

---

## インフラ決定事項

### 1. デプロイ環境

| 環境       | 方法                          | 備考                          |
|-----------|------------------------------|------------------------------|
| 開発       | `npm run dev`（Vite dev server）| localhost:5173                |
| ビルド確認  | `npm run build && npm run preview` | ローカルで本番ビルドを確認      |
| 本番（予定）| Firebase Hosting              | Unit 2 で Firebase 接続時に設定 |

**Unit 1 の段階では本番デプロイは行わない。**

---

### 2. CI/CD

| フェーズ | 設定         | 詳細                                           |
|---------|-------------|-----------------------------------------------|
| Unit 1  | なし         | 手動ビルド・手動確認                              |
| Unit 2+ | GitHub Actions | Firebase デプロイ完了後に C（テスト＋デプロイ）設定 |

---

### 3. 環境変数

Unit 1 はモックデータのみのため実際の API キーは不要。
ただし Unit 2 の Firebase 接続に備えて `.env.example` を今から作成する。

**`.env.example` の内容（Unit 2 で実値を設定）:**

```
# Firebase Configuration (Unit 2 で設定)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Node.js API (Unit 2 で設定)
VITE_API_BASE_URL=
```

**`.gitignore` に追加するエントリ:**
```
.env
.env.local
.env.*.local
```

`.env.example` は Git にコミットする（実値なし）。

---

### 4. Node.js バージョン管理

個人開発のため固定なし。現在の環境をそのまま使用する。

---

### 5. ストレージ（Unit 1）

| データ種別   | 保存先          | 備考                             |
|------------|----------------|----------------------------------|
| 社員データ   | モック（インメモリ）| `src/features/employees/data/employees.mock.ts` |
| 画像        | なし            | Unit 3（Firebase Storage）で対応  |

---

### 6. 将来の Firebase Hosting 移行計画（Unit 2 で実施）

```
Unit 2 で追加する作業:
1. Firebase プロジェクト作成
2. Firebase Hosting 設定（firebase.json, .firebaserc）
3. .env に Firebase 設定値を記入
4. GitHub Actions で CI/CD を設定（テスト + firebase deploy）
```

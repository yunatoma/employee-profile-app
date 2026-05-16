# Infrastructure Design — Unit 2: Firebase Integration

## スコープ

Unit 2 のインフラはすべて **ローカル開発環境** で完結する。本番デプロイは Unit 3 以降で実施。

---

## サービスマッピング

| 論理コンポーネント | インフラサービス | 備考 |
|-----------------|----------------|------|
| フロントエンド（React + Vite） | ローカル Vite Dev Server（port 5173） | Unit 3 以降で Firebase Hosting |
| Node.js Express API | ローカル tsx watch（port 3001） | Unit 3 以降で Cloud Run 等 |
| Firebase Authentication | Firebase（クラウド） | Google OAuth プロバイダー有効化済み |
| Firestore | Firebase（クラウド） | ネイティブモード |
| 環境変数（フロントエンド） | `.env.local`（VITE_ プレフィックス） | .gitignore 除外済み |
| 環境変数（バックエンド） | `server/.env` | .gitignore / .claudeignore 除外済み |
| サービスアカウントキー | `server/serviceAccountKey.json` | .gitignore / .claudeignore 除外済み |

---

## ポート構成

| サービス | ポート | 備考 |
|---------|--------|------|
| Vite Dev Server | 5173 | フロントエンド |
| Express API Server | 3001 | バックエンド |
| Vite Proxy | `/api/v1` → `localhost:3001` | 開発時の CORS 回避 |

---

## 環境変数一覧

### フロントエンド（`.env.local`）

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### バックエンド（`server/.env`）

```
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
ALLOWED_ORIGIN=http://localhost:5173
PORT=3001
```

---

## ログ・モニタリング

個人開発のため、ログは `console.log` / `console.error` のみ。

| レイヤー | ログ出力 |
|--------|---------|
| Express リクエスト | console.log（メソッド・パス・ステータス） |
| 認証エラー | console.error（エラー詳細） |
| Firestore 操作 | console.log（成功）/ console.error（失敗） |
| フロントエンド | console.error（API エラー時） |

---

## セキュリティ境界

```
[ブラウザ]
    ↓ HTTPS（本番）/ HTTP（開発）
[Vite Dev Server :5173]
    ↓ /api/v1/* → proxy → localhost:3001
[Express API :3001]
    ├── authMiddleware（Firebase ID トークン検証）
    ├── roleMiddleware（Firestore roles 確認）
    └── Firebase Admin SDK
            ↓
        [Firebase Cloud（Auth + Firestore）]
```

- ブラウザ → Firestore への直接アクセスなし
- サービスアカウントキーはサーバー側のみ保持
- `.claudeignore` で Claude Code の読み込みから除外

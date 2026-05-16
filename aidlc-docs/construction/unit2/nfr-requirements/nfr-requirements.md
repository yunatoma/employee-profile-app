# NFR Requirements — Unit 2: Firebase Integration

## NFR-U2-01: セキュリティ

| 要件 | 内容 |
|------|------|
| 認証 | Firebase Authentication（Google OAuth のみ） |
| API 認証 | Firebase ID トークン（Bearer）による全エンドポイント保護 |
| 権限制御 | Firestore `users` コレクションのロールによる API レベルのアクセス制御 |
| Firestore | セキュリティルールによる認証 + ロールベースアクセス制御 |
| 機密情報 | サービスアカウントキー・Firebase 設定値は `.env` / `.env.local` で管理 |
| Claude 保護 | `.claudeignore` で機密ファイルを Claude Code の読み込み対象から除外 |
| XSS 対策 | Unit 1 と同様（React JSX 自動エスケープ） |

## NFR-U2-02: パフォーマンス

| 要件 | 内容 |
|------|------|
| API レスポンス | 個人開発・小規模データのため厳格な目標値なし |
| Firestore 読み取り | 一覧取得はコレクション全件取得（Phase 3 で OpenSearch に移行） |
| 認証状態確認 | onAuthStateChanged は非同期のため初期化中は LoadingSpinner 表示 |

## NFR-U2-03: 開発・保守性

| 要件 | 内容 |
|------|------|
| 言語 | TypeScript（フロントエンド・バックエンド共通） |
| フロントエンド実行 | Vite 開発サーバー（5173） |
| バックエンド実行（開発） | tsx（TypeScript を直接実行） |
| バックエンド実行（本番） | tsc でビルド → node dist/ |
| 同時起動 | concurrently でフロント + API を `npm run dev` で起動 |
| 環境変数 | フロントエンド: `.env.local`（VITE_ プレフィックス）/ バックエンド: `server/.env` |

## NFR-U2-04: 信頼性・エラーハンドリング

| 要件 | 内容 |
|------|------|
| API エラー形式 | `{ error: { code: string, message: string } }` の統一形式 |
| 認証エラー | 401: 未認証 / 403: 権限不足 / 400: バリデーションエラー |
| フロントエンド | AsyncThunk の rejected で ErrorMessage 表示（Unit 1 と同様） |
| リトライ | なし（Unit 1 と同様の方針） |

## NFR-U2-05: CORS

| 要件 | 内容 |
|------|------|
| 許可オリジン | 環境変数 `ALLOWED_ORIGIN` で設定 |
| 開発時 | `ALLOWED_ORIGIN=http://localhost:5173` |
| 本番時 | Firebase Hosting の URL（Unit 2 デプロイ時に設定） |

## NFR-U2-06: 機密情報管理（Security Baseline）

### `.claudeignore` で除外するファイル

```
# Firebase サービスアカウントキー
server/serviceAccountKey.json
server/*.json

# 環境変数（実値）
.env.local
server/.env
*.env
```

### `.gitignore` 追加エントリ

```
# Firebase Admin SDK
server/serviceAccountKey.json

# サーバー環境変数
server/.env
server/dist/
```

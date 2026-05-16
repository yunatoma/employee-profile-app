# Deployment Architecture — Unit 2: Firebase Integration

## Unit 2 スコープ：ローカル開発環境のみ

```
+--------------------------------------------------+
|               ローカル開発マシン                    |
|                                                  |
|  +--------------------+  +--------------------+ |
|  | Vite Dev Server    |  | Express API Server | |
|  | localhost:5173     |  | localhost:3001     | |
|  |                    |  |                    | |
|  | React + Redux      |  | authMiddleware     | |
|  | Firebase SDK       |  | roleMiddleware     | |
|  | (Auth クライアント)  |  | EmployeeService    | |
|  |                    |  | Firebase Admin SDK | |
|  | /api/v1/* ------proxy-->                   | |
|  +--------------------+  +--------------------+ |
|                                  |               |
+----------------------------------|--------------+
                                   |
                        (HTTPS to Firebase Cloud)
                                   |
                   +---------------v--------------+
                   |        Firebase Cloud         |
                   |                               |
                   |  +----------+  +-----------+  |
                   |  | Firebase |  | Firestore |  |
                   |  |   Auth   |  | (Native)  |  |
                   |  +----------+  +-----------+  |
                   +-------------------------------+
```

---

## 起動手順

```bash
# ルートディレクトリで実行（フロントエンド + バックエンド同時起動）
npm run dev

# 内部的に実行されるコマンド（concurrently）
#   vite                          → フロントエンド :5173
#   cd server && npm run dev      → tsx watch src/index.ts → :3001
```

---

## 初回セットアップ手順

```bash
# 1. Firebase コンソールでサービスアカウントキーを生成
#    Firebase Console → プロジェクト設定 → サービスアカウント → 新しい秘密鍵を生成
#    → server/serviceAccountKey.json として保存

# 2. 環境変数ファイルを作成
cp .env.example .env.local          # フロントエンド用（VITE_ 変数を記入）
cp server/.env.example server/.env  # バックエンド用（GOOGLE_APPLICATION_CREDENTIALS 等を記入）

# 3. 依存関係インストール
npm install                         # フロントエンド
cd server && npm install            # バックエンド

# 4. 管理者ユーザーのセットアップ（初回のみ）
cd server && npm run setup-admin -- --email your@email.com

# 5. 開発サーバー起動
cd ..
npm run dev
```

---

## 将来のデプロイ計画（参考）

| コンポーネント | 想定デプロイ先 | 備考 |
|-------------|-------------|------|
| フロントエンド | Firebase Hosting | `firebase deploy --only hosting` |
| Node.js API | **Google Cloud Run** | コンテナ化・自動スケール（Q1 回答: デプロイ時は B） |
| Firestore | Firebase（継続） | Unit 2 と同じ |
| Firebase Auth | Firebase（継続） | Unit 2 と同じ |

※ デプロイは Unit 3 以降のスコープ。Node.js API は Cloud Run を想定。Infrastructure Design フェーズで詳細設計を行う。

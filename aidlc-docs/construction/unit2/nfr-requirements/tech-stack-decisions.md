# Tech Stack Decisions — Unit 2: Firebase Integration

## フロントエンド追加パッケージ

| パッケージ | 用途 | インストール |
|-----------|------|------------|
| `firebase` | Firebase Auth クライアント SDK | `npm install firebase` |
| `concurrently` | フロント + API 同時起動 | `npm install -D concurrently` |

## バックエンド（server/）パッケージ

| パッケージ | 種別 | 用途 |
|-----------|------|------|
| `express` | dependencies | Web フレームワーク |
| `firebase-admin` | dependencies | Firestore / Auth 管理 |
| `cors` | dependencies | CORS ミドルウェア |
| `dotenv` | dependencies | 環境変数読み込み |
| `tsx` | devDependencies | TypeScript 直接実行（開発用） |
| `typescript` | devDependencies | TypeScript コンパイラ |
| `@types/express` | devDependencies | Express の型定義 |
| `@types/cors` | devDependencies | cors の型定義 |
| `@types/node` | devDependencies | Node.js の型定義 |

## ディレクトリ構成（追加分）

```
employee-profile-app/
  +-- server/                         ← 新規
  |   +-- package.json
  |   +-- tsconfig.json
  |   +-- .env                        ← .gitignore で除外
  |   +-- serviceAccountKey.json      ← .gitignore / .claudeignore で除外
  |   +-- src/
  |       +-- index.ts                ← Express エントリポイント
  |       +-- routes/
  |       |   +-- employees.ts
  |       +-- middleware/
  |       |   +-- authMiddleware.ts
  |       |   +-- roleMiddleware.ts
  |       |   +-- errorMiddleware.ts
  |       +-- services/
  |       |   +-- EmployeeService.ts
  |       +-- repositories/
  |       |   +-- FirestoreEmployeeRepository.ts
  |       +-- scripts/
  |           +-- setup-admin.ts
  +-- src/
  |   +-- features/
  |       +-- auth/                   ← 新規
  |       |   +-- types/user.ts
  |       |   +-- api/authService.ts
  |       |   +-- slices/authSlice.ts
  |       +-- employees/
  |           +-- api/
  |               +-- employeeRepository.ts  ← ApiEmployeeRepository に差し替え
  +-- .claudeignore                   ← 新規
  +-- firestore.rules                 ← 新規
```

## 開発環境起動スクリプト

```json
// ルートの package.json に追加
{
  "scripts": {
    "dev": "concurrently \"vite\" \"npm run dev:server\"",
    "dev:server": "cd server && npm run dev"
  }
}

// server/package.json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "setup-admin": "tsx src/scripts/setup-admin.ts"
  }
}
```

## Firebase プロジェクト設定

- Firebase プロジェクト: 作成済み（Q1: B）
- Authentication: Google プロバイダーを有効化
- Firestore: ネイティブモードで作成
- サービスアカウントキー: Firebase コンソール → プロジェクト設定 → サービスアカウント → 新しい秘密鍵を生成 → `server/serviceAccountKey.json` に保存

## .claudeignore の作成

Claude Code がサービスアカウントキーや環境変数ファイルを誤って読み込まないよう除外設定を追加する。

```
# .claudeignore
server/serviceAccountKey.json
server/*.json
.env.local
server/.env
```

# Technology Stack

## 現在の実装技術

### Programming Languages
- TypeScript ~6.0.2 - 全ソースコード
- HTML / CSS - Tailwind CSS によるスタイリング

### Frontend Frameworks
- React ^19.2.6 - UI フレームワーク
- Redux Toolkit ^2.11.2 - 状態管理
- React Router ^7.15.0 - クライアントサイドルーティング
- Tailwind CSS ^4.3.0 - ユーティリティファースト CSS

### Build Tools
- Vite ^8.0.12 - ビルドツール・開発サーバー

### Code Quality
- ESLint ^10.3.0 - リンター
- eslint-plugin-react-hooks ^7.1.1 - React Hooks ルール
- eslint-plugin-react-refresh ^0.5.2 - React Refresh サポート
- typescript-eslint ^8.59.2 - TypeScript ESLint

### Testing
- 現時点: テストなし（テストフレームワーク未導入）

## 将来の追加技術（計画）

| 技術                 | 目的                            | フェーズ |
|--------------------|-------------------------------|--------|
| Firebase Auth      | 認証（ログイン・ユーザー管理）       | MVP以降  |
| Firebase Firestore | NoSQL データベース（社員データ永続化）  | MVP以降  |
| Node.js            | バックエンド API サーバー           | 将来    |
| OpenSearch         | 高速全文検索（社員名・スキル・部署）   | 将来    |

## 技術選定の理由（推察）

- **React + TypeScript**: 型安全な SPA 開発
- **Redux Toolkit**: 複雑な状態管理（検索条件・ローディング・エラー）
- **Repository Pattern**: Firebase / REST への切り替えを容易にするための抽象化
- **Tailwind CSS v4**: モダンなスタイリング、迅速な UI 構築

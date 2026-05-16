# Build Instructions — Unit 1: Frontend MVP

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

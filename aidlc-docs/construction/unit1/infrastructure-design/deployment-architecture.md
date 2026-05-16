# Deployment Architecture — Unit 1: Frontend MVP

## Unit 1: ローカル開発環境のみ

```
開発者のマシン
  +-- Node.js（npm）
  |     +-- npm run dev        → Vite Dev Server（localhost:5173）
  |     +-- npm run build      → dist/ ディレクトリ生成
  |     +-- npm run preview    → ビルド結果確認（localhost:4173）
  |     +-- npm run test       → Vitest（ブラウザなし、jsdom）
  |
  +-- ブラウザ
        +-- React アプリ（localhost:5173）
              +-- Redux Store（インメモリ）
              +-- モックデータ（employees.mock.ts）
```

**外部通信なし。全データはブラウザメモリ内で完結。**

---

## 将来の本番アーキテクチャ（Unit 2 以降）

```
GitHub リポジトリ
  +-- Push / PR
        +-- GitHub Actions（Unit 2 以降）
              +-- npm run test（Vitest）
              +-- npm run build
              +-- firebase deploy --only hosting
                    |
                    v
              Firebase Hosting
                +-- React アプリ（静的ファイル配信）
                      +-- Firebase Auth（Google ログイン）
                      +-- Node.js API（Cloud Functions / Cloud Run）
                            +-- Firestore（社員データ）
                            +-- Firebase Storage（画像）
```

---

## ファイル構成（Unit 1 で追加するファイル）

```
employee-profile-app/
  +-- .env.example           ← 新規作成（Firebase 設定のテンプレート）
  +-- .gitignore             ← .env* エントリ追加（既存ファイルを更新）
```

---

## フェーズ別インフラ移行計画

| フェーズ | インフラ       | デプロイ先           | CI/CD          |
|---------|--------------|---------------------|----------------|
| Unit 1  | ローカルのみ   | なし（localhost）    | なし            |
| Unit 2  | Firebase     | Firebase Hosting    | GitHub Actions |
| Unit 3  | Firebase + OpenSearch | 同上         | 同上            |

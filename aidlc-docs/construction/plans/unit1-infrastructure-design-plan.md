# Unit 1: Frontend MVP — Infrastructure Design Plan

## 実行チェックリスト
- [x] 設計アーティファクト分析
- [x] 質問プラン生成
- [x] 回答収集・分析
- [x] infrastructure-design.md 生成
- [x] deployment-architecture.md 生成

---

## Unit 1 のインフラ概要

Unit 1 はフロントエンドのみ（React + Vite）で、バックエンド・クラウドサービスは使用しません。
インフラ設計のスコープは「ローカル開発環境」と「ビルド・デプロイ先の選定」に絞られます。

---

## 確認が必要なインフラ設計事項

---

### Q1: デプロイ先（Unit 1 フロントエンド）

Unit 1 完成後、フロントエンドをどこにデプロイしますか？

A) ローカル開発のみ（デプロイ不要。`npm run dev` で確認）
B) Vercel（GitHub 連携で自動デプロイ、無料プランあり）
C) Netlify（同上、無料プランあり）
D) GitHub Pages（静的ホスティング、無料）
E) その他（[Answer]: の後に説明を記入）

[Answer]:A(のちにfirebaseでデプロイしたい)

---

### Q2: CI/CD パイプライン

Unit 1 の段階で CI/CD（自動テスト・自動デプロイ）を設定しますか？

A) 設定しない（手動で `npm run build` → デプロイ）
B) GitHub Actions でテストのみ自動化（push 時に Vitest 実行）
C) GitHub Actions でテスト＋デプロイを自動化
D) その他（[Answer]: の後に説明を記入）

[Answer]:A現時点では不要。デプロイができた段階でC

---

### Q3: 環境変数管理

Unit 1 はモックデータのみですが、将来の Firebase 接続に備えて `.env` ファイルを準備しますか？

A) 今は不要（Unit 2 で Firebase 接続時に準備）
B) `.env.example` だけ今から作成しておく（実際の値は Unit 2 で）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q4: Node.js / npm バージョン固定

チーム開発ではないが、将来的な環境再現性のために Node.js バージョンを固定しますか？

A) 固定しない（個人開発なので不要）
B) `.node-version` または `.nvmrc` ファイルで固定する
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

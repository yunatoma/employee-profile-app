# Unit 2: Firebase Integration — Infrastructure Design Plan

## 実行チェックリスト
- [x] Functional Design / NFR Design アーティファクト分析
- [x] 質問プラン生成
- [x] 回答収集・分析
- [x] infrastructure-design.md 生成
- [x] deployment-architecture.md 生成

---

## インフラ設計に関する確認事項

---

### Q1: Node.js API のデプロイ先（Unit 2 スコープ）

Unit 2 の Node.js Express API サーバーはどこにデプロイしますか？

A) ローカル開発環境のみ（Unit 2 では本番デプロイなし・動作確認はローカルで完結）
B) Google Cloud Run（コンテナ化してデプロイ）
C) Firebase App Hosting（Firebase の管理コンソールから）
D) その他（[Answer]: の後に説明を記入）

[Answer]:A で、デプロイするタイミングでB

---

### Q2: フロントエンドのデプロイ（Unit 2 スコープ）

フロントエンド（React + Vite）のデプロイは Unit 2 のスコープに含めますか？

A) 含めない（ローカル開発環境のみ・Unit 3 以降でデプロイ）
B) Firebase Hosting にデプロイする
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q3: ログ・モニタリング

個人開発のため、ログとモニタリングはどうしますか？

A) console.log / console.error のみ（シンプル・個人開発向け）
B) 何らかのログサービスを使いたい（[Answer]: の後にサービス名を記入）

[Answer]:A

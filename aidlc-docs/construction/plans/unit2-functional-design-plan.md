# Unit 2: Firebase Integration — Functional Design Plan

## 実行チェックリスト
- [x] ユニット定義・ストーリーマップ確認
- [x] 質問プラン生成
- [x] 回答収集・分析
- [x] domain-entities.md 生成
- [x] business-rules.md 生成
- [x] business-logic-model.md 生成
- [x] frontend-components.md 生成

---

## 確認が必要な設計事項

---

### Q1: Node.js サーバーの実行環境

Node.js バックエンドをどこで動かしますか？

A) ローカル開発のみ（`node server/src/index.ts`）。本番デプロイは Unit 3 以降で検討
B) Firebase Cloud Functions（サーバーレス、Firebase と同じプロジェクトで管理）
C) Cloud Run（コンテナ、スケーリング自動）
D) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q2: ユーザーロール（権限）の保存場所

管理者・一般社員のロール情報はどこに保存しますか？

A) Firestore の `users` コレクション（uid をキーに `{ role: 'admin' | 'user' }` を保存）
B) Firebase Authentication の Custom Claims（トークンにロール情報を埋め込む）
C) その他（[Answer]: の後に説明を記入）

[Answer]:A phase3でもう一回検討

---

### Q3: 最初の管理者ユーザーの作成方法

最初の管理者（admin）はどうやって作成しますか？

A) Firestore コンソールから手動で `users/{uid}` ドキュメントに `role: 'admin'` を設定
B) 専用のセットアップスクリプト（`npm run setup-admin`）を用意する
C) 最初にログインしたユーザーを自動的に管理者にする
D) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q4: 部署・スキルのマスターデータ管理

部署とスキルのマスターデータはどう管理しますか？

A) Firestore にコレクションとして保存（`departments`, `skills`）。管理者が管理画面から追加・編集・削除できる
B) コード内の定数として管理（固定リスト）。変更はコードを更新する
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q5: EmployeeForm の部署・スキル入力方式

Unit 2 では EmployeeForm の部署・スキル入力をどう変えますか？

A) 部署: マスターからのドロップダウン選択 / スキル: マスターからのチェックボックス選択（複数可）
B) 部署: マスターからのドロップダウン選択 / スキル: 引き続きテキスト入力（カンマ区切り）
C) 両方引き続きテキスト入力のまま（Unit 3 で対応）
D) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q6: 認証後のリダイレクト先

ログイン成功後にどこへリダイレクトしますか？

A) ダッシュボード（`/`）
B) ログイン前にアクセスしようとしていたページ（元の URL）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q7: Node.js API のポート・開発環境構成

ローカル開発時の構成はどうしますか？

A) フロントエンド（Vite: 5173）と API サーバー（Express: 3001）を別々に起動する
B) `concurrently` などで同時起動するスクリプトを用意する
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q8: Firestore セキュリティルールの方針

Firestore のセキュリティルールはどう設定しますか？

A) シンプル: 認証済みユーザーなら全員読み書き可能（Node.js 側で権限チェック）
B) 厳格: Firestore ルールでロールごとのアクセス制御も実装する
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

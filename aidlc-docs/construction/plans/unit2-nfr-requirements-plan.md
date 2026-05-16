# Unit 2: Firebase Integration — NFR Requirements Plan

## 実行チェックリスト
- [x] Functional Design アーティファクト分析
- [x] 質問プラン生成
- [x] 回答収集・分析
- [x] nfr-requirements.md 生成
- [x] tech-stack-decisions.md 生成

---

## 確認が必要な NFR 事項

---

### Q1: Firebase プロジェクトの用意

Firebase プロジェクトはすでに作成済みですか？

A) まだ作成していない（Unit 2 のコード生成前に作成する）
B) すでに作成済み（プロジェクト ID がある）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q2: Node.js のバージョン・フレームワーク

Node.js バックエンドのフレームワークは何を使いますか？

A) Express（シンプル、軽量）
B) Fastify（高パフォーマンス）
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q3: Node.js のTypeScript実行

Node.js サーバーの TypeScript はどう実行しますか？

A) `ts-node` / `tsx`（トランスパイルなしで直接実行、開発向け）
B) `tsc` でビルドして `node dist/` で実行
C) その他（[Answer]: の後に説明を記入）

[Answer]:Aで本番環境はB

---

### Q4: Firebase Admin SDK の認証方式（ローカル開発）

ローカル開発時、Firebase Admin SDK の認証はどうしますか？

A) サービスアカウントキー（JSON ファイル）を `server/.env` で参照
B) Firebase Emulator Suite を使用してローカルで Firebase をエミュレート
C) その他（[Answer]: の後に説明を記入）

[Answer]:Aにして、.claudeignore でclaudeに読み込ませないようにする設定を追加したい

---

### Q5: CORS 設定

Node.js API の CORS はどう設定しますか？

A) 開発時のみ `http://localhost:5173` を許可（本番は同一オリジン想定）
B) 環境変数で許可オリジンを設定する
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q6: API エラーレスポンス形式

Node.js API のエラーレスポンス形式はどうしますか？

A) `{ error: { code: string, message: string } }` の統一形式
B) HTTP ステータスコードのみ（ボディなし）
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

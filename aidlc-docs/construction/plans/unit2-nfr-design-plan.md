# Unit 2: Firebase Integration — NFR Design Plan

## 実行チェックリスト
- [x] NFR Requirements アーティファクト分析
- [x] 質問プラン生成
- [x] 回答収集・分析
- [x] nfr-design-patterns.md 生成
- [x] logical-components.md 生成

---

## NFR Design に関する確認事項

---

### Q1: Firebase ID トークンのリフレッシュ戦略

Firebase ID トークンは発行から約 1 時間で期限切れになります。フロントエンドでのトークン取得戦略はどうしますか？

A) Firebase SDK の自動管理に任せる。API 呼び出し直前に `getIdToken()` を呼び、期限切れなら SDK が自動リフレッシュする（推奨・シンプル）
B) `onIdTokenChanged` リスナーで更新を検知し、Redux に最新トークンを保持する
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q2: API リクエスト時のロール取得方法

Node.js API で権限チェックをする際、ロール情報はどこから取得しますか？

A) リクエストごとに Firestore の `users/{uid}` から読み取る（シンプル・Unit 2 では推奨）
B) Firebase Custom Claims にロールを埋め込み、ID トークンから取得する（Firestore 読み取り不要・Unit 3 以降で検討）
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q3: 認証エラー時のフロントエンド挙動

API が 401 を返した場合（トークン無効・期限切れ）のフロントエンド処理はどうしますか？

A) `/login` へ強制リダイレクトし、Firebase からサインアウト
B) トークンリフレッシュを試みて 1 回だけリトライし、失敗したら `/login` へリダイレクト
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q4: ミドルウェアの構成順序

Express ミドルウェアのチェーン順序を決めます。推奨順序は以下ですが、変更しますか？

```
1. cors ミドルウェア
2. express.json()
3. authMiddleware（ID トークン検証 → req.user にセット）
4. roleMiddleware（必要なエンドポイントのみ適用）
5. ルートハンドラ
6. errorMiddleware（最後に配置・全エラーをキャッチ）
```

A) 上記の順序で問題ない
B) 変更したい（[Answer]: の後に希望を記入）

[Answer]:A

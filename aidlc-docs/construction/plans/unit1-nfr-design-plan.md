# Unit 1: Frontend MVP — NFR Design Plan

## 実行チェックリスト
- [x] Q&A 回答収集・分析
- [x] nfr-design-patterns.md 生成
- [x] logical-components.md 生成

---

## 確認が必要な NFR 設計事項

---

### Q1: フィルタ・統計計算のメモ化

`filterEmployees` と `dashboardStats` の計算は毎レンダリングで実行されます。
`useMemo` でメモ化しますか？

A) `useMemo` でメモ化する（社員数が増えた場合への備えとして）
B) メモ化しない（Phase 1 の社員数は少ないので不要）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B Phase3で対応したい

---

### Q2: EmployeeRow のメモ化

社員一覧テーブルの各行（`EmployeeRow`）を `React.memo` でメモ化しますか？

A) `React.memo` でメモ化する（リスト再レンダリングを最小化）
B) メモ化しない（Phase 1 の規模では不要）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B Phase3で対応したい

---

### Q3: フォーム状態管理ライブラリ

`EmployeeForm` のフォーム状態（入力値・エラー）はどう管理しますか？

A) `useState` でシンプルに管理する（ライブラリなし）
B) `react-hook-form` を導入する（バリデーション・パフォーマンス最適化が容易）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q4: 非同期エラーの再試行（リトライ）

API 呼び出し（AsyncThunk）が失敗した場合、リトライ機能を実装しますか？

A) リトライなし（エラーメッセージを表示してユーザーに再操作を促す）
B) 自動リトライを実装する（最大3回、指数バックオフ）
C) その他（[Answer]: の後に説明を記入）

[Answer]:A Phase3で対応したい

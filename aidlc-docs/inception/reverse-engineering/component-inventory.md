# Component Inventory

## Implementation Status Summary

| カテゴリ         | 合計 | 実装済み | スタブ | 未着手 |
|---------------|-----|--------|-------|------|
| ページコンポーネント | 5   | 1      | 4     | 0    |
| Redux Slice   | 1   | 1      | 0     | 0    |
| Repository    | 1   | 1      | 0     | 0    |
| ユーティリティ    | 2   | 0      | 0     | 2    |

## EmployeeListPage (実装済み)

**機能**:
- 全社員の一覧テーブル表示 (氏名、部署、職種、ステータス、スキル)
- Redux Store から社員データを取得 (`fetchEmployees`)
- ローディング・エラー表示対応

**未実装の想定機能**:
- 検索・フィルタ UI (SearchCondition は State に存在するが UI なし)
- 行クリックで詳細画面へのリンク
- 社員登録ボタン
- ページネーション

## employeeRepository (実装済み - モック)

**現在**: インメモリのモックデータを使って CRUD 操作をシミュレート
**将来**: Firebase Firestore / REST API に差し替え予定
**コメント**: ファイル内にAPI通信版のコードがコメントアウトで記述済み

## employeeSlice (実装済み)

**State**: employees, selectedEmployee, searchCondition, loading, error
**AsyncThunk**: fetchEmployees, fetchEmployeeById, createEmployee, updateEmployee, deleteEmployee
**Reducer**: setSearchCondition, clearSearchCondition

## 未実装コンポーネント一覧

### DashboardPage
- 現状: `<h1>ダッシュボード</h1>` のみ
- 想定: サマリーカード、最近の更新、統計情報等

### EmployeeDetailPage
- 現状: `<h1>社員詳細</h1>` のみ
- 想定: 社員プロフィールの詳細表示、スキルタグ、稼働状況

### EmployeeCreatePage
- 現状: `<h1>社員登録</h1>` のみ
- 想定: 社員情報入力フォーム、バリデーション

### EmployeeEditPage
- 現状: `<h1>社員編集</h1>` のみ
- 想定: 既存情報の編集フォーム、バリデーション

## スタブのユーティリティ

### filterEmployees.ts
- 現状: ファイル存在するが中身が空
- 想定: searchCondition を使ったクライアントサイドフィルタリングロジック

### employeeLabels.ts
- 現状: ファイル存在するが中身が空
- 想定: employmentType / status の日本語ラベル変換

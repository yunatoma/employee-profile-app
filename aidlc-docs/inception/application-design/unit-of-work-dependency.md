# Unit of Work — 依存関係

## ユニット依存マトリクス

| ユニット          | Unit 1 に依存 | Unit 2 に依存 | Unit 3 に依存 |
|----------------|:-----------:|:-----------:|:-----------:|
| Unit 1: Frontend MVP | -       | No          | No          |
| Unit 2: Firebase統合 | Yes     | -           | No          |
| Unit 3: OpenSearch   | Yes     | Yes         | -           |

**依存方向**: Unit 1 → Unit 2 → Unit 3（順次実行が必要）

---

## 依存詳細

### Unit 2 が Unit 1 に依存する理由

- Unit 2 は Unit 1 で完成した UI コンポーネント・ページを前提とする
- `EmployeeForm`（Unit 1）に マスター選択 UI を追加するのは Unit 2
- `ProtectedRoute`（Unit 2）が `Layout`（Unit 1）をラップする
- `employeeRepository` の差し替えは Unit 1 のモック実装が完成後に行う

### Unit 3 が Unit 2 に依存する理由

- OpenSearch への同期は Node.js バックエンド（Unit 2）が前提
- `SearchSyncService` は `EmployeeService`（Unit 2）に依存
- `searchRepository` は `/api/v1/search`（Unit 2 のサーバー基盤）が前提
- Firebase Storage の設定は Firebase プロジェクト（Unit 2）が前提

---

## 並列化の可否

| 作業                          | 並列化 | 備考                               |
|-----------------------------|:-----:|----------------------------------|
| Unit 1 完成後に Unit 2 開始    | No    | 順次依存                            |
| Unit 2 フロントエンド境界固め + Node.js構築 | Yes | Unit 2 内部のみ並列化可能（個人開発なので順次推奨）|
| Unit 2 完成後に Unit 3 開始    | No    | 順次依存                            |

---

## 共有リソース

| リソース                   | Unit 1 | Unit 2 | Unit 3 | 備考                            |
|--------------------------|:------:|:------:|:------:|-------------------------------|
| Employee 型 (types/employee.ts) | 定義 | 拡張  | 読取   | Unit 2 で uid/role/timestamps 追加 |
| employeeRepository インターフェース | 定義 | 差替 | 読取   | モック → API クライアントに差し替え |
| Redux Store              | 初期設定 | Slice 追加 | Slice 追加 | store.ts を各 Unit で拡張     |
| AppRoutes.tsx            | Layout 追加 | ProtectedRoute・Admin 追加 | - | 段階的にルート追加 |

---

## リスクポイント

| リスク                               | 影響ユニット | 対策                                   |
|------------------------------------|-----------|--------------------------------------|
| Employee 型変更（uid/role 追加）が Unit 1 設計に影響 | 1, 2 | Unit 1 時点から型に uid?: string を予約しておく |
| Node.js API と フロントエンドの型不一致 | 2       | 共通型定義ファイルを server/shared/ に配置 |
| OpenSearch のインデックス設計変更         | 3       | 検索クエリを searchRepository に閉じ込める   |
| Firebase Security Rules の権限設計ミス  | 2       | テストケースを先に定義してから実装             |

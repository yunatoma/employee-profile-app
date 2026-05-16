# Application Design Plan

## 実行チェックリスト
- [x] Q&A 回答収集・分析
- [x] components.md 生成
- [x] component-methods.md 生成
- [x] services.md 生成
- [x] component-dependency.md 生成
- [x] application-design.md（統合ドキュメント）生成
- [x] 設計の整合性検証

---

## 設計に関する確認事項

以下の質問に回答してください（[Answer]: タグの後にアルファベットを記入）。

---

### Q1: レイアウト・ナビゲーション構成

共通レイアウト（サイドバー・ヘッダー）はどう管理しますか？

A) 共通 Layout コンポーネントを作成し、ネストされたルートで全ページに適用する
   （例: `<Layout><Outlet /></Layout>`）
B) 各ページが独自にナビゲーションを含む（ページ単位で完結）
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q2: 社員フォームの共通化

社員登録（Create）と社員編集（Edit）のフォームは共通化しますか？

A) 共通の `EmployeeForm` コンポーネントを作成し、Create/Edit 両方で使う
B) Create と Edit はそれぞれ独立したフォームコンポーネントを持つ
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q3: 共通 UI コンポーネントの配置

SkillTag・StatusBadge・LoadingSpinner などの汎用 UI コンポーネントはどこに置きますか？

A) `src/components/` ディレクトリに集約（全フィーチャーから参照）
B) 各フィーチャー内に置く（`src/features/employees/components/` など）
C) A と B を混在（汎用は components/、フィーチャー固有は features/ 内）
D) その他（[Answer]: の後に説明を記入）

[Answer]:C

---

### Q4: Redux スライスの分割方針

フィーチャーごとに Redux Slice を分割しますか？

A) フィーチャーごとに分割する
   （`employeeSlice`, `authSlice`, `departmentSlice`, `skillSlice`）
B) 関連するものをまとめる
   （例: departments と skills を `masterSlice` として統合）
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q5: Node.js バックエンドのディレクトリ構成（Phase 2）

Node.js API サーバーはどこに配置しますか？

A) モノレポ構成: フロントエンドと同じリポジトリの `server/` ディレクトリに配置
   （例: `server/src/routes/`, `server/src/controllers/`）
B) 別リポジトリ: フロントエンドとは分けて管理する
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q6: Node.js API のルーティング構成（Phase 2）

Node.js バックエンドのルーティング構成はどうしますか？

A) フィーチャーベース: `/api/employees`, `/api/departments`, `/api/skills`, `/api/search`
B) RESTful リソースベース（同上だが、バージョニングあり: `/api/v1/...`）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q7: 認証ガード（Phase 2）

ログイン必須ページの保護はどう実装しますか？

A) React Router の `ProtectedRoute` コンポーネントでラップする
B) 各ページコンポーネント内で認証チェックを行う
C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

### Q8: OpenSearch 検索 UI（Phase 3）

検索機能の UI はどう配置しますか？

A) 専用の検索ページ（`/search`）を作成し、ヘッダーの検索バーからナビゲート
B) 社員一覧ページ（`/employees`）に検索バーを統合して同ページで結果表示
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

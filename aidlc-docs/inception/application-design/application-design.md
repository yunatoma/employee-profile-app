# Application Design（統合ドキュメント）

---

## Unit AI-1: AI Chat Feature (2026-05-18 追加)

### 新規コンポーネント

| コンポーネント | 配置 | 責務 |
|--------------|------|------|
| `AIChatButton` | `src/features/aiChat/components/AIChatButton/` | フローティングボタン。ログイン済みのみ表示。クリックでパネル開閉 |
| `AIChatPanel` | `src/features/aiChat/components/AIChatPanel/` | チャットパネル本体。メッセージ一覧・入力欄・送信ボタン |
| `AIChatMessage` | `src/features/aiChat/components/AIChatMessage/` | 個別メッセージ（user/model切り替え表示） |
| `EmployeeSuggestionCard` | `src/features/aiChat/components/EmployeeSuggestionCard/` | 推薦社員カード（プロフィールリンク付き） |

### 新規サービス・リポジトリ

| 名前 | 配置 | 責務 |
|------|------|------|
| `geminiClient` | `src/features/aiChat/api/geminiClient.ts` | Gemini API ラッパー |
| `aiChatRepository` | `src/features/aiChat/api/aiChatRepository.ts` | Gemini 呼び出し + Firestore chatHistory 読み書き |
| `aiChatSlice` | `src/features/aiChat/slices/aiChatSlice.ts` | チャット状態 Redux 管理 |

### 修正対象（既存）

| ファイル | 変更内容 |
|---------|---------|
| `src/app/store.ts` | `aiChatReducer` 追加 |
| `src/components/layout/Layout.tsx` | `<AIChatButton>` 追加（ログイン済みのみ） |

### データフロー

```
User Input
  → aiChatSlice.sendMessage (thunk)
    → Redux state.employees から全社員取得
    → status='active' + キーワードで事前フィルタ（最大20件）
    → aiChatRepository.query(question, filteredEmployees, history)
      → geminiClient: Gemini 2.0 Flash (JSON structured output)
    → Firestore chatHistory に保存
  → Redux state 更新 → UI 反映
```

---

## 設計方針サマリー

| 項目                    | 決定内容                                                     |
|-----------------------|-------------------------------------------------------------|
| レイアウト              | 共通 Layout コンポーネント + React Router Outlet（ネストルート）|
| フォーム共通化           | EmployeeForm を Create/Edit 両方で共用（mode プロパティで切り替え）|
| 共通 UI 配置           | 汎用コンポーネント: `src/components/`、フィーチャー固有: `src/features/*/components/` |
| Redux Slice 分割       | フィーチャーごとに分割（employee / auth / department / skill / search）|
| Node.js 配置           | モノレポ構成（`server/` ディレクトリ）                          |
| Node.js API バージョニング | `/api/v1/...`（バージョニングあり）                            |
| 認証ガード              | `ProtectedRoute` コンポーネントでラップ                         |
| 検索 UI               | 社員一覧ページ（`/employees`）に検索バーを統合                   |

---

## ディレクトリ構成（完成形）

```
employee-profile-app/
+-- src/                                 # フロントエンド
|   +-- App.tsx
|   +-- main.tsx
|   +-- app/
|   |   +-- store.ts                     # Redux Store（Slice 追加）
|   +-- routes/
|   |   +-- AppRoutes.tsx                # ルート定義（ProtectedRoute 追加）
|   +-- components/                      # 共通 UI コンポーネント
|   |   +-- Layout/
|   |   |   +-- Layout.tsx               # ヘッダー + サイドバー + Outlet
|   |   +-- ProtectedRoute/
|   |   |   +-- ProtectedRoute.tsx       # 認証ガード (Phase 2)
|   |   +-- SkillTag/
|   |   +-- StatusBadge/
|   |   +-- LoadingSpinner/
|   |   +-- ErrorMessage/
|   |   +-- ConfirmDialog/
|   +-- hooks/
|   |   +-- useAppSelector.ts            # 既存
|   |   +-- useAppDispatch.ts            # 既存
|   +-- features/
|   |   +-- employees/                   # 既存・拡張
|   |   |   +-- types/employee.ts
|   |   |   +-- api/employeeRepository.ts
|   |   |   +-- slices/employeeSlice.ts
|   |   |   +-- components/
|   |   |   |   +-- EmployeeForm/
|   |   |   |   +-- EmployeeTable/
|   |   |   |   +-- EmployeeProfile/
|   |   |   +-- utils/
|   |   |       +-- filterEmployees.ts
|   |   |       +-- permissions.ts       # (Phase 2)
|   |   +-- dashboard/                   # 新規 (Phase 1)
|   |   |   +-- components/
|   |   |   |   +-- StatCard/
|   |   |   |   +-- DepartmentChart/
|   |   |   +-- utils/dashboardStats.ts
|   |   +-- auth/                        # 新規 (Phase 2)
|   |   |   +-- types/user.ts
|   |   |   +-- api/authService.ts
|   |   |   +-- slices/authSlice.ts
|   |   +-- departments/                 # 新規 (Phase 2)
|   |   |   +-- types/department.ts
|   |   |   +-- api/departmentRepository.ts
|   |   |   +-- slices/departmentSlice.ts
|   |   +-- skills/                      # 新規 (Phase 2)
|   |   |   +-- types/skill.ts
|   |   |   +-- api/skillRepository.ts
|   |   |   +-- slices/skillSlice.ts
|   |   +-- search/                      # 新規 (Phase 3)
|   |       +-- types/search.ts
|   |       +-- api/searchRepository.ts
|   |       +-- slices/searchSlice.ts
|   |       +-- components/
|   |           +-- SearchBar/
|   +-- pages/
|   |   +-- DashboardPage.tsx            # 既存・実装
|   |   +-- EmployeeListPage.tsx         # 既存・拡張
|   |   +-- EmployeeDetailPage.tsx       # 既存・実装
|   |   +-- EmployeeCreatePage.tsx       # 既存・実装
|   |   +-- EmployeeEditPage.tsx         # 既存・実装
|   |   +-- LoginPage.tsx               # 新規 (Phase 2)
|   |   +-- DepartmentAdminPage.tsx      # 新規 (Phase 2)
|   |   +-- SkillAdminPage.tsx           # 新規 (Phase 2)
|   +-- utils/
|       +-- employeeLabels.ts            # 既存・実装
+-- server/                              # Node.js バックエンド (Phase 2)
|   +-- src/
|       +-- index.ts                     # Express エントリーポイント
|       +-- routes/
|       |   +-- employees.ts             # /api/v1/employees
|       |   +-- departments.ts           # /api/v1/departments
|       |   +-- skills.ts               # /api/v1/skills
|       |   +-- search.ts               # /api/v1/search (Phase 3)
|       +-- middleware/
|       |   +-- authMiddleware.ts        # Firebase JWT 検証
|       |   +-- roleMiddleware.ts        # ロールベースアクセス制御
|       |   +-- errorMiddleware.ts       # 統一エラーハンドリング
|       +-- services/
|       |   +-- EmployeeService.ts
|       |   +-- DepartmentService.ts
|       |   +-- SkillService.ts
|       |   +-- SearchSyncService.ts     # (Phase 3)
|       +-- repositories/
|           +-- FirestoreEmployeeRepository.ts
|           +-- FirestoreDepartmentRepository.ts
|           +-- FirestoreSkillRepository.ts
+-- aidlc-docs/                          # AI-DLC ドキュメント（コードなし）
```

---

## ルーティング設計（完成形）

```
AppRoutes.tsx
+-- /login                      → LoginPage（Phase 2、認証済みは / へリダイレクト）
+-- <ProtectedRoute>            (Phase 2、未認証は /login へリダイレクト)
    +-- <Layout>
        +-- /                   → DashboardPage
        +-- /employees          → EmployeeListPage
        +-- /employees/new      → EmployeeCreatePage（admin only, Phase 2）
        +-- /employees/:id      → EmployeeDetailPage
        +-- /employees/:id/edit → EmployeeEditPage
        +-- /admin/departments  → DepartmentAdminPage（admin only, Phase 2）
        +-- /admin/skills       → SkillAdminPage（admin only, Phase 2）
```

---

## データフロー（Phase 別サマリー）

### Phase 1（モックデータ）
```
UI → dispatch(AsyncThunk) → mockRepository → Redux Store → UI 更新
```

### Phase 2（Firebase + Node.js）
```
UI → dispatch(AsyncThunk) → apiClient → Node.js API
  → authMiddleware（JWT）
  → EmployeeService
  → Firestore
→ Redux Store → UI 更新
```

### Phase 3（OpenSearch）
```
[検索] SearchBar → searchSlice → searchRepository → /api/v1/search → OpenSearch
[書き込み同期] EmployeeService → Firestore + SearchSyncService → OpenSearch
```

---

## OpenSearch 後付け設計の核心

```
ISearchRepository（インターフェース）
  Phase 1/2 実装: なし（検索機能なし）
  Phase 3 実装: OpenSearchRepository（/api/v1/search）

IEmployeeRepository（インターフェース）
  Phase 1 実装: MockEmployeeRepository
  Phase 2+ 実装: ApiEmployeeRepository（Node.js API クライアント）

フロントエンドは IEmployeeRepository / ISearchRepository のインターフェースのみを参照
→ 実装の差し替えが容易
```

---

## フィーチャー一覧と Phase 対応

| フィーチャー      | Phase | 主要ファイル                            | 依存先                     |
|--------------|-------|----------------------------------------|--------------------------|
| employees    | 1     | employeeSlice, employeeRepository      | mockRepository → api     |
| dashboard    | 1     | dashboardStats, StatCard               | employees slice          |
| auth         | 2     | authSlice, authService                 | Firebase Auth            |
| departments  | 2     | departmentSlice, departmentRepository  | Node.js API              |
| skills       | 2     | skillSlice, skillRepository            | Node.js API              |
| search       | 3     | searchSlice, searchRepository          | Node.js API + OpenSearch |

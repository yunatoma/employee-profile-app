# Component Dependency

## フロントエンド 依存関係

### ページ → コンポーネント依存

```
DashboardPage
  +-- StatCard (x3: 総社員数, 部署別, 稼働状況)
  +-- DepartmentChart
  +-- LoadingSpinner
  +-- ErrorMessage

EmployeeListPage
  +-- EmployeeTable
  |     +-- EmployeeRow
  |           +-- SkillTag (複数)
  |           +-- StatusBadge
  +-- LoadingSpinner
  +-- ErrorMessage
  +-- SearchBar (Phase 3)

EmployeeDetailPage
  +-- EmployeeProfile
  |     +-- SkillTag (複数)
  |     +-- StatusBadge
  +-- ConfirmDialog (削除確認)
  +-- LoadingSpinner

EmployeeCreatePage
  +-- EmployeeForm (mode="create")
  +-- LoadingSpinner

EmployeeEditPage
  +-- EmployeeForm (mode="edit")
  +-- LoadingSpinner

LoginPage
  (Phase 2 - 依存コンポーネントなし)

DepartmentAdminPage (Phase 2)
  +-- ConfirmDialog
  +-- LoadingSpinner

SkillAdminPage (Phase 2)
  +-- ConfirmDialog
  +-- LoadingSpinner
```

### コンポーネント → Redux Store 依存

```
EmployeeListPage   → state.employees.{employees, loading, error}
EmployeeDetailPage → state.employees.{selectedEmployee, loading}
EmployeeCreatePage → state.employees.{loading, error}
               → state.departments.departments (Phase 2)
               → state.skills.skills (Phase 2)
EmployeeEditPage   → state.employees.{selectedEmployee, loading}
               → state.departments.departments (Phase 2)
               → state.skills.skills (Phase 2)
DashboardPage      → state.employees.employees
LoginPage          → state.auth.{user, loading} (Phase 2)
Layout             → state.auth.user (Phase 2)
ProtectedRoute     → state.auth.{user, loading} (Phase 2)
```

### Redux Store → Repository 依存

```
employeeSlice AsyncThunk → employeeRepository (IEmployeeRepository)
  Phase 1: mockRepository (インメモリ)
  Phase 2: apiRepository (Node.js API クライアント)

authSlice              → AuthService → Firebase Auth SDK (Phase 2)
departmentSlice        → departmentRepository (Phase 2)
skillSlice             → skillRepository (Phase 2)
searchSlice            → searchRepository → /api/v1/search (Phase 3)
```

## Node.js バックエンド 依存関係

```
server/src/index.ts (Express App)
  +-- routes/employees.ts
  |     +-- middleware/authMiddleware
  |     +-- middleware/roleMiddleware
  |     +-- services/EmployeeService
  |           +-- repositories/FirestoreEmployeeRepository
  |           +-- services/SearchSyncService (Phase 3)
  |                 +-- OpenSearch Client (Phase 3)
  +-- routes/departments.ts
  |     +-- middleware/authMiddleware
  |     +-- middleware/roleMiddleware
  |     +-- services/DepartmentService
  |           +-- repositories/FirestoreDepartmentRepository
  +-- routes/skills.ts
  |     +-- middleware/authMiddleware
  |     +-- middleware/roleMiddleware
  |     +-- services/SkillService
  |           +-- repositories/FirestoreSkillRepository
  +-- routes/search.ts (Phase 3)
  |     +-- middleware/authMiddleware
  |     +-- services/SearchService
  |           +-- OpenSearch Client
  +-- middleware/errorMiddleware
```

## 通信パターン

### Phase 1（モック）
```
React Component
  → dispatch(AsyncThunk)
  → mockRepository（インメモリ）
  → Redux Store 更新
  → Component 再レンダリング
```

### Phase 2（Firebase + Node.js）
```
React Component
  → dispatch(AsyncThunk)
  → apiRepository（fetch/axios）
  → Node.js API Server
    → Firebase Auth（JWT 検証）
    → EmployeeService
    → Firestore
  → Redux Store 更新
  → Component 再レンダリング
```

### Phase 3（OpenSearch）
```
SearchBar コンポーネント
  → dispatch(searchEmployees(query))
  → searchRepository
  → Node.js API: /api/v1/search
    → SearchService → OpenSearch
  → Redux Store 更新（検索結果）
  → EmployeeTable 再レンダリング

[書き込み時の同期]
Node.js EmployeeService.create/update/delete
  → FirestoreRepository（必ず実行）
  → SearchSyncService.sync（非同期・障害許容）
    → OpenSearch インデックス更新
```

## 依存マトリクス（コンポーネント間）

| 依存元                | Layout | ProtectedRoute | EmployeeForm | EmployeeTable | 共通 UI |
|---------------------|:------:|:--------------:|:------------:|:-------------:|:------:|
| DashboardPage       |   ←    |       ←        |              |               |   ←    |
| EmployeeListPage    |   ←    |       ←        |              |      ←        |   ←    |
| EmployeeDetailPage  |   ←    |       ←        |              |               |   ←    |
| EmployeeCreatePage  |   ←    |       ←        |      ←       |               |   ←    |
| EmployeeEditPage    |   ←    |       ←        |      ←       |               |   ←    |
| LoginPage           |        |                |              |               |        |

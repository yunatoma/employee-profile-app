# Unit of Work 定義

## ユニット分解方針

- **分解基準**: 開発フェーズ単位（3フェーズ = 3ユニット）
- **進め方**: フェーズを完全に完成させてから次のフェーズへ
- **Phase 2 内部順序**: フロントエンド側の API 境界を固めてから、Node.js バックエンドを構築して接続

---

## Unit 1: Frontend MVP

**名称**: Frontend MVP
**フェーズ対応**: Phase 1
**目標**: 全スタブページを実装し、モックデータで CRUD が完全に動作する状態にする

### 対象ファイル

**新規作成:**
- `src/components/Layout/Layout.tsx`
- `src/components/SkillTag/SkillTag.tsx`
- `src/components/StatusBadge/StatusBadge.tsx`
- `src/components/LoadingSpinner/LoadingSpinner.tsx`
- `src/components/ErrorMessage/ErrorMessage.tsx`
- `src/components/ConfirmDialog/ConfirmDialog.tsx`
- `src/features/employees/components/EmployeeForm/EmployeeForm.tsx`
- `src/features/employees/components/EmployeeTable/EmployeeTable.tsx`
- `src/features/employees/components/EmployeeProfile/EmployeeProfile.tsx`
- `src/features/dashboard/components/StatCard/StatCard.tsx`
- `src/features/dashboard/components/DepartmentChart/DepartmentChart.tsx`
- `src/features/dashboard/utils/dashboardStats.ts`

**変更:**
- `src/pages/DashboardPage.tsx` — 統計サマリー実装
- `src/pages/EmployeeDetailPage.tsx` — プロフィール詳細実装
- `src/pages/EmployeeCreatePage.tsx` — 登録フォーム実装
- `src/pages/EmployeeEditPage.tsx` — 編集フォーム実装
- `src/pages/EmployeeListPage.tsx` — EmployeeTable 分離・Layout 統合
- `src/routes/AppRoutes.tsx` — Layout ネストルート追加
- `src/features/employees/utils/filterEmployees.ts` — フィルタロジック実装
- `src/utils/employeeLabels.ts` — ラベル変換実装

### 実装順序（Phase 1 内部）

1. **共通基盤**: Layout, 共通 UI コンポーネント群, employeeLabels, filterEmployees
2. **ダッシュボード**: DashboardPage, StatCard, DepartmentChart, dashboardStats
3. **社員詳細**: EmployeeDetailPage, EmployeeProfile
4. **社員登録**: EmployeeCreatePage, EmployeeForm（mode="create"）
5. **社員編集**: EmployeeEditPage, EmployeeForm（mode="edit"）
6. **リファクタリング**: EmployeeListPage → EmployeeTable 分離

### 完了条件
- 全ページがモックデータで正常に動作する
- CRUD 操作（一覧・詳細・登録・編集・削除）がすべて動作する
- ダッシュボードに統計情報が表示される
- TypeScript エラーなし / ESLint エラーなし

---

## Unit 2: Firebase + Node.js 統合

**名称**: Firebase Integration
**フェーズ対応**: Phase 2
**目標**: Google 認証・Firestore 永続化・Node.js API・権限管理を実装する

### 対象ファイル

**新規作成（フロントエンド）:**
- `src/pages/LoginPage.tsx`
- `src/pages/DepartmentAdminPage.tsx`
- `src/pages/SkillAdminPage.tsx`
- `src/components/ProtectedRoute/ProtectedRoute.tsx`
- `src/features/auth/types/user.ts`
- `src/features/auth/api/authService.ts`
- `src/features/auth/slices/authSlice.ts`
- `src/features/departments/types/department.ts`
- `src/features/departments/api/departmentRepository.ts`
- `src/features/departments/slices/departmentSlice.ts`
- `src/features/skills/types/skill.ts`
- `src/features/skills/api/skillRepository.ts`
- `src/features/skills/slices/skillSlice.ts`
- `src/features/employees/utils/permissions.ts`

**変更（フロントエンド）:**
- `src/app/store.ts` — authSlice, departmentSlice, skillSlice 追加
- `src/routes/AppRoutes.tsx` — ProtectedRoute, LoginPage, AdminPages 追加
- `src/features/employees/api/employeeRepository.ts` — Node.js API クライアントに差し替え
- `src/features/employees/components/EmployeeForm/EmployeeForm.tsx` — マスター選択式化

**新規作成（バックエンド）:**
- `server/package.json`
- `server/src/index.ts`
- `server/src/routes/employees.ts`
- `server/src/routes/departments.ts`
- `server/src/routes/skills.ts`
- `server/src/middleware/authMiddleware.ts`
- `server/src/middleware/roleMiddleware.ts`
- `server/src/middleware/errorMiddleware.ts`
- `server/src/services/EmployeeService.ts`
- `server/src/services/DepartmentService.ts`
- `server/src/services/SkillService.ts`
- `server/src/repositories/FirestoreEmployeeRepository.ts`
- `server/src/repositories/FirestoreDepartmentRepository.ts`
- `server/src/repositories/FirestoreSkillRepository.ts`

**設定ファイル:**
- `firestore.rules` — Firestore セキュリティルール
- `.env.local` — Firebase 設定（フロントエンド）
- `server/.env` — Firebase Admin SDK 設定

### 実装順序（Phase 2 内部）

1. **フロントエンド境界固め**: auth フィーチャー（型定義のみ）、API クライアントの型定義
2. **Node.js セットアップ**: Express, Firebase Admin SDK, authMiddleware
3. **Employee API**: /api/v1/employees + FirestoreRepository + EmployeeService
4. **Department/Skill API**: マスターデータ API
5. **フロントエンド接続**: employeeRepository 差し替え、departmentRepository, skillRepository 実装
6. **認証 UI**: LoginPage, ProtectedRoute, authSlice, authService
7. **権限管理**: roleMiddleware, permissions.ts, EmployeeForm マスター選択式化
8. **管理画面**: DepartmentAdminPage, SkillAdminPage
9. **Firestore セキュリティルール**設定

### 完了条件
- Google アカウントでログイン・ログアウトできる
- Firestore に社員データが永続化される
- 管理者と一般社員で編集権限が異なる
- 部署・スキルがマスターから選択式で入力できる
- Node.js API が `/api/v1/...` で正常に動作する

---

## Unit 3: OpenSearch + 高度化

**名称**: OpenSearch Integration
**フェーズ対応**: Phase 3
**目標**: 高速全文検索とアバター画像アップロードを実装する

### 対象ファイル

**新規作成（フロントエンド）:**
- `src/features/search/types/search.ts`
- `src/features/search/api/searchRepository.ts`
- `src/features/search/slices/searchSlice.ts`
- `src/features/search/components/SearchBar/SearchBar.tsx`

**変更（フロントエンド）:**
- `src/pages/EmployeeListPage.tsx` — SearchBar 統合、検索結果表示
- `src/app/store.ts` — searchSlice 追加
- `src/features/employees/components/EmployeeForm/EmployeeForm.tsx` — アバター画像アップロード追加

**新規作成（バックエンド）:**
- `server/src/routes/search.ts` — /api/v1/search
- `server/src/services/SearchService.ts`
- `server/src/services/SearchSyncService.ts`

**変更（バックエンド）:**
- `server/src/services/EmployeeService.ts` — SearchSyncService 呼び出し追加

**インフラ:**
- OpenSearch ドメイン設定
- Firebase Storage 設定・ルール

### 実装順序（Phase 3 内部）

1. **OpenSearch セットアップ**: クラスター設定、インデックスマッピング
2. **SearchSyncService**: Firestore 書き込み時の OpenSearch 同期
3. **Search API**: /api/v1/search エンドポイント
4. **フロントエンド検索**: searchRepository, searchSlice, SearchBar
5. **EmployeeListPage 統合**: SearchBar + 検索結果表示
6. **Firebase Storage**: アバター画像アップロード機能
7. **既存データのインデックス化**: 既存 Firestore データを OpenSearch に投入

### 完了条件
- 社員名・スキル・部署・稼働状況でリアルタイム検索できる
- 検索結果が 1 秒以内に返る
- アバター画像がアップロード・表示できる
- Firestore への書き込み時に OpenSearch が自動同期される

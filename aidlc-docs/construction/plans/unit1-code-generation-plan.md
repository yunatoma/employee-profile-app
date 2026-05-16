# Unit 1: Frontend MVP — Code Generation Plan

## ユニットコンテキスト

| 項目           | 内容                                         |
|--------------|---------------------------------------------|
| ユニット名      | Unit 1: Frontend MVP                        |
| プロジェクト種別 | Brownfield                                  |
| ワークスペースルート | /Users/yuna/Documents/develop/employee-profile-app |
| 実装対象 FR    | FR-01, FR-02, FR-03, FR-04, FR-05a, FR-05b, FR-06 |
| 実装対象 NFR   | NFR-03（PBT）, NFR-05（保守性）                |

## 依存関係

- 依存する他ユニット: なし（Unit 1 は独立して動作）
- Unit 2 への引き渡し: `employeeRepository.ts`（差し替えポイント）、`AppRoutes.tsx`（/login ルート追加予定）

---

## ステップ一覧

### セットアップ

- [x] **Step 1**: パッケージ追加（package.json）
  - `react-hook-form` を dependencies に追加
  - `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@vitest/coverage-v8`, `fast-check`, `jsdom` を devDependencies に追加
  - 対象ファイル: `package.json`（修正）

- [x] **Step 2**: Vite テスト設定追加
  - `vite.config.ts` に `test: { environment: 'jsdom', coverage: { provider: 'v8', include: [...] } }` 追加
  - `package.json` に `"test": "vitest"`, `"test:coverage": "vitest run --coverage"` スクリプト追加
  - 対象ファイル: `vite.config.ts`（修正）, `package.json`（修正）

- [x] **Step 3**: 環境変数テンプレート作成
  - `.env.example` 新規作成（Firebase 設定キーのテンプレート）
  - `.gitignore` に `.env`, `.env.local` を追加（既存ファイル修正）

### 型・State 拡張

- [x] **Step 4**: SearchCondition に showRetired 追加 + EmployeeFormValues 型追加
  - `employeeSlice.ts` の `SearchCondition` に `showRetired: boolean` 追加
  - `clearSearchCondition` のリセット値に `showRetired: false` 追加
  - `src/features/employees/types/employee.ts` に `EmployeeFormValues`, `EmployeeFormErrors` 型追加
  - 対象ファイル: `src/features/employees/slices/employeeSlice.ts`（修正）, `src/features/employees/types/employee.ts`（修正）
  - ストーリー: FR-05a（退職者フィルタ）

### ビジネスロジック生成

- [x] **Step 5**: `filterEmployees` 実装
  - `src/features/employees/utils/filterEmployees.ts` 実装（BLM-01 に基づく）
  - showRetired / status / department / skill / keyword フィルタを順番に適用
  - 対象ファイル: `src/features/employees/utils/filterEmployees.ts`（修正: 空ファイルを実装）
  - ストーリー: FR-01, FR-05a

- [x] **Step 6**: `dashboardStats` 実装
  - `src/features/dashboard/utils/dashboardStats.ts` 新規作成（BLM-02 に基づく）
  - 在籍中（active + leave）のみ集計、部署別・ステータス別カウント
  - 対象ファイル: `src/features/dashboard/utils/dashboardStats.ts`（新規）
  - ストーリー: FR-06

- [x] **Step 7**: `validateEmployeeForm` 実装
  - `src/features/employees/utils/validateEmployeeForm.ts` 新規作成（BLM-03 に基づく）
  - name / email（形式・重複）/ department / position / employmentType / status / joinedAt バリデーション
  - 対象ファイル: `src/features/employees/utils/validateEmployeeForm.ts`（新規）
  - ストーリー: FR-03, FR-04

- [x] **Step 8**: `employeeLabels` 実装
  - `src/utils/employeeLabels.ts` 実装
  - status → 日本語ラベル（稼働中 / 休業中 / 退職）
  - employmentType → 日本語ラベル（正社員 / パート / 契約 / インターン）
  - 対象ファイル: `src/utils/employeeLabels.ts`（修正: 空ファイルを実装）
  - ストーリー: 共通基盤

### ビジネスロジックテスト生成

- [x] **Step 9**: `filterEmployees.test.ts` 作成（PBT）
  - `src/features/employees/utils/filterEmployees.test.ts` 新規作成
  - fast-check を使ったプロパティベーステスト 4プロパティ
  - 対象ファイル: `src/features/employees/utils/filterEmployees.test.ts`（新規）

- [x] **Step 10**: `dashboardStats.test.ts` 作成（PBT）
  - `src/features/dashboard/utils/dashboardStats.test.ts` 新規作成
  - fast-check を使ったプロパティベーステスト 3プロパティ
  - 対象ファイル: `src/features/dashboard/utils/dashboardStats.test.ts`（新規）

- [x] **Step 11**: `validateEmployeeForm.test.ts` 作成（PBT + 通常テスト）
  - `src/features/employees/utils/validateEmployeeForm.test.ts` 新規作成
  - fast-check PBT 2プロパティ + 境界テスト（無効メール形式）+ 重複チェックテスト
  - 対象ファイル: `src/features/employees/utils/validateEmployeeForm.test.ts`（新規）

- [x] **Step 12**: `employeeSlice.test.ts` 作成（Vitest）
  - `src/features/employees/slices/employeeSlice.test.ts` 新規作成
  - fetchEmployees / createEmployee / updateEmployee / deleteEmployee / setSearchCondition / clearSearchCondition のテスト
  - 対象ファイル: `src/features/employees/slices/employeeSlice.test.ts`（新規）

### 共通 UI コンポーネント生成

- [x] **Step 13**: 共通 UI コンポーネント作成
  - `src/components/ui/SkillTag.tsx`（新規）— グレー背景の丸角バッジ
  - `src/components/ui/StatusBadge.tsx`（新規）— ステータスに応じた色付きバッジ（WCAG AA 準拠）
  - `src/components/ui/LoadingSpinner.tsx`（新規）— 全画面中央スピナー
  - `src/components/ui/ErrorMessage.tsx`（新規）— 赤背景エラーボックス（role="alert"）
  - `src/components/ui/ConfirmDialog.tsx`（新規）— aria 対応確認ダイアログ（default / danger）
  - `src/components/ui/StatCard.tsx`（新規）— 統計カード
  - `src/components/ui/DepartmentChart.tsx`（新規）— 部署別テーブル
  - ストーリー: 共通基盤（ConfirmDialog → FR-05a, FR-05b）

- [x] **Step 14**: Layout コンポーネント作成
  - `src/components/layout/Layout.tsx`（新規）— ヘッダー + サイドバー（NavLink × 3）+ Outlet
  - `src/routes/AppRoutes.tsx`（修正）— Layout ラッパーを追加
  - ストーリー: 共通基盤

### フィーチャーコンポーネント生成

- [x] **Step 15**: EmployeeTable / EmployeeRow 作成
  - `src/features/employees/components/EmployeeTable/EmployeeTable.tsx`（新規）
  - `src/features/employees/components/EmployeeRow/EmployeeRow.tsx`（新規）
  - ストーリー: FR-01

- [x] **Step 16**: EmployeeProfile 作成
  - `src/features/employees/components/EmployeeProfile/EmployeeProfile.tsx`（新規）
  - 氏名・メール・部署・職種・雇用形態・StatusBadge・入社日（日本語）・スキル・プロフィール
  - ストーリー: FR-02

- [x] **Step 17**: EmployeeForm 作成（react-hook-form）
  - `src/features/employees/components/EmployeeForm/EmployeeForm.tsx`（新規）
  - mode="create" / "edit"、onBlur バリデーション、aria アクセシビリティ対応
  - ストーリー: FR-03, FR-04

### ページコンポーネント生成

- [x] **Step 18**: DashboardPage 実装
  - `src/pages/DashboardPage.tsx`（修正: スタブ → 実装）
  - fetchEmployees dispatch、dashboardStats 計算、StatCard × 3 + DepartmentChart
  - ストーリー: FR-06

- [x] **Step 19**: EmployeeListPage 修正
  - `src/pages/EmployeeListPage.tsx`（修正: フィルタ UI 追加）
  - ステータスドロップダウン（showRetired 対応）、filterEmployees 適用、EmployeeTable 使用
  - ストーリー: FR-01, FR-05a

- [x] **Step 20**: EmployeeDetailPage 実装
  - `src/pages/EmployeeDetailPage.tsx`（修正: スタブ → 実装）
  - fetchEmployeeById dispatch、EmployeeProfile + 退職処理ボタン + 完全削除ボタン + ConfirmDialog × 2
  - ストーリー: FR-02, FR-05a, FR-05b

- [x] **Step 21**: EmployeeCreatePage 実装
  - `src/pages/EmployeeCreatePage.tsx`（修正: スタブ → 実装）
  - EmployeeForm（mode="create"）、createEmployee dispatch、成功時 /employees/:id へ遷移
  - ストーリー: FR-03

- [x] **Step 22**: EmployeeEditPage 実装
  - `src/pages/EmployeeEditPage.tsx`（修正: スタブ → 実装）
  - fetchEmployeeById dispatch、EmployeeForm（mode="edit"）、updateEmployee dispatch、成功時 /employees/:id へ遷移
  - ストーリー: FR-04

### ドキュメント生成

- [x] **Step 23**: コードサマリードキュメント生成
  - `aidlc-docs/construction/unit1/code/code-summary.md`（新規）— 生成ファイル一覧・変更内容サマリー

---

## ストーリートレーサビリティ

| FR | ストーリー | 実装ステップ |
|----|--------|-----------|
| FR-01 | 社員一覧表示・フィルタ | Step 5, 15, 19 |
| FR-02 | 社員詳細表示 | Step 16, 20 |
| FR-03 | 社員登録 | Step 7, 17, 21 |
| FR-04 | 社員編集 | Step 7, 17, 22 |
| FR-05a | 退職処理 | Step 4, 5, 13, 20 |
| FR-05b | 完全削除 | Step 13, 20 |
| FR-06 | ダッシュボード | Step 6, 13, 18 |
| NFR-03 | PBT テスト | Step 9, 10, 11 |
| NFR-05 | 保守性（型安全・Feature-Sliced） | Step 4, 5, 6, 7 |

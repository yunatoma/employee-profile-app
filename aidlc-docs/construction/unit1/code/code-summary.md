# Code Generation Summary — Unit 1: Frontend MVP

## 修正ファイル（既存ファイルを変更）

| ファイル | 変更内容 |
|--------|---------|
| `package.json` | react-hook-form, vitest, @testing-library/*, fast-check, jsdom を追加。test/test:coverage スクリプト追加 |
| `vite.config.ts` | vitest 参照追加、test: { environment: 'jsdom', coverage: { provider: 'v8' } } 追加 |
| `.gitignore` | .env, .env.local, .env.*.local を追加 |
| `src/features/employees/slices/employeeSlice.ts` | SearchCondition に showRetired 追加。SearchCondition を export |
| `src/features/employees/types/employee.ts` | EmployeeFormValues / EmployeeFormErrors 型を追加 |
| `src/features/employees/utils/filterEmployees.ts` | 空ファイルを実装（showRetired / status / department / skill / keyword フィルタ） |
| `src/utils/employeeLabels.ts` | 空ファイルを実装（STATUS_LABELS / EMPLOYMENT_TYPE_LABELS / formatJoinedAt） |
| `src/routes/AppRoutes.tsx` | Layout ラッパーを追加（全ルートを Layout の Outlet として配置） |
| `src/pages/DashboardPage.tsx` | スタブ → 実装（StatCard × 3, DepartmentChart） |
| `src/pages/EmployeeListPage.tsx` | テーブルを EmployeeTable に置換、フィルタ UI 追加、filterEmployees 適用 |
| `src/pages/EmployeeDetailPage.tsx` | スタブ → 実装（EmployeeProfile + 退職処理 / 完全削除 + ConfirmDialog × 2） |
| `src/pages/EmployeeCreatePage.tsx` | スタブ → 実装（EmployeeForm mode=create + 登録後リダイレクト） |
| `src/pages/EmployeeEditPage.tsx` | スタブ → 実装（EmployeeForm mode=edit + 保存後リダイレクト） |

## 新規作成ファイル

### インフラ・設定

| ファイル | 内容 |
|--------|------|
| `.env.example` | Firebase / API キーのテンプレート（実値なし） |

### ビジネスロジック

| ファイル | 内容 |
|--------|------|
| `src/features/dashboard/utils/dashboardStats.ts` | 在籍社員集計（総数・部署別・ステータス別） |
| `src/features/employees/utils/validateEmployeeForm.ts` | フォームバリデーション（必須・メール形式・重複・入社日） |

### コンポーネント（共通 UI）

| ファイル | 内容 |
|--------|------|
| `src/components/layout/Layout.tsx` | ヘッダー + サイドバー（NavLink × 3）+ Outlet |
| `src/components/ui/SkillTag.tsx` | スキルタグバッジ |
| `src/components/ui/StatusBadge.tsx` | ステータスバッジ（WCAG AA 準拠カラー） |
| `src/components/ui/LoadingSpinner.tsx` | ローディングスピナー（role="status"） |
| `src/components/ui/ErrorMessage.tsx` | エラーメッセージ（role="alert"） |
| `src/components/ui/ConfirmDialog.tsx` | 確認ダイアログ（aria 対応・Escape キー対応） |
| `src/components/ui/StatCard.tsx` | 統計カード |
| `src/components/ui/DepartmentChart.tsx` | 部署別テーブル |

### コンポーネント（フィーチャー）

| ファイル | 内容 |
|--------|------|
| `src/features/employees/components/EmployeeTable/EmployeeTable.tsx` | 社員一覧テーブル |
| `src/features/employees/components/EmployeeRow/EmployeeRow.tsx` | 社員行（名前リンク・SkillTag・StatusBadge） |
| `src/features/employees/components/EmployeeProfile/EmployeeProfile.tsx` | 社員詳細プロフィール表示 |
| `src/features/employees/components/EmployeeForm/EmployeeForm.tsx` | 登録・編集フォーム（react-hook-form・onBlur バリデーション・aria 対応） |

### テスト

| ファイル | 種別 | 内容 |
|--------|-----|------|
| `src/features/employees/utils/filterEmployees.test.ts` | PBT + 通常 | fast-check 4プロパティ + 動作確認テスト |
| `src/features/dashboard/utils/dashboardStats.test.ts` | PBT + 通常 | fast-check 3プロパティ + 動作確認テスト |
| `src/features/employees/utils/validateEmployeeForm.test.ts` | PBT + 境界 | fast-check 2プロパティ + メール境界テスト + 重複チェックテスト |
| `src/features/employees/slices/employeeSlice.test.ts` | 単体 | 全 AsyncThunk + Reducer の動作確認テスト |

## FR トレーサビリティ

| FR | 実装 |
|----|-----|
| FR-01 社員一覧表示 | EmployeeListPage + EmployeeTable + filterEmployees |
| FR-02 社員詳細表示 | EmployeeDetailPage + EmployeeProfile |
| FR-03 社員登録 | EmployeeCreatePage + EmployeeForm + validateEmployeeForm |
| FR-04 社員編集 | EmployeeEditPage + EmployeeForm + validateEmployeeForm |
| FR-05a 退職処理 | EmployeeDetailPage（退職処理ボタン + ConfirmDialog） + showRetired フィルタ |
| FR-05b 完全削除 | EmployeeDetailPage（完全削除ボタン + ConfirmDialog danger） |
| FR-06 ダッシュボード | DashboardPage + dashboardStats + StatCard + DepartmentChart |

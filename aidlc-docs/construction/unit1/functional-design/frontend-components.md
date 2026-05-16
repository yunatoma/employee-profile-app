# Frontend Components — Unit 1: Frontend MVP

## コンポーネント階層

```
AppRoutes
+-- /login               → (Phase 2)
+-- <Layout>
    +-- Sidebar: [ダッシュボード, 社員一覧, 社員登録]
    +-- <Outlet>
        +-- /              → DashboardPage
        +-- /employees     → EmployeeListPage
        +-- /employees/new → EmployeeCreatePage
        +-- /employees/:id → EmployeeDetailPage
        +-- /employees/:id/edit → EmployeeEditPage
```

---

## Layout

**Props**: なし
**State**: なし（Phase 2 で auth state を参照）

**レンダリング**:
- ヘッダー: アプリ名「社員管理」（Phase 2 でユーザー名・ログアウトボタン追加）
- サイドバー: NavLink × 3（ダッシュボード・社員一覧・社員登録）
- `<Outlet />`

---

## DashboardPage

**Props**: なし
**State（Redux）**: `state.employees.{ employees, loading, error }`

**マウント時**: `fetchEmployees()` dispatch

**レンダリング**:
- `loading === true` → LoadingSpinner
- `error` → ErrorMessage
- 統計表示:
  - `dashboardStats(employees)` を計算
  - StatCard × 3（総社員数 / 稼働中 / 休業中）
  - DepartmentChart（部署別棒グラフ or テーブル）
  - 注記: "在籍中の社員（稼働中・休業中）のみを集計しています"

---

## EmployeeListPage

**Props**: なし
**State（Redux）**: `state.employees.{ employees, searchCondition, loading, error }`
**State（local）**: なし

**マウント時**: `fetchEmployees()` dispatch

**レンダリング**:
- フィルタエリア:
  - ステータスドロップダウン: `['全て', '稼働中', '休業中', '退職者を含む']`
    - 「退職者を含む」は管理者のみ表示（Phase 2。Phase 1 は常に表示）
    - 選択時に `setSearchCondition({ status: ..., showRetired: ... })` dispatch
  - （Phase 3: SearchBar 追加）
- 「社員を登録する」ボタン（/employees/new へ遷移）
- `loading` → LoadingSpinner
- `error` → ErrorMessage
- EmployeeTable（`filterEmployees(employees, searchCondition)` の結果を渡す）

---

## EmployeeTable

**Props**:
```typescript
type EmployeeTableProps = {
  employees: Employee[];
};
```

**レンダリング**:
- テーブルヘッダー: 氏名 / 部署 / 職種 / ステータス / スキル
- 各行: EmployeeRow コンポーネント
- 社員が0件の場合: 「該当する社員が見つかりません」を表示

---

## EmployeeRow（EmployeeTable の子）

**Props**:
```typescript
type EmployeeRowProps = {
  employee: Employee;
};
```

**レンダリング**:
- 氏名（/employees/:id へのリンク）
- 部署
- 職種
- StatusBadge（status）
- SkillTag × n（skills）

---

## EmployeeDetailPage

**Props**: なし（URL params から id 取得）
**State（Redux）**: `state.employees.{ selectedEmployee, loading, error }`

**マウント時**: `fetchEmployeeById(id)` dispatch

**レンダリング**:
- `loading` → LoadingSpinner
- `error` または `selectedEmployee === null` → ErrorMessage
- EmployeeProfile（selectedEmployee を渡す）
- 「編集」ボタン（/employees/:id/edit へ遷移）
- 「退職処理」ボタン（`status !== 'retired'` のときのみ表示。Phase 2 で管理者のみ）
- 「完全削除」ボタン（Phase 2 で管理者のみ）
- 退職処理確認ダイアログ（ConfirmDialog）
- 完全削除確認ダイアログ（ConfirmDialog、危険スタイル）

**インタラクション**:
- 退職処理クリック → ConfirmDialog 表示 → 確認 → `updateEmployee` dispatch
- 完全削除クリック → ConfirmDialog（危険）表示 → 確認 → `deleteEmployee` dispatch → /employees へ遷移

---

## EmployeeProfile（EmployeeDetailPage の子）

**Props**:
```typescript
type EmployeeProfileProps = {
  employee: Employee;
};
```

**レンダリング**:
- avatarUrl があれば画像表示（なければアイコン placeholder）
- 氏名・メール・部署・職種・雇用形態
- StatusBadge（status）
- 入社日（YYYY-MM-DD → 日本語表示: YYYY年M月D日）
- スキル: SkillTag × n
- プロフィール文（profile）

---

## EmployeeCreatePage

**Props**: なし
**State（Redux）**: `state.employees.{ employees, loading, error }`

**レンダリング**:
- ページタイトル「社員を登録する」
- EmployeeForm（mode="create"）
- `loading` 中はフォームを disabled

---

## EmployeeEditPage

**Props**: なし（URL params から id 取得）
**State（Redux）**: `state.employees.{ selectedEmployee, employees, loading, error }`

**マウント時**: `fetchEmployeeById(id)` dispatch（initialValues 取得のため）

**レンダリング**:
- ページタイトル「社員情報を編集する」
- `selectedEmployee` がロードされたら EmployeeForm（mode="edit", initialValues=selectedEmployee）
- `loading` 中は LoadingSpinner

---

## EmployeeForm

**Props**:
```typescript
type EmployeeFormProps = {
  mode: 'create' | 'edit';
  initialValues?: Partial<EmployeeFormValues>;
  onSubmit: (values: EmployeeFormValues) => void;
  isLoading?: boolean;
};
```

**State（local）**:
- `values: EmployeeFormValues` — フォーム入力値
- `errors: EmployeeFormErrors` — バリデーションエラー

**フィールド一覧**:
| フィールド      | 入力タイプ              | バリデーション |
|--------------|----------------------|-------------|
| name         | text                 | 必須          |
| email        | email                | 必須・形式・重複|
| department   | text                 | 必須          |
| position     | text                 | 必須          |
| employmentType | select（4択）        | 必須          |
| status       | select（3択）        | 必須          |
| joinedAt     | date                 | 必須・未来不可  |
| skills       | text（カンマ区切り）    | 任意          |
| profile      | textarea             | 任意          |

**送信処理**:
1. `validateEmployeeForm(values, employees, editingId)` を実行
2. エラーがあれば `errors` に設定してフォームに表示
3. エラーがなければ `onSubmit(values)` を呼び出す

**ボタン**:
- mode="create": 「登録する」
- mode="edit": 「保存する」
- 「キャンセル」（前ページへ戻る）

---

## 共通 UI コンポーネント

### SkillTag
```typescript
type SkillTagProps = { skill: string };
// 表示: グレー背景の丸角バッジ
```

### StatusBadge
```typescript
type StatusBadgeProps = { status: EmployeeStatus };
// active  → 緑背景「稼働中」
// leave   → 黄背景「休業中」
// retired → グレー背景「退職」
```

### LoadingSpinner
```typescript
// Props なし
// 全画面中央にスピナーを表示
```

### ErrorMessage
```typescript
type ErrorMessageProps = { message: string };
// 赤背景のエラーメッセージボックス
```

### ConfirmDialog
```typescript
type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger'; // danger は赤いボタン
};
```

### StatCard
```typescript
type StatCardProps = {
  label: string;
  value: number;
};
```

### DepartmentChart
```typescript
type DepartmentChartProps = {
  data: Record<string, number>; // { 部署名: 人数 }
};
// シンプルなテーブル形式（Phase 1）またはバーグラフ
```

# Frontend Components — Unit 2: Firebase Integration

## コンポーネント階層（Unit 2 後）

```
AppRoutes
+-- /login               → LoginPage（認証不要）
+-- <ProtectedRoute>
    +-- <Layout>          ← ログアウトボタン追加
        +-- /             → DashboardPage（変更なし）
        +-- /employees    → EmployeeListPage（変更なし）
        +-- /employees/new → EmployeeCreatePage（admin のみアクセス可）
        +-- /employees/:id → EmployeeDetailPage（権限ボタン制御）
        +-- /employees/:id/edit → EmployeeEditPage（権限チェック）
```

---

## 新規コンポーネント

### LoginPage

**Props**: なし
**State（Redux）**: `state.auth.{ loading, error }`

**レンダリング**:
- アプリロゴ・タイトル
- 「Google でログイン」ボタン（`data-testid="login-google-button"`）
- `loading` 中: ボタンを disabled
- `error` 時: ErrorMessage

**インタラクション**:
- ボタンクリック → `signInWithGoogle()` dispatch → 成功時に元の URL へリダイレクト

---

### ProtectedRoute

**Props**:
```typescript
type ProtectedRouteProps = {
  children: React.ReactNode;
};
```

**ロジック**:
- `state.auth.loading === true` → LoadingSpinner（認証状態確認中）
- `state.auth.user === null` → `<Navigate to="/login" state={{ from: location }} />`
- `state.auth.user !== null` → children をレンダリング

---

## 変更コンポーネント

### Layout（ログアウトボタン追加）

**追加要素**:
- ヘッダー右端: ログインユーザーの `displayName` 表示
- 「ログアウト」ボタン（`data-testid="layout-logout-button"`）
- クリック → `signOut()` dispatch → `/login` へリダイレクト

---

### EmployeeDetailPage（権限制御）

**State（Redux）追加**: `state.auth.user`

**権限による表示制御**:
```
getPermissions(role, currentUserEmail) を使用:
- canCreate → 「編集」ボタン表示制御
- canRetire → 「退職処理」ボタン表示制御（Phase 1 は常時表示 → Phase 2 で admin のみ）
- canDelete → 「完全削除」ボタン表示制御（Phase 1 は常時表示 → Phase 2 で admin のみ）
```

---

### EmployeeCreatePage（admin のみ）

- `ProtectedRoute` の内側だが、追加で admin チェック
- `role !== 'admin'` の場合: `/` へリダイレクト（または 403 ページ）

---

### EmployeeEditPage（権限チェック）

**追加ロジック**:
- `selectedEmployee` ロード後、`canEdit(selectedEmployee)` を確認
- 権限なし: ErrorMessage（「このページを編集する権限がありません」）を表示

---

### EmployeeForm（部署・スキル入力変更）

**部署フィールド（変更）**:
```typescript
// テキスト入力 → ドロップダウン
<select id="department" {...register('department', { required: '部署を選択してください' })}>
  <option value="">選択してください</option>
  {DEPARTMENTS.map((dept) => (
    <option key={dept} value={dept}>{dept}</option>
  ))}
</select>
```

**スキルフィールド（変更）**:
```typescript
// カンマ区切りテキスト → チェックボックス群
// react-hook-form の Controller を使用
<fieldset>
  <legend>スキル</legend>
  {SKILLS.map((skill) => (
    <label key={skill}>
      <input
        type="checkbox"
        value={skill}
        {...register('skills')}
        data-testid={`employee-form-skill-${skill}`}
      />
      {skill}
    </label>
  ))}
</fieldset>
```

**型変更（EmployeeFormValues）**:
```typescript
// Unit 1: skills: string（カンマ区切り）
// Unit 2: skills: string[]（チェックボックスで選択した配列）
```

---

## authSlice 設計

```typescript
// src/features/auth/slices/authSlice.ts

type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
};

// AsyncThunk
signInWithGoogle: () → AuthUser
signOut: () → void
initializeAuth: () → AuthUser | null  // onAuthStateChanged
```

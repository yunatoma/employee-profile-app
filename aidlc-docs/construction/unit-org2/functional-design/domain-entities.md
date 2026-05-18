# Domain Entities — Unit Org-2: Auth Flow & Onboarding

## 変更エンティティ

### AuthUser（変更）

```typescript
// 変更前
type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
};

// 変更後
type OrgStatus = 'loading' | 'member' | 'no-org';

type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member';       // 変更: 'user' → 'member'（employees コレクションの role に統一）
  organizationId?: string;         // 追加: カスタムクレームから取得
};
```

### AuthState（変更）

```typescript
// 変更後
interface AuthState {
  user: AuthUser | null;
  orgStatus: OrgStatus;    // 追加: 組織所属状態
  loading: boolean;
  error: string | null;
}
```

**`orgStatus` の意味:**
| 値 | 意味 |
|----|------|
| `'loading'` | 認証状態初期化中（スプラッシュ表示） |
| `'member'` | 組織所属済み（通常利用可能） |
| `'no-org'` | ログイン済みだが組織未所属 → `/onboarding/new-org` へ誘導 |

---

## 新規ページ・コンポーネント

### CreateOrgPage

**URL**: `/onboarding/new-org`
**表示条件**: `user != null && orgStatus === 'no-org'`

フォーム値:
```typescript
type CreateOrgFormValues = {
  name: string;           // 必須・1〜100文字
  logoFile: File | null;  // 任意
};
```

---

## Node.js エンドポイント変更

### index.ts のルート登録順序（修正済み）

`link-uid` は Unit Org-1 のレビューで発見したバグとして、Functional Design 承認前に修正済み。

```
// server/src/index.ts（修正後）
app.use('/api/v1/organizations', organizationsRouter);  // orgMiddleware 不要
app.post('/api/v1/employees/link-uid', linkUidHandler); // orgMiddleware の前に直接登録（修正済み）
app.use('/api/v1', orgMiddleware);
app.use('/api/v1/employees', employeesRouter);          // link-uid は含まない
```

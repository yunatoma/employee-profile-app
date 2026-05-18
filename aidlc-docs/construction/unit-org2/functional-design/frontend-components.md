# Frontend Components — Unit Org-2: Auth Flow & Onboarding

## 変更: AuthUser 型（`src/features/auth/types/user.ts`）

```typescript
export type OrgStatus = 'loading' | 'member' | 'no-org';

export type AuthUser = {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member';
  organizationId?: string;
};
```

---

## 変更: authSlice（`src/features/auth/slices/authSlice.ts`）

```typescript
interface AuthState {
  user: AuthUser | null;
  orgStatus: OrgStatus;    // 追加
  loading: boolean;
  error: string | null;
}

// 追加アクション
setOrgStatus(status: OrgStatus)

// signInWithGoogle thunk の戻り値変更
// → { user: AuthUser; orgStatus: 'member' | 'no-org' } を返す
```

---

## 変更: authService（`src/features/auth/api/authService.ts`）

```typescript
// 全面改訂: users コレクション廃止、link-uid API + カスタムクレームに切り替え

// signInWithGoogle(): BL-AUTH-01 を実装
// getCurrentAuthUser(): BL-AUTH-02 を実装（users コレクション参照を削除）
// 既存: signOut(), getIdToken(), onAuthStateChanged() は変更なし
```

---

## 変更: ProtectedRoute（`src/features/auth/components/ProtectedRoute.tsx`）

```typescript
// 変更後: 3段階ガード（BL-AUTH-04）
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, orgStatus, loading } = useAppSelector((state) => state.auth);

  if (loading || orgStatus === 'loading') → <LoadingSpinner />
  if (!user) → <Navigate to="/login" />
  if (orgStatus === 'no-org') → <Navigate to="/onboarding/new-org" />
  return <>{children}</>
}
```

---

## 変更: LoginPage（`src/pages/LoginPage.tsx`）

```typescript
// signInWithGoogle dispatch 後の分岐を削除
// （orgStatus は authSlice が管理し、ProtectedRoute が自動ルーティングするため）
// from パラメータによるリダイレクトも、ProtectedRoute に委譲する
// → LoginPage はシンプルにサインインボタンのみを提供する
```

---

## 新規: CreateOrgPage（`src/pages/CreateOrgPage.tsx`）

```typescript
// URL: /onboarding/new-org
// 表示条件: user != null && orgStatus === 'no-org'
// （orgStatus === 'member' のユーザーがアクセスした場合は / へリダイレクト）

// フォーム状態
const [name, setName] = useState('');
const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

// 送信処理: BL-AUTH-03 を実装
// - ロゴアップロード（任意）
// - createOrganization() dispatch
// - forceTokenRefresh
// - setOrgStatus('member')
// - navigate('/')
```

---

## 新規: LogoUpload（`src/components/LogoUpload/LogoUpload.tsx`）

```typescript
type LogoUploadProps = {
  onFileSelect: (file: File, previewUrl: string) => void;
  previewUrl: string | null;
  disabled?: boolean;
};

// 責務:
// - ファイル選択 input（accept="image/*"）
// - クライアントサイドバリデーション（5MB・image/*）
// - プレビュー表示
// - Firebase Storage へのアップロードは親コンポーネント（CreateOrgPage / OrgSettingsPage）が担当
```

---

## 変更: AppRoutes（`src/routes/AppRoutes.tsx`）

```typescript
// 追加ルート
<Route path="/onboarding/new-org" element={<OnboardingGuard><CreateOrgPage /></OnboardingGuard>} />

// OnboardingGuard:
// - 未認証 → /login
// - member → /
// - no-org → pass through（CreateOrgPage を表示）
```

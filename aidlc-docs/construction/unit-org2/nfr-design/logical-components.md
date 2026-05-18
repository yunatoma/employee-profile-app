# Logical Components — Unit Org-2: Auth Flow & Onboarding

## 変更コンポーネント

### authService（フロントエンド）— 全面改訂

**パス**: `src/features/auth/api/authService.ts`

```
変更点:
  - signInWithGoogle(): users コレクション廃止 → link-uid API + カスタムクレームに切り替え
  - getCurrentAuthUser(): users コレクション廃止 → カスタムクレーム + link-uid に切り替え
  - 新関数 handlePostSignIn(firebaseUser): BL-AUTH-01 の実装

signInWithGoogle():
  1. signInWithPopup
  2. handlePostSignIn(user) を呼んで orgStatus を確定
  3. { user: AuthUser, orgStatus } を返す

handlePostSignIn(firebaseUser):
  1. getIdTokenResult() でクレームチェック（高速パス）
  2. クレームなし → POST /api/v1/employees/link-uid
     - 200 → forceTokenRefresh → orgStatus: 'member'
     - 404 → orgStatus: 'no-org'
     - その他 → エラーをスロー

getCurrentAuthUser():
  1. onAuthStateChanged で user 取得
  2. handlePostSignIn() を呼んで orgStatus を確定
  3. { user: AuthUser | null, orgStatus } を返す
```

---

### authSlice（フロントエンド）— 変更

**パス**: `src/features/auth/slices/authSlice.ts`

```
追加 State:
  orgStatus: OrgStatus  // 'loading' | 'member' | 'no-org'

追加 Reducer:
  setOrgStatus(status: OrgStatus)

変更 Thunk:
  signInWithGoogle: AuthUser + orgStatus を返す → fulfilled で両方更新
  initializeAuth: 同上
```

---

### ProtectedRoute（フロントエンド）— 変更

**パス**: `src/features/auth/components/ProtectedRoute.tsx`

```
変更: 3段階ガードに拡張（BL-AUTH-04・UX-01 パターン適用）

1. loading || orgStatus === 'loading' → <LoadingSpinner />
2. !user → <Navigate to="/login" />
3. orgStatus === 'no-org' → <Navigate to="/onboarding/new-org" />
4. 通過
```

---

### link-uid ハンドラ（サーバーサイド）— 変更

**パス**: `server/src/index.ts`

```
追加: SP-09 uid 一致検証を追加
  if (uid !== req.user!.uid) → 403 FORBIDDEN
```

---

### POST /api/v1/organizations ハンドラ — 変更

**パス**: `server/src/routes/organizations.ts`

```
追加: SP-10 組織作成重複防止
  if (req.user!.organizationId) → 409 CONFLICT
```

---

### CreateOrgPage（フロントエンド）— 新規

**パス**: `src/pages/CreateOrgPage.tsx`

```
責務:
  - UX-04 リダイレクトガード（user なし → /login、member → /）
  - 組織名入力フォーム（バリデーション）
  - LogoUpload コンポーネント統合
  - UX-03 ロゴアップロード失敗時続行
  - UX-02 二重送信防止
  - 送信後: SP-11 トークン強制リフレッシュ → setOrgStatus('member') → navigate('/')
```

---

### LogoUpload（フロントエンド）— 新規

**パス**: `src/components/LogoUpload/LogoUpload.tsx`

```
責務:
  - ファイル選択 input（accept="image/*"）
  - クライアントサイドバリデーション（5MB・image/*）
  - プレビュー表示（URL.createObjectURL）
  - onFileSelect(file, previewUrl) コールバックで親に通知
  ※ Storage へのアップロードは CreateOrgPage が担当
```

---

### reset-db.ts — 変更

**パス**: `server/src/scripts/reset-db.ts`

```
追加: users コレクションも削除対象に追加（NFR-ORG2-03 後方互換性）
```

---

## AppRoutes 変更

```typescript
// 追加ルート
<Route path="/onboarding/new-org" element={<CreateOrgPage />} />
// CreateOrgPage 内で UX-04 ガードを実装するためラッパー不要
```

# NFR Design Patterns — Unit Org-2: Auth Flow & Onboarding

Unit Org-1 の既存パターン（SP-01〜SP-08, EH-01〜EH-02, DI-01〜DI-02, PP-01〜PP-03）を継承し、
認証フロー・オンボーディング固有の新規パターンを定義する。

---

## セキュリティパターン（追加）

### SP-09: link-uid リクエスト uid 一致検証パターン

`link-uid` エンドポイントで、リクエストボディの `uid` がトークン uid と一致することを検証する。
これにより、他人の uid を指定した不正な紐付けを防ぐ。

```typescript
// server/src/index.ts の link-uid ハンドラ内
app.post('/api/v1/employees/link-uid', async (req, res, next) => {
  const { email, uid } = req.body;

  // uid がトークンの uid と一致することを検証
  if (uid !== req.user!.uid) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '不正なリクエストです' } });
    return;
  }
  // ...
});
```

---

### SP-10: 組織作成重複防止パターン

既に組織所属のユーザーが `POST /api/v1/organizations` を呼び出した場合に 409 を返す。

```typescript
// server/src/routes/organizations.ts の POST ハンドラ先頭
if (req.user!.organizationId) {
  res.status(409).json({
    error: { code: 'CONFLICT', message: '既に組織に所属しています' }
  });
  return;
}
```

---

### SP-11: トークン強制リフレッシュパターン

カスタムクレームはトークンの有効期限（最大1時間）まで反映されないため、
組織作成・uid 紐付け完了後にフロントエンドで強制リフレッシュを行う。

```typescript
// フロントエンド共通パターン
async function handleForceTokenRefresh() {
  const user = firebaseAuth.currentUser;
  if (user) {
    await user.getIdToken(true);  // true = 強制リフレッシュ
  }
}

// 使用箇所:
// 1. link-uid API が { forceTokenRefresh: true } を返した場合
// 2. createOrganization API が { forceTokenRefresh: true } を返した場合
```

---

## UX パターン

### UX-01: orgStatus ローディングパターン

`orgStatus` が確定するまでの間、白いちらつき（FOUC）を防ぐ全画面スピナー。

```typescript
// ProtectedRoute での実装
if (loading || orgStatus === 'loading') {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
```

**`orgStatus` の遷移:**
```
アプリ起動
  → orgStatus: 'loading'（initializeAuth 実行中）
  → Firebase Auth 確定
    → 未ログイン: orgStatus: 'no-org'（ProtectedRoute が /login へ）
    → ログイン済み + クレームあり: orgStatus: 'member'
    → ログイン済み + クレームなし: link-uid 試行 → 'member' or 'no-org'
```

---

### UX-02: 組織作成フォーム二重送信防止パターン

```typescript
// CreateOrgPage
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  if (submitting) return;
  setSubmitting(true);
  try {
    // ...
  } finally {
    setSubmitting(false);
  }
};

// ボタン
<button disabled={submitting || !name.trim()}>
  {submitting ? '作成中...' : '組織を作成する'}
</button>
```

---

### UX-03: ロゴアップロード失敗時続行パターン

```typescript
// CreateOrgPage の送信ロジック
let logoUrl: string | undefined;

if (logoFile) {
  try {
    const logoRef = ref(storage, `organizations/${tempOrgId}/logo`);
    await uploadBytes(logoRef, logoFile);
    logoUrl = await getDownloadURL(logoRef);
  } catch (uploadErr) {
    // ロゴアップロード失敗はエラーにしない（組織作成は続行）
    console.warn('ロゴアップロード失敗（続行）:', uploadErr);
  }
}

// logoUrl なしで組織作成 API を呼ぶ
await dispatch(createOrganization({ name, logoUrl, creatorName }));
```

---

### UX-04: CreateOrgPage リダイレクトガードパターン

```typescript
// CreateOrgPage の先頭
const { user, orgStatus } = useAppSelector((state) => state.auth);
const navigate = useNavigate();

useEffect(() => {
  if (!user) navigate('/login', { replace: true });
  if (orgStatus === 'member') navigate('/', { replace: true });
}, [user, orgStatus, navigate]);
```

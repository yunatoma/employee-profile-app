# Business Logic Model — Unit Org-2: Auth Flow & Onboarding

## BL-AUTH-01: signInWithGoogle()（全面改訂）

```
入力: なし（Google OAuth popup）

1. signInWithPopup(firebaseAuth, provider) → FirebaseUser を取得

2. ID トークンを取得（カスタムクレーム確認用）
   await user.getIdToken(true)  // 強制リフレッシュで最新クレームを取得

3. カスタムクレームチェック（高速パス）
   const token = await user.getIdTokenResult()
   if (token.claims.organizationId) {
     → orgStatus: 'member'
     → AuthUser 返却（organizationId・role はクレームから取得）
   }

4. email で employee 検索（link-uid エンドポイント呼び出し）
   POST /api/v1/employees/link-uid { email: user.email, uid: user.uid }

   レスポンス分岐:
     200 → uid 紐付け成功（または既に紐付済み）
           forceTokenRefresh: true の場合 → await user.getIdToken(true)
           orgStatus: 'member'
           AuthUser 返却

     404 (NOT_FOUND) → このメールの employee が存在しない
           orgStatus: 'no-org'
           AuthUser 返却（organizationId なし）

     409 (CONFLICT) → 別のアカウントで既に使用中
           エラーをスロー → ログイン失敗として処理

5. Return { user: AuthUser, orgStatus }
```

---

## BL-AUTH-02: getCurrentAuthUser()（全面改訂）

アプリ起動時の認証状態復元。

```
1. onAuthStateChanged で FirebaseUser を取得
   → null の場合: { user: null, orgStatus: 'no-org' } を返す

2. ID トークン結果を取得（クレーム確認）
   const tokenResult = await firebaseUser.getIdTokenResult()

3. クレームチェック
   if (tokenResult.claims.organizationId) {
     → orgStatus: 'member'
     → AuthUser 返却
   }

4. クレームなし → link-uid を試行（サインアップから時間が経ってクレームが消えた場合など）
   POST /api/v1/employees/link-uid { email, uid }
     200 → forceTokenRefresh → orgStatus: 'member'
     404 → orgStatus: 'no-org'
     その他エラー → orgStatus: 'no-org'（安全側に倒す）

5. Return { user: AuthUser | null, orgStatus }
```

---

## BL-AUTH-03: CreateOrgPage の送信ロジック

```
入力: { name: string, logoFile: File | null }

1. バリデーション
   - name が空または空白のみ → エラー表示
   - name が 100文字超 → エラー表示
   - logoFile がある場合:
     - サイズ > 5MB → エラー表示
     - MIME が image/* でない → エラー表示

2. ロゴアップロード（logoFile がある場合）
   Firebase Storage: organizations/{tempOrgId}/logo にアップロード
   ※ tempOrgId は upload 前にクライアントで生成（UUID）
   → logoUrl を取得

3. 組織作成 API 呼び出し
   POST /api/v1/organizations
   { name, logoUrl?, creatorName: displayName }

4. レスポンス処理
   { organization, forceTokenRefresh: true }
   → await firebase.auth().currentUser.getIdToken(true)  // トークン強制リフレッシュ
   → dispatch(setCurrentOrganization(organization))
   → dispatch(setOrgStatus('member'))
   → navigate('/')
```

---

## BL-AUTH-04: ProtectedRoute の3段階ガードロジック

```
入力: children（保護対象コンポーネント）

1. orgStatus === 'loading' または auth.loading
   → <LoadingSpinner />

2. auth.user === null
   → <Navigate to="/login" />

3. auth.orgStatus === 'no-org'
   → <Navigate to="/onboarding/new-org" />

4. auth.orgStatus === 'member'
   → children をレンダリング（通過）
```

# NFR Requirements — Unit Org-2: Auth Flow & Onboarding

Unit Org-1 の NFR（データ分離・Security Rules・トランザクション）を継承しつつ、
認証フロー・オンボーディング固有の要件を追加定義する。

---

## NFR-ORG2-01: セキュリティ

| 要件 | 内容 |
|------|------|
| link-uid 認証 | `POST /api/v1/employees/link-uid` は Firebase ID トークン必須（authMiddleware 通過後） |
| link-uid 検証 | リクエストの `uid` が `req.user.uid`（トークンの uid）と一致することをサーバーサイドで検証する |
| 組織作成の重複防止 | `POST /api/v1/organizations` 呼び出し時、リクエストユーザーが既に組織所属の場合は 409 を返す |
| トークン強制リフレッシュ | 組織作成・uid 紐付け完了後、フロントエンドは `getIdToken(true)` で必ずリフレッシュする |
| CreateOrgPage 保護 | 組織所属済みユーザーが `/onboarding/new-org` にアクセスした場合、ダッシュボードにリダイレクト |

## NFR-ORG2-02: UX・信頼性

| 要件 | 内容 |
|------|------|
| ローディング表示 | `orgStatus === 'loading'` 中は全画面スピナーを表示し、ちらつきを防ぐ |
| エラーハンドリング | link-uid・組織作成 API のエラーはユーザーにわかりやすいメッセージで表示する |
| ロゴアップロード失敗 | ロゴアップロードが失敗しても組織作成は続行できる（ロゴなしで作成） |
| 二重送信防止 | 組織作成フォームの送信中はボタンを disabled にして二重送信を防ぐ |

## NFR-ORG2-03: 後方互換性

| 要件 | 内容 |
|------|------|
| users コレクション廃止 | `authService.ts` から `users/{uid}` コレクションへの読み書きを完全に削除する |
| ロール統一 | `UserRole` を `'admin' \| 'member'` に統一（旧 `'user'` を `'member'` に移行） |
| reset-db.ts 更新 | `users` コレクションも削除対象に追加する |

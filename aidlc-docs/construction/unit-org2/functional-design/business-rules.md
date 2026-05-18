# Business Rules — Unit Org-2: Auth Flow & Onboarding

## BR-AUTH-01: サインアップ後のルーティング必須

- Google サインイン完了後、必ず組織所属チェックを行う
- `orgStatus` が確定する前に保護ルートへのアクセスを許可しない

## BR-AUTH-02: 組織未所属ユーザーのアクセス制限

- `orgStatus === 'no-org'` のユーザーが保護ルート（`/` 以下）にアクセスした場合、`/onboarding/new-org` にリダイレクトする
- `CreateOrgPage` 以外の保護ルートへのアクセスは一切遮断する

## BR-AUTH-03: 組織作成後の即時アクティベーション

- 組織作成 API 呼び出し成功後、Firebase ID トークンを強制リフレッシュする
- リフレッシュ後、新しいカスタムクレーム（`organizationId`・`role`）がトークンに含まれる
- `orgStatus` を `'member'` に更新してダッシュボードへ遷移する

## BR-AUTH-04: users コレクションの廃止

- Unit 2 で使用していた `users/{uid}` コレクションへの読み書きを廃止する
- ロール情報は `employees` コレクションの `role` フィールドとカスタムクレームで管理する
- 既存の `users` コレクションデータは DB リセットスクリプトで削除する（BR-ORG-移行）

## BR-AUTH-05: ロゴアップロードの任意性

- ロゴなしで組織作成が完了できる（ロゴは任意）
- ロゴファイルは Firebase Storage にアップロードし、URL を組織情報に保存する
- アップロード前にクライアントサイドでファイルサイズ（5MB 以下）と MIME タイプ（image/*）を検証する

## BR-AUTH-06: CreateOrgPage は認証済みユーザーのみアクセス可

- 未認証ユーザーが `/onboarding/new-org` にアクセスした場合は `/login` にリダイレクト
- 認証済み + 組織所属済みユーザーが `/onboarding/new-org` にアクセスした場合はダッシュボードへリダイレクト

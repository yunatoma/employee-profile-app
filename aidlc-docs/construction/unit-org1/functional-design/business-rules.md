# Business Rules — Unit Org-1: Organization Foundation

## BR-ORG-01: 組織所属の強制

- すべての `employees` ドキュメントは必ず `organizationId` を持つ
- `organizationId` が存在しない employee ドキュメントの作成・更新は禁止
- Firestore Security Rules でサーバーサイド強制する

## BR-ORG-02: データ完全分離

- ユーザーは**自分が所属する組織の employees のみ**を読み書きできる
- 他組織の employees・organizations ドキュメントへのアクセスは一切禁止
- Firestore Security Rules 条件:
  ```
  // employees コレクション
  request.auth != null
  && exists(/databases/$(database)/documents/employees/$(request.auth.uid))
  && get(/databases/$(database)/documents/employees/$(request.auth.uid)).data.organizationId
     == resource.data.organizationId
  ```
  ※ uid をキーとした employees ドキュメントまたは organizationId を JWT カスタムクレームで管理する設計を採用する（詳細は NFR Design で決定）

## BR-ORG-03: uid 紐付けの一意性

- 1つの Firebase Auth uid は、最大1つの employees ドキュメントにのみ紐付けられる
- 既に別の employees ドキュメントに紐付いている uid でのリンク要求は拒否する
- 紐付け処理は Firestore トランザクションで行い、競合を防ぐ

## BR-ORG-04: pending 状態の制約

- `status: 'pending'` の社員は `uid: null` でなければならない
- `uid` が設定された社員の `status` を `'pending'` に変更することは禁止
- `status: 'pending'` の社員はログイン機能を使用できない（紐付け前のため当然）

## BR-ORG-05: 組織 admin の最低1名保証

- 組織の `admin` ロールを持つ社員が0人になる操作は禁止
- admin 自身の role を member に変更する際、他に admin が存在する場合のみ許可
- 実装上: EmployeeService で admin カウントチェックを行う

## BR-ORG-06: 組織アクセス権限

- **admin**: 自組織の organizations ドキュメントを読み書きできる
- **member**: 自組織の organizations ドキュメントを読み取りのみ可能
- 他組織の organizations ドキュメントには誰もアクセスできない

## BR-ORG-07: email の組織内一意性

- 同一組織内で同じメールアドレスの employees ドキュメントは作成できない
- 異なる組織間では同じメールアドレスが存在してよい（マルチテナント設計）
- 新規 employee 作成時（事前登録含む）に組織内 email 重複チェックを行う

## BR-ORG-08: organizationId の不変性

- 一度設定された `organizationId` は変更できない
- 社員の組織間移動は、現組織での削除 + 新組織での新規作成で行う
- Firestore Security Rules および EmployeeService でフィールド変更を禁止

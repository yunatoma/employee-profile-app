# NFR Requirements — Unit Org-1: Organization Foundation

## NFR-ORG1-01: セキュリティ（最重要）

| 要件 | 内容 |
|------|------|
| データ分離 | Firestore Security Rules で `organizationId` 一致を全コレクションの必須条件とする |
| 組織アクセス制御 | 他組織の `organizations` / `employees` ドキュメントへの read / write を完全拒否 |
| uid 紐付け保護 | `link-uid` エンドポイントは Firebase Auth の ID トークン必須。email と uid の整合性をサーバーサイドで検証 |
| organizationId 不変保護 | Firestore Security Rules で `organizationId` フィールドの変更を禁止（`request.resource.data.organizationId == resource.data.organizationId`） |
| トランザクション整合性 | 組織作成・uid 紐付けはアトミック処理（Firestore トランザクション）で行い、部分書き込みを防ぐ |
| Admin SDK 使用場所 | uid 紐付け処理・admin 最低1名チェックは Node.js サーバーサイドのみで実行（クライアント直書き禁止） |

## NFR-ORG1-02: Firestore インデックス

| インデックス対象 | 理由 |
|---------------|------|
| `employees` コレクション: `organizationId` (ASC) | 全社員取得クエリで必須 |
| `employees` コレクション: `organizationId` + `email` (複合) | メール検索 + 組織フィルタで必須 |
| `employees` コレクション: `organizationId` + `uid` (複合) | uid 紐付け検索で必須 |
| `employees` コレクション: `organizationId` + `status` (複合) | ステータスフィルタで必須 |

Firestore コンソールまたは `firestore.indexes.json` に定義する。

## NFR-ORG1-03: データ整合性

| 要件 | 内容 |
|------|------|
| uid 一意性 | 1 uid = 1 employees ドキュメントの制約をサーバーサイドで検証 |
| 組織内メール一意性 | 同一 `organizationId` 内での email 重複をサービス層で検証 |
| pending 状態整合性 | `status: 'pending'` と `uid: null` は常にセットで管理（どちらか一方のみの状態を禁止） |
| admin 最低1名 | `role: 'admin'` 社員数が 0 になる操作を EmployeeService でブロック |

## NFR-ORG1-04: パフォーマンス

| 要件 | 内容 |
|------|------|
| organizationId フィルタ | Firestore の複合インデックスにより、組織内社員取得を効率化する |
| 組織情報キャッシュ | `organizationSlice` の `currentOrganization` に組織情報をキャッシュし、毎リクエストでの再取得を避ける |
| uid 紐付け処理 | トランザクション処理のため若干の遅延あり（許容範囲、1〜2秒以内） |

## NFR-ORG1-05: Security Rules 設計方針

Firestore Security Rules の `organizationId` 検証方式を決定する。

**採用方式: カスタムクレーム方式（推奨）**

```
Firebase Auth カスタムクレームに organizationId を付与する
→ Security Rules で request.auth.token.organizationId として参照可能
→ Firestore への追加読み取りが不要で効率的

設定タイミング: uid 紐付け成功時 or 組織作成成功時に
               Node.js サーバーが Firebase Admin SDK で setCustomUserClaims() を呼ぶ
```

**代替方式: Firestore lookup 方式（不採用）**

```
Security Rules 内で get() を使って employees ドキュメントを参照
→ 毎リクエストで追加の Firestore 読み取りが発生（コスト増・パフォーマンス低下）
→ 個人開発・小規模では許容範囲だが、カスタムクレーム方式が優れる
```

## NFR-ORG1-06: 移行（既存データのリセット）

| 要件 | 内容 |
|------|------|
| 既存データ | Firestore の全 `employees` ドキュメントを削除し、新スキーマで再作成する |
| スクリプト | `server/src/scripts/reset-db.ts` を作成してデータクリアを行う |
| 実行環境 | 開発時のみ（本番データなし） |

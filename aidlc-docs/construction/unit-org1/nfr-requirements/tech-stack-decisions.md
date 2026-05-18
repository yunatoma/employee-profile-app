# Tech Stack Decisions — Unit Org-1: Organization Foundation

## 新規パッケージ

Unit Org-1 で追加が必要なパッケージはなし。Unit 2 で導入済みのパッケージを活用する。

| 使用技術 | 既存/新規 | 用途 |
|---------|--------|------|
| `firebase` (クライアント SDK) | 既存 (Unit 2) | Firestore クライアント操作 |
| `firebase-admin` | 既存 (Unit 2) | カスタムクレーム設定、サーバーサイド Firestore 操作 |
| Redux Toolkit | 既存 (Unit 1) | `organizationSlice` 追加 |

## Firebase カスタムクレーム設定

NFR-ORG1-05 で決定した「カスタムクレーム方式」の実装ポイント。

```typescript
// Node.js サーバーサイド: 組織作成・uid 紐付け完了時に呼び出す
await admin.auth().setCustomUserClaims(uid, {
  organizationId: orgId,
  role: 'admin' | 'member',
});
```

**注意**: カスタムクレームの反映はクライアントの ID トークン更新後（最大1時間）。
強制反映が必要な場合は `user.getIdToken(true)` でトークンを強制リフレッシュする。

## Firestore インデックス定義ファイル

`firestore.indexes.json` を新規作成し、複合インデックスを定義する。

```json
{
  "indexes": [
    {
      "collectionGroup": "employees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "email", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "employees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "uid", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "employees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "employees",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "organizationId", "order": "ASCENDING" },
        { "fieldPath": "joinedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Firebase Storage バケット構成

```
gs://{project-id}.appspot.com/
  └── organizations/
        └── {orgId}/
              └── logo          ← 組織ロゴ画像（Unit Org-2 で実装）
```

## 追加設定ファイル

| ファイル | 内容 |
|--------|------|
| `firestore.indexes.json` | 複合インデックス定義（新規） |
| `firestore.rules` | 全面改訂（organizationId + カスタムクレームベース） |
| `storage.rules` | ロゴ画像アクセス制御（新規追加） |
| `server/src/scripts/reset-db.ts` | 開発用データリセットスクリプト（新規） |

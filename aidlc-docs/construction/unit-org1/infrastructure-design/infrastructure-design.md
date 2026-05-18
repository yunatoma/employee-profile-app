# Infrastructure Design — Unit Org-1: Organization Foundation

## スコープ

Unit 2 のインフラ構成をベースに、組織機能追加で必要な変更・追加のみ記載する。
（既存: Vite :5173 / Express :3001 / Firebase Auth / Firestore は変更なし）

---

## 変更・追加サービスマッピング

| 論理コンポーネント | インフラサービス | 変更種別 |
|-----------------|----------------|--------|
| `organizations` コレクション | Firestore（既存プロジェクト） | 新規追加 |
| Firebase Auth カスタムクレーム | Firebase Authentication | 機能追加（setCustomUserClaims） |
| Firebase Storage（ロゴ） | Firebase Storage | 新規有効化（Unit Org-2 で実際のアップロード実装） |
| Firestore インデックス | `firestore.indexes.json` | 新規定義ファイル追加 |
| `orgMiddleware` | Node.js Express（既存サーバー） | 新規ミドルウェア追加 |
| organizations API ルーター | Node.js Express（既存サーバー） | 新規ルート追加 |
| DB リセットスクリプト | ローカル実行（tsx） | 新規スクリプト追加 |

---

## Firestore コレクション構成

```
Firestore（ネイティブモード）
  ├── organizations/
  │     └── {orgId}
  │           ├── id: string
  │           ├── name: string
  │           ├── logoUrl?: string
  │           ├── ownerId: string
  │           ├── createdAt: Timestamp
  │           └── updatedAt: Timestamp
  │
  └── employees/
        └── {employeeId}          ← 既存。以下フィールドを追加
              ├── organizationId: string   ← 追加
              ├── uid: string | null       ← 変更（null 許可）
              └── status: 'active' | 'leave' | 'retired' | 'pending'  ← pending 追加
```

---

## Firebase Storage バケット構成

```
gs://{project-id}.appspot.com/
  └── organizations/
        └── {orgId}/
              └── logo          ← 組織ロゴ画像（Unit Org-2 で実際のアップロード実装）
```

Storage は Unit Org-1 で**有効化のみ**行い、ロゴアップロード実装は Unit Org-2 で行う。

---

## 追加設定ファイル

| ファイル | 内容 | 変更種別 |
|--------|------|--------|
| `firestore.rules` | organizationId + カスタムクレームベースに全面改訂 | 変更 |
| `firestore.indexes.json` | 複合インデックス4件定義 | 新規 |
| `storage.rules` | ロゴ画像アクセス制御ルール追加 | 変更 |

### storage.rules（追加分）

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 組織ロゴ: 自組織の admin のみ書き込み可。自組織メンバーは読み取り可。
    match /organizations/{orgId}/logo {
      allow read: if request.auth != null
                  && request.auth.token.organizationId == orgId;
      allow write: if request.auth != null
                   && request.auth.token.organizationId == orgId
                   && request.auth.token.role == 'admin';
    }
  }
}
```

---

## 環境変数（追加なし）

Unit Org-1 では既存の環境変数で対応可能。追加の環境変数は不要。

---

## セキュリティ境界（更新）

```
[ブラウザ]
    ↓ /api/v1/* → proxy
[Express API :3001]
    ├── authMiddleware（Firebase ID トークン検証）
    ├── orgMiddleware（organizationId 解決）  ← 追加
    ├── roleMiddleware（role 確認）
    └── Firebase Admin SDK
            ├── Firestore（organizationId フィルタ必須）  ← 強化
            ├── Auth（setCustomUserClaims）               ← 追加
            └── Storage（ロゴアップロード）               ← 追加（Unit Org-2 実装）

[Firestore Security Rules]
    ├── organizations/{orgId}: カスタムクレーム organizationId 一致のみ read 可
    └── employees/{id}: カスタムクレーム organizationId 一致のみ read 可
```

---

## DBリセット手順（開発環境）

```bash
# 既存データ削除 + 新スキーマで再構築
cd server
npx tsx src/scripts/reset-db.ts
```

`reset-db.ts` の処理:
1. `employees` コレクションの全ドキュメント削除
2. `organizations` コレクションの全ドキュメント削除（存在する場合）
3. Firebase Auth のカスタムクレームをクリア（任意）

---

## デプロイメント（変更なし）

Unit Org-1 の変更はすべてローカル開発環境で完結。
Firestore・Storage の設定変更のみ Firebase コンソール / CLI で反映する。

```bash
# Security Rules のデプロイ
firebase deploy --only firestore:rules
firebase deploy --only storage

# インデックスのデプロイ
firebase deploy --only firestore:indexes
```

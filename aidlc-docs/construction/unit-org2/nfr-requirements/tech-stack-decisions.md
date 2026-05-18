# Tech Stack Decisions — Unit Org-2: Auth Flow & Onboarding

## 新規パッケージ

| パッケージ | 用途 | インストール先 |
|-----------|------|-------------|
| `firebase/storage` | Firebase Storage クライアント SDK（ロゴアップロード） | フロントエンド（既存 firebase パッケージに含まれる） |

追加インストール不要。`firebase` パッケージの `firebase/storage` モジュールを使用する。

## Firebase Storage 初期化

```typescript
// src/lib/firebase.ts に追加
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);
```

## ロゴアップロード実装

```typescript
// Firebase Storage へのアップロード（LogoUpload コンポーネント or CreateOrgPage）
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../lib/firebase';

const logoRef = ref(storage, `organizations/${orgId}/logo`);
await uploadBytes(logoRef, file);
const logoUrl = await getDownloadURL(logoRef);
```

## NFR-ORG2-01 追加: link-uid uid 一致検証

`POST /api/v1/employees/link-uid` のサーバーサイドで、
リクエストボディの `uid` と認証トークンの `uid` が一致することを検証する。

```typescript
// server/src/index.ts の link-uid ハンドラ内
if (uid !== req.user!.uid) {
  res.status(403).json({ error: { code: 'FORBIDDEN', message: '不正なリクエストです' } });
  return;
}
```

## NFR-ORG2-01 追加: 組織作成の重複防止

```typescript
// server/src/services/OrganizationService.ts の create() 先頭に追加
// カスタムクレームに organizationId が既にある場合は拒否
// （authMiddleware → req.user.organizationId で確認）
```

実装上は `OrganizationService.create()` ではなく、`organizations.ts` ルートの POST ハンドラで
`req.user.organizationId` が存在する場合に 409 を返す。

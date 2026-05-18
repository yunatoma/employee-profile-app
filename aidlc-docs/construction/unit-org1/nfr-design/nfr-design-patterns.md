# NFR Design Patterns — Unit Org-1: Organization Foundation

Unit 2 の既存パターン（SP-01〜SP-04, EH-01〜EH-02, PP-01, CP-01）をベースに、
組織概念追加で必要な新規パターンを定義する。

---

## セキュリティパターン（追加・変更）

### SP-05: カスタムクレームによる organizationId 解決パターン

Firebase Auth カスタムクレームを使って、Security Rules 内で `organizationId` を参照する。

**カスタムクレーム設定（Node.js サーバーサイド）:**
```
組織作成完了時 または uid 紐付け完了時:
  admin.auth().setCustomUserClaims(uid, {
    organizationId: orgId,
    role: 'admin' | 'member'
  })
  → 完了後に res.json({ forceTokenRefresh: true }) を返す

フロントエンド側:
  forceTokenRefresh: true を受け取ったら
  await firebase.auth().currentUser.getIdToken(true) でトークン強制リフレッシュ
  → 以降のリクエストに新しいクレームが含まれる
```

**Security Rules での参照:**
```javascript
// request.auth.token.organizationId でカスタムクレームを参照
function getUserOrgId() {
  return request.auth.token.organizationId;
}
```

---

### SP-06: organizationId ベース Firestore Security Rules パターン

全面改訂した `firestore.rules` の設計。

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ヘルパー関数
    function isSignedIn() {
      return request.auth != null;
    }

    function getUserOrgId() {
      return request.auth.token.organizationId;
    }

    function getUserRole() {
      return request.auth.token.role;
    }

    function isAdmin() {
      return isSignedIn() && getUserRole() == 'admin';
    }

    function isSameOrg(orgId) {
      return isSignedIn() && getUserOrgId() == orgId;
    }

    function orgIdUnchanged() {
      return request.resource.data.organizationId == resource.data.organizationId;
    }

    // organizations コレクション
    match /organizations/{orgId} {
      // 自組織のみ読み取り可能
      allow read: if isSameOrg(orgId);
      // 作成: サインイン済みユーザー（organizationId は新規作成のため未検証）
      // 実際の作成は Node.js Admin SDK 経由のみ許可（クライアント直書き禁止）
      allow write: if false; // 全て Node.js Admin SDK 経由
    }

    // employees コレクション
    match /employees/{employeeId} {
      // 自組織のみ読み取り可能
      allow read: if isSignedIn() && isSameOrg(resource.data.organizationId);
      // 全書き込みは Node.js Admin SDK 経由のみ
      allow write: if false;
    }
  }
}
```

**重要設計決定**: クライアントからの Firestore 直接書き込みを全面禁止し、
すべての書き込みを Node.js API（Admin SDK）経由に統一する。
これにより Security Rules はシンプルに「読み取り制御のみ」に集中できる。

---

### SP-07: uid 紐付けトランザクションパターン

競合・二重紐付けを防ぐ Firestore トランザクション設計。

```
Node.js: EmployeeService.linkUid(email, uid, displayName)

Firestore トランザクション:
  1. employees コレクションで email == email のドキュメントを検索
     → 存在しない → エラー: NOT_FOUND
     → 複数存在 → エラー: INTERNAL_ERROR（データ不整合）

  2. 見つかった employee ドキュメントを読み取り
     → uid が null でない かつ uid != 引数の uid → エラー: CONFLICT（別 uid で既に紐付済み）
     → uid == 引数の uid → 既に紐付済み（冪等性: そのまま成功を返す）
     → uid が null → 続行

  3. uid の一意性チェック
     → employees コレクションで uid == 引数の uid のドキュメント検索
     → 存在する（別の employee）→ エラー: CONFLICT（uid が既に別社員に使用済み）

  4. employee ドキュメント更新
     { uid: uid, status: 'active', updatedAt: now() }

  5. カスタムクレーム設定
     admin.auth().setCustomUserClaims(uid, {
       organizationId: employee.organizationId,
       role: employee.role
     })

  6. トランザクション完了 → { employee, forceTokenRefresh: true } を返す
```

---

### SP-08: organizationId 変更禁止パターン（サーバーサイド）

`EmployeeService.update()` および `OrganizationService` での不変フィールド保護。

```
EmployeeService.update(employeeId, updateData, requestingUid):
  1. 既存ドキュメントを取得
  2. updateData に organizationId が含まれている場合 → 400 VALIDATION_ERROR で拒否
  3. 更新データから organizationId を除外してから Firestore に書き込む
```

---

## データ整合性パターン

### DI-01: 組織作成アトミックパターン

```
OrganizationService.create(name, logoUrl, creatorUid):

Firestore トランザクション:
  1. 新規 orgId を生成（doc().id）
  2. organizations/{orgId} を作成
     { id: orgId, name, logoUrl, ownerId: creatorUid, createdAt, updatedAt }
  3. employees/{newEmployeeId} を作成（作成者自身）
     { uid: creatorUid, status: 'active', role: 'admin',
       organizationId: orgId, createdAt, updatedAt, ... }
  4. カスタムクレーム設定
     admin.auth().setCustomUserClaims(creatorUid, {
       organizationId: orgId, role: 'admin'
     })

→ いずれかが失敗した場合はトランザクション全体をロールバック
```

---

### DI-02: admin 最低1名保証パターン

```
EmployeeService.update(employeeId, { role: 'member' }, requestingUid):

  1. 対象 employee の現在の role を確認
     → 'admin' でない → ロールチェック不要、続行

  2. 対象が 'admin' の場合:
     → organizationId 内の admin 数をカウント
        employees where organizationId == oid AND role == 'admin'
     → count == 1 → エラー: 403 FORBIDDEN "組織には最低1名の管理者が必要です"
     → count >= 2 → 続行

EmployeeService.delete(employeeId, requestingUid):
  → 同様のチェックを適用
```

---

## パフォーマンスパターン（追加）

### PP-02: organizationId による Firestore クエリ最適化

```
全社員取得クエリ:
  firestore.collection('employees')
    .where('organizationId', '==', orgId)
    .orderBy('joinedAt', 'desc')

→ firestore.indexes.json の複合インデックス（organizationId + joinedAt）で高速化
→ 自組織の社員のみ返るためデータ漏洩リスクなし
```

---

### PP-03: 組織情報キャッシュパターン

```
organizationSlice.currentOrganization にキャッシュ:
  - ログイン成功時に一度だけ fetchOrganization() を dispatch
  - アプリ全体で Redux から参照（毎回 API 呼び出し不要）
  - ログアウト時に clearOrganization() で状態クリア
```

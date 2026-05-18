# Business Logic Model — Unit Org-1: Organization Foundation

## BL-ORG-01: 組織作成ロジック

**トリガー**: `CreateOrgPage` でフォーム送信（Unit Org-2 で UI 実装、本ユニットで API/Repository を実装）

```
入力: { name: string, logoUrl?: string, currentUser: FirebaseUser }

1. バリデーション
   - name が空白のみ → エラー "組織名を入力してください"
   - name が 100文字超 → エラー "組織名は100文字以内で入力してください"

2. Firestore トランザクション開始
   a. organizations/{newOrgId} を作成
      { id, name, logoUrl, ownerId: currentUser.uid, createdAt, updatedAt }

   b. employees/{newEmployeeId} を作成（作成者自身）
      { ..., uid: currentUser.uid, status: 'active', role: 'admin',
        organizationId: newOrgId, createdAt, updatedAt }

3. トランザクション完了
   → organizationSlice に currentOrganization をセット
   → ダッシュボードへリダイレクト（Unit Org-2 で実装）
```

---

## BL-ORG-02: uid 紐付けロジック（事前登録済みユーザーのサインアップ）

**トリガー**: Firebase Auth サインイン後、メールが employees コレクションに存在する場合（Unit Org-2 で呼び出し元を実装）

```
入力: { email: string, uid: string, displayName: string, photoURL?: string }

1. employees コレクションで email 検索（organizationId 不問）
   - 存在しない → BL-ORG-01（新規組織作成）へ

2. 見つかった employee ドキュメントの検証
   - uid が既に設定済み（null でない）かつ 異なる uid → エラー（不正な紐付け試行）
   - uid が既に設定済みで 同じ uid → 通常のログイン（すでに紐付済み）

3. uid: null の場合（初回サインアップ）
   Firestore トランザクション開始
   a. uid の一意性チェック（他の employees に同 uid が存在しないか確認）
   b. employee ドキュメント更新
      { uid: uid, status: 'active', updatedAt: now() }
   c. トランザクション完了

4. organizations/{employee.organizationId} を取得
   → organizationSlice に currentOrganization をセット
   → ダッシュボードへリダイレクト
```

---

## BL-ORG-03: 社員取得フィルタロジック

**既存 employeeRepository の全取得メソッドに適用**

```
// Node.js EmployeeService（全取得メソッド共通）
async getAll(requestingUid: string): Promise<Employee[]> {
  1. requestingUid から organizationId を解決
     - employees コレクションで uid == requestingUid のドキュメントを検索
     - 見つからない → 401 Unauthorized

  2. Firestore クエリ
     employees コレクション
       where organizationId == resolvedOrgId
       （orderBy joinedAt desc 等は既存ロジック維持）

  3. 結果返却
}
```

---

## BL-ORG-04: organizationId 解決ロジック（サーバーサイド共通処理）

**全 API エンドポイントで使用するミドルウェア相当の処理**

```
入力: request.auth.uid（authMiddleware で検証済み）

1. employees コレクションで uid == request.auth.uid を検索
2. 見つからない → 403 Forbidden（組織未所属）
3. employee.organizationId を request.organizationId にセット（以降のサービス層で使用）

実装: authMiddleware の拡張 or 専用 orgMiddleware として実装
```

---

## BL-ORG-05: 組織内メール重複チェック

**社員新規作成時（通常登録・事前登録）に適用**

```
入力: { email: string, organizationId: string }

1. employees コレクションで
   where organizationId == organizationId
   AND   email == email
   のドキュメントを検索

2. 存在する → エラー "このメールアドレスはすでに登録されています"
3. 存在しない → 続行
```

---

## BL-ORG-06: admin 最低1名保証チェック

**admin ロールの変更・削除時に適用**

```
入力: { employeeId: string, organizationId: string, newRole?: 'member' }

1. organizationId 内の admin ロール社員数を取得
   employees コレクション where organizationId == oid AND role == 'admin'

2. 対象が admin かつ変更後に admin が 0 人になる
   → エラー "組織には最低1名の管理者が必要です"

3. 問題なければ続行
```

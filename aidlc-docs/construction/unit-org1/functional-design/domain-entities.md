# Domain Entities — Unit Org-1: Organization Foundation

## 新規エンティティ

### Organization

Firestore コレクション: `organizations/{orgId}`

```typescript
type Organization = {
  id: string;           // Firestore ドキュメント ID（自動生成）
  name: string;         // 必須・組織名
  logoUrl?: string;     // Firebase Storage URL（任意）
  ownerId: string;      // 組織作成者の Firebase Auth UID（管理者）
  createdAt: string;    // ISO 8601
  updatedAt: string;    // ISO 8601
};
```

**制約:**
- `name`: 1〜100文字、空白のみ不可
- `ownerId`: 実在する Firebase Auth UID であること
- `logoUrl`: Firebase Storage の `/organizations/{orgId}/logo` パスのURL

---

## 変更エンティティ

### Employee（Unit 2 からの変更点）

Firestore コレクション: `employees/{id}`

```typescript
type EmployeeStatus = 'active' | 'leave' | 'retired' | 'pending'; // 'pending' 追加

type Employee = {
  // ... Unit 1/2 の全フィールド（変更なし）

  // 変更フィールド:
  uid: string | null;           // 変更: null = まだサインアップしていない（pending）
  status: EmployeeStatus;       // 変更: 'pending' 追加

  // 追加フィールド:
  organizationId: string;       // 追加: 所属組織 ID（必須）
};
```

**pending ステータスの意味:**
- 管理者が事前登録したが、本人がまだ Google サインアップしていない状態
- `uid: null` + `status: 'pending'` の組み合わせで識別する
- サインアップ完了後: `uid` に Auth UID が設定され、`status: 'active'` に変更される

---

## フロントエンド State

### OrganizationState（新規）

```typescript
type OrganizationState = {
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
};
```

### RootState（Unit Org-1 後）

```typescript
type RootState = {
  employees: EmployeeState;        // Unit 1/2 から継続
  auth: AuthState;                 // Unit 2 から継続
  organization: OrganizationState; // 新規追加
};
```

---

## Node.js API エンドポイント定義（追加）

### Organizations エンドポイント

| メソッド | パス | 認証 | ロール | 説明 |
|--------|------|------|--------|------|
| POST | /api/v1/organizations | 必須 | - | 組織新規作成（自分が admin になる） |
| GET | /api/v1/organizations/:orgId | 必須 | admin, user（自組織のみ） | 組織情報取得 |
| PUT | /api/v1/organizations/:orgId | 必須 | admin（自組織のみ） | 組織名・ロゴ更新 |

### Employees エンドポイント（変更）

| メソッド | パス | 認証 | ロール | 説明（変更点） |
|--------|------|------|--------|------|
| GET | /api/v1/employees | 必須 | admin, user | 変更: 自組織のみ返す（`organizationId` フィルタ必須） |
| POST | /api/v1/employees | 必須 | admin | 変更: `organizationId` を自動付与 |
| PUT | /api/v1/employees/:id | 必須 | admin, user(自分のみ) | 変更: 自組織チェック追加 |
| DELETE | /api/v1/employees/:id | 必須 | admin | 変更: 自組織チェック追加 |
| POST | /api/v1/employees/link-uid | 必須（新規サインアップ直後） | - | uid 紐付け（email → uid + status更新） |

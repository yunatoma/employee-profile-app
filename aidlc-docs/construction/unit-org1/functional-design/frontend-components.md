# Frontend Components — Unit Org-1: Organization Foundation

Unit Org-1 はデータ基盤・Security Rules・Redux state の確立が主目的。
UI コンポーネントは Unit Org-2/3 で実装するため、本ユニットのフロントエンド変更は型定義・Redux slice・Repository のみ。

---

## 変更: Employee 型（`src/features/employees/types/employee.ts`）

```typescript
// 変更前
type EmployeeStatus = 'active' | 'leave' | 'retired';

type Employee = {
  // ...
  uid: string;
  status: EmployeeStatus;
};

// 変更後
type EmployeeStatus = 'active' | 'leave' | 'retired' | 'pending'; // 'pending' 追加

type Employee = {
  // ...既存フィールド全て維持...
  uid: string | null;           // null = 事前登録済み・未サインアップ
  status: EmployeeStatus;       // 'pending' 追加
  organizationId: string;       // 新規追加（必須）
};
```

---

## 新規: Organization 型（`src/features/organizations/types/organization.ts`）

```typescript
type Organization = {
  id: string;
  name: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 新規: organizationRepository（`src/features/organizations/api/organizationRepository.ts`）

```typescript
interface IOrganizationRepository {
  create(data: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organization>;
  getById(orgId: string): Promise<Organization | null>;
  update(orgId: string, data: Partial<Pick<Organization, 'name' | 'logoUrl'>>): Promise<Organization>;
}

// 実装: ApiOrganizationRepository（Node.js API クライアント）
// /api/v1/organizations エンドポイントを呼び出す
```

---

## 新規: organizationSlice（`src/features/organizations/slices/organizationSlice.ts`）

```typescript
// State
type OrganizationState = {
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
};

// AsyncThunks
// - fetchOrganization(orgId: string)
// - createOrganization(data: { name: string; logoUrl?: string })
// - updateOrganization(data: { orgId: string; name?: string; logoUrl?: string })

// Reducers
// - setCurrentOrganization(org: Organization)
// - clearOrganization()
```

---

## 変更: employeeRepository（`src/features/employees/api/employeeRepository.ts`）

変更点:
- すべての取得メソッドは `organizationId` フィルタを持つ API を呼び出す（サーバーサイドでフィルタ済みのデータが返る）
- `linkUid(email: string, uid: string)` メソッドを追加

```typescript
// 追加メソッド
linkUid(email: string, uid: string): Promise<Employee>;
// POST /api/v1/employees/link-uid
// { email, uid } を送信 → uid 紐付け + status: 'active' に更新
```

---

## 変更: Redux Store（`src/app/store.ts`）

```typescript
// 追加
import { organizationReducer } from '../features/organizations/slices/organizationSlice';

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    auth: authReducer,
    organization: organizationReducer,  // 追加
    // ...
  },
});
```

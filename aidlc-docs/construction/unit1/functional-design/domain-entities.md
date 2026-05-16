# Domain Entities — Unit 1: Frontend MVP

## Employee（既存・変更なし）

Phase 1 では既存の型定義を維持する。
Phase 2 で `uid`, `role`, `createdAt`, `updatedAt` を追加予定。

```typescript
type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern';
type EmployeeStatus = 'active' | 'leave' | 'retired';

type Employee = {
  id: string;           // UUID（crypto.randomUUID()で生成）
  name: string;         // 必須
  email: string;        // 必須・形式チェック・重複チェック
  department: string;   // 必須（Phase 1: 自由入力 / Phase 2: マスター参照）
  position: string;     // 必須
  employmentType: EmploymentType; // 必須
  status: EmployeeStatus;         // 必須
  joinedAt: string;     // 必須・YYYY-MM-DD 形式
  skills: string[];     // 任意（Phase 1: 自由入力 / Phase 2: マスター参照）
  profile: string;      // 任意
  avatarUrl?: string;   // 任意
};
```

## SearchCondition（既存・変更なし）

```typescript
type SearchCondition = {
  keyword: string;
  department: string;
  status: string;       // 'all' | 'active' | 'leave' | 'retired'（Phase 1 で 'retired' を追加）
  skill: string;
  showRetired: boolean; // 退職者表示フラグ（新規追加）
};
```

**注記**: `showRetired` フラグを追加し、デフォルト `false`。管理者のみ `true` に変更可能（Phase 2 で権限チェック追加）。

## DashboardStats（新規）

```typescript
type DashboardStats = {
  totalActive: number;        // 在籍中（active + leave）の総人数
  byDepartment: Record<string, number>; // 部署別在籍人数
  byStatus: {
    active: number;
    leave: number;
  };
  computedAt: string;         // 集計時刻（表示用）
  note: string;               // "在籍中の社員のみを集計しています"
};
```

## EmployeeFormValues（新規）

フォーム内部で扱う値の型（Employee と微妙に異なる場合のため分離）

```typescript
type EmployeeFormValues = {
  name: string;
  email: string;
  department: string;
  position: string;
  employmentType: EmploymentType | '';
  status: EmployeeStatus | '';
  joinedAt: string;           // YYYY-MM-DD
  skills: string[];
  profile: string;
  avatarUrl: string;
};

type EmployeeFormErrors = Partial<Record<keyof EmployeeFormValues, string>>;
```

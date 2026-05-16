# Domain Entities — Unit 2: Firebase Integration

## 新規エンティティ

### User（認証・権限管理）

Firestore コレクション: `users/{uid}`

```typescript
type UserRole = 'admin' | 'user';

type UserDocument = {
  uid: string;          // Firebase Auth の UID
  email: string;        // Google アカウントのメール
  displayName: string;  // Google アカウントの表示名
  role: UserRole;       // 'admin' | 'user'
  createdAt: string;    // ISO 8601
};
```

**ロール定義:**
| ロール | 権限 |
|--------|------|
| admin  | 全社員の CRUD、退職処理、完全削除、自分のプロフィール編集 |
| user   | 自分のプロフィールの閲覧・編集のみ |

---

## 定数（コード内で管理）

### DEPARTMENTS（部署マスター）

```typescript
export const DEPARTMENTS = [
  '開発部',
  '人事部',
  '営業部',
  '総務部',
  'マーケティング部',
  'カスタマーサポート部',
] as const;

export type Department = typeof DEPARTMENTS[number];
```

### SKILLS（スキルマスター）

```typescript
export const SKILLS = [
  'TypeScript', 'JavaScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Java', 'Go',
  'Firebase', 'AWS', 'GCP', 'Docker',
  'SQL', 'PostgreSQL', 'MySQL',
  'Git', 'Figma', 'Excel',
] as const;

export type Skill = typeof SKILLS[number];
```

---

## 変更エンティティ

### Employee（Unit 1 からの変更点）

Firestore コレクション: `employees/{id}`

```typescript
// Unit 1 からの変更点のみ記載
type Employee = {
  // ... Unit 1 の全フィールド（変更なし）
  skills: string[];   // SKILLS 定数からの選択値を保存（型は string[] のまま）
  // 追加フィールド:
  createdAt: string;  // ISO 8601（Firestore 登録時刻）
  updatedAt: string;  // ISO 8601（最終更新時刻）
  createdBy: string;  // 登録者の uid
};
```

---

## フロントエンド State

### AuthState（新規）

```typescript
type AuthState = {
  user: {
    uid: string;
    email: string;
    displayName: string;
    role: UserRole;
  } | null;
  loading: boolean;
  error: string | null;
};
```

### RootState（Unit 2 後）

```typescript
type RootState = {
  employees: EmployeeState;  // Unit 1 から継続
  auth: AuthState;           // 新規
};
```

---

## Node.js API エンドポイント定義

| メソッド | パス | 認証 | ロール | 説明 |
|--------|------|------|--------|------|
| GET | /api/v1/employees | 必須 | admin, user | 一覧取得（user は自分のみ） |
| GET | /api/v1/employees/:id | 必須 | admin, user | 詳細取得 |
| POST | /api/v1/employees | 必須 | admin | 新規登録 |
| PUT | /api/v1/employees/:id | 必須 | admin, user(自分のみ) | 更新 |
| DELETE | /api/v1/employees/:id | 必須 | admin | 完全削除 |
| POST | /api/v1/admin/setup | なし | - | 初回管理者セットアップ |

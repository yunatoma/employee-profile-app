# Component Methods

詳細なビジネスロジックは CONSTRUCTION フェーズの Functional Design で定義します。
ここでは主要メソッドのシグネチャと高レベルの目的を示します。

---

## フロントエンド フィーチャーモジュール

### employees スライス (employeeSlice)

| メソッド / Action          | 入力                    | 出力              | 説明                         |
|--------------------------|------------------------|------------------|------------------------------|
| fetchEmployees()         | -                      | Promise<Employee[]> | 全社員一覧を取得する           |
| fetchEmployeeById(id)    | id: string             | Promise<Employee> | 指定 ID の社員を取得する       |
| createEmployee(data)     | EmployeeInput          | Promise<Employee> | 新規社員を作成する             |
| updateEmployee(data)     | Employee               | Promise<Employee> | 社員情報を更新する             |
| deleteEmployee(id)       | id: string             | Promise<void>    | 社員を削除する                 |
| setSearchCondition(cond) | Partial<SearchCondition> | void           | 検索条件を更新する             |
| clearSearchCondition()   | -                      | void             | 検索条件をリセットする          |

### auth スライス (authSlice) — Phase 2

| メソッド / Action          | 入力              | 出力                | 説明                              |
|--------------------------|-----------------|--------------------|------------------------------------|
| signInWithGoogle()       | -               | Promise<User>      | Google 認証でサインインする          |
| signOut()                | -               | Promise<void>      | サインアウトする                    |
| watchAuthState()         | -               | void               | Firebase Auth 状態変化を監視する    |
| setCurrentUser(user)     | User / null     | void               | 現在のユーザー情報を Store に保存する|

### departments スライス (departmentSlice) — Phase 2

| メソッド / Action          | 入力              | 出力                   | 説明               |
|--------------------------|-----------------|----------------------|--------------------|
| fetchDepartments()       | -               | Promise<Department[]>  | 全部署を取得する    |
| createDepartment(data)   | DepartmentInput | Promise<Department>    | 部署を作成する      |
| updateDepartment(data)   | Department      | Promise<Department>    | 部署を更新する      |
| deleteDepartment(id)     | id: string      | Promise<void>          | 部署を削除する      |

### skills スライス (skillSlice) — Phase 2

| メソッド / Action      | 入力           | 出力             | 説明               |
|----------------------|--------------|----------------|--------------------|
| fetchSkills()        | -            | Promise<Skill[]>| 全スキルを取得する  |
| createSkill(data)    | SkillInput   | Promise<Skill>  | スキルを作成する    |
| updateSkill(data)    | Skill        | Promise<Skill>  | スキルを更新する    |
| deleteSkill(id)      | id: string   | Promise<void>   | スキルを削除する    |

### search スライス (searchSlice) — Phase 3

| メソッド / Action      | 入力              | 出力                 | 説明                         |
|----------------------|-----------------|--------------------|-----------------------------|
| searchEmployees(q)   | SearchQuery     | Promise<Employee[]>  | OpenSearch で社員を検索する  |
| clearSearchResults() | -               | void               | 検索結果をリセットする         |

---

## Repository インターフェース

### employeeRepository

```typescript
interface IEmployeeRepository {
  findAll(): Promise<Employee[]>;
  findById(id: string): Promise<Employee | undefined>;
  create(data: EmployeeInput): Promise<Employee>;
  update(employee: Employee): Promise<Employee>;
  delete(id: string): Promise<void>;
}
```

### departmentRepository — Phase 2

```typescript
interface IDepartmentRepository {
  findAll(): Promise<Department[]>;
  findById(id: string): Promise<Department | undefined>;
  create(data: DepartmentInput): Promise<Department>;
  update(department: Department): Promise<Department>;
  delete(id: string): Promise<void>;
}
```

### skillRepository — Phase 2

```typescript
interface ISkillRepository {
  findAll(): Promise<Skill[]>;
  findById(id: string): Promise<Skill | undefined>;
  create(data: SkillInput): Promise<Skill>;
  update(skill: Skill): Promise<Skill>;
  delete(id: string): Promise<void>;
}
```

### searchRepository — Phase 3

```typescript
interface ISearchRepository {
  search(query: SearchQuery): Promise<SearchResult[]>;
  indexEmployee(employee: Employee): Promise<void>;
  deleteIndex(id: string): Promise<void>;
}
```

---

## Node.js バックエンド メソッド — Phase 2

### EmployeeService

| メソッド                    | 入力                  | 出力              | 説明                              |
|--------------------------|---------------------|-----------------|----------------------------------|
| getAll(uid, role)        | uid, role           | Employee[]      | 認証済みユーザーの権限で全社員を取得|
| getById(id, uid, role)   | id, uid, role       | Employee        | 社員詳細を取得（権限チェック付き）   |
| create(data, role)       | EmployeeInput, role | Employee        | 社員を作成（管理者のみ）            |
| update(id, data, uid, role)| id, data, uid, role| Employee       | 社員を更新（自分 or 管理者のみ）    |
| delete(id, role)         | id, role            | void            | 社員を削除（管理者のみ）            |

### SearchSyncService — Phase 3

| メソッド                  | 入力         | 出力  | 説明                             |
|------------------------|------------|------|----------------------------------|
| syncOnCreate(employee) | Employee   | void | 社員作成時に OpenSearch にインデックス|
| syncOnUpdate(employee) | Employee   | void | 社員更新時に OpenSearch を更新      |
| syncOnDelete(id)       | id: string | void | 社員削除時に OpenSearch から削除    |

---

## フロントエンド ユーティリティ関数

### filterEmployees (Phase 1 - クライアントサイドフィルタ)

```typescript
function filterEmployees(
  employees: Employee[],
  condition: SearchCondition
): Employee[]
```

### employeeLabels (Phase 1)

```typescript
function getStatusLabel(status: EmployeeStatus): string
function getEmploymentTypeLabel(type: EmploymentType): string
```

### permissions (Phase 2)

```typescript
function canEdit(currentUser: User, targetEmployee: Employee): boolean
function canDelete(currentUser: User): boolean
function isAdmin(user: User): boolean
```

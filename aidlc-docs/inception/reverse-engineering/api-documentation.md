# API Documentation

## External APIs (現在)

現時点では外部 API への接続はなし。すべてインメモリのモックデータで動作。

## Internal APIs (employeeRepository)

### employeeRepository.findAll()
- **シグネチャ**: `findAll(): Promise<Employee[]>`
- **説明**: 全社員データを取得する
- **戻り値**: `Employee[]`

### employeeRepository.findById()
- **シグネチャ**: `findById(id: string): Promise<Employee | undefined>`
- **説明**: 指定 ID の社員を取得する
- **戻り値**: `Employee | undefined`

### employeeRepository.create()
- **シグネチャ**: `create(employee: Employee): Promise<Employee>`
- **説明**: 新規社員を作成する
- **戻り値**: 作成された `Employee`

### employeeRepository.update()
- **シグネチャ**: `update(employee: Employee): Promise<Employee>`
- **説明**: 既存社員情報を更新する
- **戻り値**: 更新された `Employee`

### employeeRepository.delete()
- **シグネチャ**: `delete(id: string): Promise<string>`
- **説明**: 指定 ID の社員を削除する
- **戻り値**: 削除された `id: string`

## Redux Actions (AsyncThunk)

| Action                      | 引数            | 戻り値       |
|-----------------------------|--------------|------------|
| fetchEmployees()            | なし           | Employee[] |
| fetchEmployeeById(id)       | id: string   | Employee / undefined |
| createEmployee(employee)    | Employee     | Employee   |
| updateEmployee(employee)    | Employee     | Employee   |
| deleteEmployee(id)          | id: string   | string (id)|

## Redux Reducers (Synchronous)

| Action                     | 引数                         | 説明                     |
|---------------------------|------------------------------|------------------------|
| setSearchCondition(partial)| Partial<SearchCondition>     | 検索条件を部分更新する     |
| clearSearchCondition()     | なし                          | 検索条件をリセットする     |

## Data Models

### Employee
```typescript
type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
  status: 'active' | 'leave' | 'retired';
  joinedAt: string; // YYYY-MM-DD
  skills: string[];
  profile: string;
  avatarUrl?: string;
};
```

### SearchCondition
```typescript
type SearchCondition = {
  keyword: string;
  department: string;
  status: string;
  skill: string;
};
```

## Future API Design (Firebase / REST)

`employeeRepository.ts` にコメントアウトされた REST 実装例が存在する:

```
GET /api/employees   -> Employee[]
```

Firebase 移行後は Firestore SDK に差し替え予定。
OpenSearch 追加時は検索専用エンドポイントを追加予定。

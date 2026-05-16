# Unit Test Execution — Unit 1: Frontend MVP

## テスト対象

| ファイル | 種別 | 内容 |
|--------|-----|------|
| `src/features/employees/utils/filterEmployees.test.ts` | PBT + 通常 | フィルタロジック（fast-check 4プロパティ） |
| `src/features/dashboard/utils/dashboardStats.test.ts` | PBT + 通常 | 統計計算（fast-check 3プロパティ） |
| `src/features/employees/utils/validateEmployeeForm.test.ts` | PBT + 境界 | フォームバリデーション（fast-check 2プロパティ + 境界テスト） |
| `src/features/employees/slices/employeeSlice.test.ts` | 単体 | Redux Slice（AsyncThunk + Reducer） |

## テスト実行

### 全テスト実行（ウォッチモード）

```bash
npm test
```

### 一回だけ実行（CI 向け）

```bash
npm run test -- --run
```

### カバレッジ付き実行

```bash
npm run test:coverage
```

カバレッジ対象:
- `src/features/employees/utils/**`
- `src/features/dashboard/utils/**`

レポート出力先: `coverage/`

## 期待されるテスト結果

| テストファイル | テスト数（目安） | 合格基準 |
|-------------|------------|--------|
| filterEmployees.test.ts | 7件 | 全件パス |
| dashboardStats.test.ts | 5件 | 全件パス |
| validateEmployeeForm.test.ts | 10件以上 | 全件パス |
| employeeSlice.test.ts | 7件 | 全件パス |

## 失敗時の対処

### PBT テストが失敗する場合
fast-check は失敗したケースのシード値を出力します：
```
Property failed after 1 tests
{ seed: XXXXXX, path: "...", endOnFailure: true }
```
同じケースを再現するには：
```bash
npm run test -- --run --reporter=verbose
```

### employeeSlice.test.ts が失敗する場合
`createAsyncThunk` の fulfilled/pending/rejected アクションの型を確認する。

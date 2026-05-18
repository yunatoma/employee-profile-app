# Unit Test Execution — Unit 1 & Unit 2

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

---

## Unit 2: Firebase Integration — テスト

### テスト対象（Unit 2 追加分）

| ファイル | 種別 | 内容 |
|--------|-----|------|
| `src/features/auth/slices/authSlice.test.ts` | 単体 | Redux auth slice（8件） |

### テスト実行（Unit 1 + Unit 2 まとめて）

```bash
# 全テスト実行
npm run test -- --run

# カバレッジ付き
npm run test:coverage
```

### 期待されるテスト結果（Unit 2 追加後）

| テストファイル | テスト数（目安） | 合格基準 |
|-------------|------------|--------|
| filterEmployees.test.ts | 7件 | 全件パス |
| dashboardStats.test.ts | 5件 | 全件パス |
| validateEmployeeForm.test.ts | 10件以上 | 全件パス |
| employeeSlice.test.ts | 7件 | 全件パス |
| authSlice.test.ts | 8件 | 全件パス |

### authSlice テストの注意点

`authService` をモック化しているため Firebase への実際の接続は不要です。
テストが失敗する場合は以下を確認してください：

```bash
# モックの設定を確認
# vi.mock('../api/authService', () => ({ ... })) が正しく定義されているか
npm run test -- --run src/features/auth/slices/authSlice.test.ts
```

---

## Unit Org-1/2/3: 組織機能 — 単体テスト

### authSlice テスト（Unit Org-2/3 変更分）

`authSlice` に `orgStatus` と `organizationId` が追加されたため、既存テストが壊れていないか確認します。

```bash
npm run test -- --run src/features/auth/slices/authSlice.test.ts
```

**追加確認ポイント:**
- `initializeAuth.fulfilled` で `orgStatus` と `organizationId` が正しくセットされる
- `signOut.fulfilled` で `orgStatus: 'no-org'` / `organizationId: undefined` にリセットされる
- `setOrgStatus('member')` アクションが正しく動作する
- `setOrganizationId(id)` アクションが正しく動作する

### StatusBadge の pending 表示確認

```bash
# ビジュアル確認: 社員一覧で pending 社員に「招待待ち」バッジが表示されること
# 自動テストは既存 employeeSlice テスト内で EmployeeStatus 型の整合性を確認
npm run test -- --run src/features/employees/slices/employeeSlice.test.ts
```

### 全テスト実行（組織機能追加後）

```bash
npm run test -- --run
```

**期待されるテスト結果（組織機能追加後）:**

| テストファイル | テスト数（目安） | 合格基準 |
|-------------|------------|--------|
| filterEmployees.test.ts | 7件 | 全件パス |
| dashboardStats.test.ts | 5件 | 全件パス |
| validateEmployeeForm.test.ts | 10件以上 | 全件パス |
| employeeSlice.test.ts | 7件 | 全件パス |
| authSlice.test.ts | 8件以上 | 全件パス |

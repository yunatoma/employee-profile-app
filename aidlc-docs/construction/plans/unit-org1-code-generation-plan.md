# Unit Org-1 Code Generation Plan

## 実装順序と依存関係

```
[Step 1] 型定義・Firebase設定ファイル（依存なし）
    ↓
[Step 2] フロントエンド: Feature層（型に依存）
    ↓
[Step 3] バックエンド: Repository層（型に依存）
    ↓
[Step 4] バックエンド: Service層（Repositoryに依存）
    ↓
[Step 5] バックエンド: Middleware・Route層（Serviceに依存）
    ↓
[Step 6] フロントエンド: Store更新・Repository更新（Step2に依存）
    ↓
[Step 7] Firebase設定デプロイ・スクリプト
```

---

## チェックリスト

### Step 1: 型定義・Firebase設定ファイル

- [x] `src/features/organizations/types/organization.ts` — Organization 型定義
- [x] `src/features/employees/types/employee.ts` — organizationId 追加・uid: null・status: 'pending' 追加
- [x] `firestore.rules` — カスタムクレームベースに全面改訂
- [x] `firestore.indexes.json` — 複合インデックス4件定義
- [x] `storage.rules` — ロゴ画像アクセス制御追加

### Step 2: フロントエンド Feature 層

- [x] `src/features/organizations/api/organizationRepository.ts`
- [x] `src/features/organizations/slices/organizationSlice.ts`

### Step 3: バックエンド Repository 層

- [x] `server/src/repositories/FirestoreOrganizationRepository.ts`
- [x] `server/src/repositories/FirestoreEmployeeRepository.ts` — organizationId・uid・role フィールド追加、findByEmail/findByUid/findAll(orgId) 追加

### Step 4: バックエンド Service 層

- [x] `server/src/services/OrganizationService.ts`
- [x] `server/src/services/EmployeeService.ts`

### Step 5: バックエンド Middleware・Route 層

- [x] `server/src/middleware/orgMiddleware.ts`
- [x] `server/src/routes/organizations.ts`
- [x] `server/src/routes/employees.ts` — organizationId パラメータ追加（link-uid は index.ts に移動）
- [x] `server/src/index.ts` — link-uid を orgMiddleware の前に直接登録（バグ修正）
- [x] `server/src/types/express.d.ts` — organizationId フィールド追加

### Step 6: フロントエンド Store・Repository 更新

- [x] `src/features/employees/api/employeeRepository.ts` — linkUid() 追加
- [x] `src/app/store.ts` — organizationReducer 追加

### Step 7: スクリプト

- [x] `server/src/scripts/reset-db.ts`

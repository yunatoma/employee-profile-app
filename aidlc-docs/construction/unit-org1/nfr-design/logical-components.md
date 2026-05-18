# Logical Components — Unit Org-1: Organization Foundation

## レイヤー構成（組織概念追加後）

```
[フロントエンド]
  organizationSlice ←→ organizationRepository (API Client)
  employeeSlice     ←→ employeeRepository (API Client, organizationId フィルタ済み)
  authSlice         ←→ authService

         ↕ HTTP (Bearer Token + organizationId クレーム)

[Node.js API サーバー]
  authMiddleware → orgMiddleware
       ↓
  OrganizationService ←→ FirestoreOrganizationRepository
  EmployeeService     ←→ FirestoreEmployeeRepository
       ↓
  Firebase Admin SDK (setCustomUserClaims)

         ↕

[Firebase]
  Firestore (organizationId + カスタムクレームで保護)
  Firebase Auth (カスタムクレーム: organizationId, role)
  Firebase Storage (ロゴ画像)
```

---

## 新規ロジカルコンポーネント

### orgMiddleware（Node.js）

**パス**: `server/src/middleware/orgMiddleware.ts`

```
責務:
  authMiddleware 実行後に呼び出す
  req.user.uid を使って employees コレクションから organizationId を解決する
  → req.user.organizationId にセット
  → 全サービス層で req.user.organizationId を使用してデータ分離を保証

処理フロー:
  employees.where('uid', '==', req.user.uid).limit(1)
    → 存在しない → 403 FORBIDDEN "組織に所属していません"
    → 存在する → req.user.organizationId = employee.organizationId
              → req.user.role = employee.role
              → next()
```

**注記**: カスタムクレームが設定済みの場合は `req.auth.token.organizationId` から直接取得できるが、
orgMiddleware で Firestore を参照することで、ロール変更等の最新情報が反映される。
パフォーマンスとのトレードオフを考慮し、カスタムクレームを優先使用し、
クレームが存在しない場合のフォールバックとして Firestore lookup を行う設計とする。

---

### FirestoreOrganizationRepository（Node.js）

**パス**: `server/src/repositories/FirestoreOrganizationRepository.ts`

```
メソッド:
  create(data: CreateOrgInput): Promise<Organization>
    → db.collection('organizations').doc() で新規 docRef 生成
    → トランザクション内で使用（OrganizationService から呼び出される）

  getById(orgId: string): Promise<Organization | null>
    → db.collection('organizations').doc(orgId).get()

  update(orgId: string, data: UpdateOrgInput): Promise<Organization>
    → db.collection('organizations').doc(orgId).update(data)
```

---

### OrganizationService（Node.js）

**パス**: `server/src/services/OrganizationService.ts`

```
メソッド:
  create(name, logoUrl, creatorUid): Promise<{ org, employee, forceTokenRefresh }>
    → DI-01 アトミックパターンを実行（Firestore トランザクション）

  getById(orgId, requestingOrgId): Promise<Organization>
    → orgId == requestingOrgId でなければ 403
    → FirestoreOrganizationRepository.getById()

  update(orgId, data, requestingOrgId, requestingRole): Promise<Organization>
    → orgId == requestingOrgId でなければ 403
    → requestingRole != 'admin' であれば 403
    → organizationId フィールドが data に含まれていれば 400
    → FirestoreOrganizationRepository.update()
```

---

### EmployeeService 変更点（Node.js）

**パス**: `server/src/services/EmployeeService.ts`（変更）

```
全メソッドに共通追加:
  - requestingOrgId パラメータを必須化
  - Firestore クエリに .where('organizationId', '==', requestingOrgId) を必須追加

新規メソッド:
  linkUid(email, uid, displayName): Promise<{ employee, forceTokenRefresh }>
    → SP-07 uid 紐付けトランザクションパターンを実行

  findByEmail(email): Promise<Employee | null>
    → organizationId 不問でメール検索（サインアップ時の組織判定用）
    → 組織横断クエリのため Admin SDK 使用
```

---

### organizationRepository（フロントエンド）

**パス**: `src/features/organizations/api/organizationRepository.ts`

```
実装: ApiOrganizationRepository（Node.js API クライアント）

メソッド:
  create(data): POST /api/v1/organizations
  getById(orgId): GET /api/v1/organizations/{orgId}
  update(orgId, data): PUT /api/v1/organizations/{orgId}
```

---

### organizationSlice（フロントエンド）

**パス**: `src/features/organizations/slices/organizationSlice.ts`

```
State:
  { currentOrganization: Organization | null, loading: boolean, error: string | null }

AsyncThunks:
  fetchOrganization(orgId) → GET /api/v1/organizations/{orgId}
  createOrganization(data) → POST /api/v1/organizations
  updateOrganization(data) → PUT /api/v1/organizations/{orgId}

同期 Actions:
  setCurrentOrganization(org)  → ログイン時に直接セット
  clearOrganization()          → ログアウト時にクリア
```

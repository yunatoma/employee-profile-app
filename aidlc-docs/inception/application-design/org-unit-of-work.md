# Unit of Work 定義 - 組織概念追加

**作成日**: 2026-05-17
**前提**: Unit 1（Frontend MVP）・Unit 2（Firebase Integration）完了済み

---

## ユニット分解方針

- **分解基準**: 依存関係と安全なデプロイ単位（データ基盤 → 認証フロー → UI）
- **進め方**: データ基盤を確立してから上位レイヤーを実装する
- **依存関係**: Org-1 → Org-2 → Org-3（直列依存）

---

## Unit Org-1: Organization Foundation（組織データ基盤）

**名称**: Organization Foundation
**目標**: Firestore スキーマ変更・Security Rules 全面改訂・Redux 組織状態の確立

### 対象ファイル

**新規作成（フロントエンド）:**
- `src/features/organizations/types/organization.ts`
- `src/features/organizations/api/organizationRepository.ts`
- `src/features/organizations/slices/organizationSlice.ts`

**変更（フロントエンド）:**
- `src/features/employees/types/employee.ts` — `organizationId`・`uid: string | null`・`status: 'pending'` 追加
- `src/features/employees/api/employeeRepository.ts` — `organizationId` フィルタ必須化・`linkUid()` 追加
- `src/app/store.ts` — `organizationSlice` 追加

**新規作成（バックエンド）:**
- `server/src/routes/organizations.ts` — `/api/v1/organizations`
- `server/src/services/OrganizationService.ts`
- `server/src/repositories/FirestoreOrganizationRepository.ts`

**変更（バックエンド）:**
- `server/src/services/EmployeeService.ts` — `organizationId` フィルタ必須化・`linkUid()` トランザクション追加
- `server/src/middleware/authMiddleware.ts` — `organizationId` 解決ロジック追加

**設定ファイル:**
- `firestore.rules` — 全面改訂（organizationId ベースのアクセス制御）
- `storage.rules` — ロゴ画像用ルール追加

### 実装順序

1. Employee 型定義更新（`organizationId`・`uid: null`・`status: 'pending'`）
2. Organization 型定義・organizationRepository 作成
3. organizationSlice 作成・store 登録
4. employeeRepository に `organizationId` フィルタ・`linkUid()` 追加
5. Node.js: OrganizationService・FirestoreOrganizationRepository 作成
6. Node.js: EmployeeService に `organizationId` フィルタ・`linkUid()` トランザクション追加
7. Node.js: organizations ルーター作成
8. Firestore Security Rules 全面改訂
9. Firebase Storage Security Rules 追加

### 完了条件
- `organizations` コレクションに CRUD できる
- `employees` コレクションへのすべてのアクセスに `organizationId` が要求される
- Firestore Security Rules で他組織データへのアクセスが拒否される
- `employees` ドキュメントに `organizationId`・`uid: null`・`status: 'pending'` が保存できる
- TypeScript エラーなし

---

## Unit Org-2: Auth Flow & Onboarding（認証・参加フロー）

**名称**: Auth Flow & Onboarding
**目標**: サインアップ後の3分岐ロジック・組織作成ウィザード・uid 自動紐付け

**前提**: Unit Org-1 完了済み（Firestore スキーマ・organizationRepository・employeeRepository 確立）

### 対象ファイル

**新規作成（フロントエンド）:**
- `src/pages/CreateOrgPage.tsx` — 組織作成ウィザード（`/onboarding/new-org`）
- `src/components/LogoUpload/LogoUpload.tsx` — Firebase Storage 画像アップロード
- `src/features/organizations/components/OrgLogoForm/OrgLogoForm.tsx`

**変更（フロントエンド）:**
- `src/features/auth/api/authService.ts` — `handlePostSignIn()` 追加（email 検索・uid 紐付け・org 判定）
- `src/features/auth/slices/authSlice.ts` — `orgStatus: 'loading' | 'member' | 'no-org'` 追加
- `src/components/ProtectedRoute/ProtectedRoute.tsx` — 3段階ガード（未ログイン→組織未所属→通過）に拡張
- `src/pages/LoginPage.tsx` — サインイン後の3分岐ロジック追加
- `src/routes/AppRoutes.tsx` — `/onboarding/new-org` ルート追加

**変更（バックエンド）:**
- `server/src/routes/employees.ts` — `POST /api/v1/employees/link-uid`（uid 紐付けエンドポイント）追加

### 実装順序

1. `authSlice` に `orgStatus` フィールド追加
2. `authService.handlePostSignIn()` 実装（email 検索 → uid 紐付け or no-org フラグ）
3. `LoginPage` の post-signin 分岐ロジック実装
4. `ProtectedRoute` を3段階ガードに拡張
5. `AppRoutes.tsx` に `/onboarding/new-org` ルート追加
6. `LogoUpload` コンポーネント実装
7. `OrgLogoForm` コンポーネント実装
8. `CreateOrgPage` 実装（組織作成 → admin employee 作成 → ダッシュボードへ）
9. Node.js: `link-uid` エンドポイント追加

### 完了条件
- 未登録メールでサインアップ → `/onboarding/new-org` にリダイレクトされる
- 組織作成ウィザードで組織名・ロゴを入力して作成できる
- 事前登録済みメールでサインアップ → uid が自動紐付けされ、status が `active` になる
- 既存ユーザーがログインすると正常にダッシュボードに遷移する
- ロゴ画像が Firebase Storage にアップロードされる

---

## Unit Org-3: Org Management UI（組織管理 UI）

**名称**: Org Management UI
**目標**: 社員事前登録・pending 状態 UI・組織設定ページ・ヘッダー組織表示

**前提**: Unit Org-2 完了済み（認証フロー・CreateOrgPage 確立）

### 対象ファイル

**新規作成（フロントエンド）:**
- `src/pages/OrgSettingsPage.tsx` — 組織設定（`/admin/organization`）

**変更（フロントエンド）:**
- `src/components/StatusBadge/StatusBadge.tsx` — `'pending'` ステータス対応追加
- `src/components/Layout/Layout.tsx` — ヘッダーに組織名・ロゴ表示追加
- `src/pages/EmployeeCreatePage.tsx` — 事前登録モード対応（管理者がメールのみで pending 作成）
- `src/features/employees/components/EmployeeForm/EmployeeForm.tsx` — `mode="preregister"` 追加
- `src/pages/EmployeeListPage.tsx` — pending 社員の "招待待ち" バッジ表示
- `src/routes/AppRoutes.tsx` — `/admin/organization` ルート追加

### 実装順序

1. `StatusBadge` に `'pending'` 対応追加
2. `EmployeeForm` に `mode="preregister"` 追加（メール・名前のみ入力）
3. `EmployeeCreatePage` に事前登録フロー追加（管理者のみ）
4. `EmployeeListPage` に pending バッジ表示追加
5. `OrgSettingsPage` 実装（組織名・ロゴ編集）
6. `Layout` ヘッダーに組織名・ロゴ表示追加
7. `AppRoutes.tsx` に `/admin/organization` ルート追加

### 完了条件
- 管理者がメールアドレスのみで社員を事前登録できる（status: 'pending'）
- 社員一覧で pending 社員に "招待待ち" バッジが表示される
- 組織設定ページで組織名・ロゴを編集できる
- ヘッダーに組織名とロゴが表示される
- TypeScript エラーなし

---

## ユニット間の依存関係

```
Unit Org-1 (データ基盤・Security Rules)
  ├─ organizations コレクション・リポジトリ
  ├─ employees スキーマ更新（organizationId・pending）
  └─ Firestore Security Rules
       |
       v
Unit Org-2 (認証・参加フロー)
  ├─ authService.handlePostSignIn()
  ├─ ProtectedRoute 3段階ガード
  └─ CreateOrgPage（組織作成ウィザード）
       |
       v
Unit Org-3 (組織管理 UI)
  ├─ 事前登録フォーム（EmployeeCreatePage 拡張）
  ├─ pending バッジ（EmployeeListPage 拡張）
  └─ OrgSettingsPage
```

---

## 既存ユニットへの影響サマリー

| 既存ユニット | 影響ファイル | 変更内容 | 対応ユニット |
|------------|-----------|--------|------------|
| Unit 1 | `StatusBadge` | `pending` 追加 | Org-3 |
| Unit 2 | `employeeRepository` | `organizationId` フィルタ・`linkUid()` | Org-1 |
| Unit 2 | `authService` / `authSlice` | post-signin 分岐・`orgStatus` | Org-2 |
| Unit 2 | `ProtectedRoute` | 3段階ガード | Org-2 |
| Unit 2 | `EmployeeService`（サーバー） | `organizationId` フィルタ | Org-1 |
| Unit 2 | `firestore.rules` | 全面改訂 | Org-1 |

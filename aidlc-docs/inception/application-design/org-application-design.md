# Application Design - 組織概念追加

**作成日**: 2026-05-17
**ベース設計**: application-design.md（既存設計を拡張）

---

## 設計方針追加

| 項目                     | 決定内容                                                              |
|------------------------|---------------------------------------------------------------------|
| 組織状態管理             | `organizationSlice` を新規追加、Redux Store に統合                    |
| 認証ガード拡張           | `ProtectedRoute` に「組織未所属」チェックを追加（3段階ガード）         |
| 事前登録識別             | `status: 'pending'` + `uid: null` で未サインアップ社員を識別           |
| uid 紐付け              | Firebase Auth サインイン直後に authService で Firestore をチェック・更新 |
| ロゴ画像管理             | Firebase Storage（`organizations/{orgId}/logo`）を使用              |
| org データアクセス       | すべてのリポジトリで `organizationId` によるフィルタを必須とする        |

---

## 追加・変更コンポーネント一覧

### 新規ページ

#### CreateOrgPage（組織作成ウィザード）
- **パス**: `src/pages/CreateOrgPage.tsx`
- **URL**: `/onboarding/new-org`
- **目的**: 初めてサインアップするユーザーが組織を作成する
- **責務**:
  - 組織名入力フォーム（必須）
  - ロゴ画像アップロード（任意）
  - `organizations` ドキュメント作成 + 自分の `employees` ドキュメント作成（role: 'admin'）
  - 完了後ダッシュボードへリダイレクト
- **表示条件**: ログイン済み + 組織未所属のユーザーのみ

#### OrgSettingsPage（組織設定）
- **パス**: `src/pages/OrgSettingsPage.tsx`
- **URL**: `/admin/organization`
- **目的**: 管理者が組織名・ロゴを編集する
- **責務**:
  - 組織名・ロゴの表示・編集フォーム
  - `organizations` ドキュメント更新
  - 管理者のみアクセス可能

---

### 変更ページ

#### LoginPage（変更）
- **変更内容**: サインイン成功後の分岐ロジックを追加
  - `uid` が employees コレクションに存在 → ダッシュボードへ（通常ログイン）
  - `email` が employees コレクションに存在（uid: null） → uid 紐付け → ダッシュボードへ
  - どちらも存在しない → `/onboarding/new-org` へ

#### EmployeeCreatePage（変更）
- **変更内容**: 事前登録モード対応
  - 管理者が「事前登録」として `email` のみ入力できるフォームモードを追加
  - 事前登録時: `uid: null`, `status: 'pending'` で作成

---

### 新規共通コンポーネント

#### LogoUpload
- **パス**: `src/components/LogoUpload/LogoUpload.tsx`
- **目的**: Firebase Storage への画像アップロード UI
- **責務**:
  - 画像ファイル選択・プレビュー表示
  - Firebase Storage へのアップロード
  - アップロード完了後に URL を返す（`onUpload(url: string)` コールバック）
- **使用箇所**: CreateOrgPage / OrgSettingsPage

#### OrgHeader（共通 Layout に統合）
- **パス**: `src/components/Layout/Layout.tsx`（変更）
- **変更内容**: ヘッダーに組織名・ロゴを表示する

---

### 変更共通コンポーネント

#### ProtectedRoute（拡張）
- **変更内容**: 3段階の認証ガードに拡張
  ```
  1. 未ログイン → /login
  2. ログイン済み + 組織未所属 → /onboarding/new-org
  3. ログイン済み + 組織所属 → 通過（ダッシュボードへ）
  ```

#### StatusBadge（拡張）
- **変更内容**: `'pending'` ステータスに対応（グレー + "未登録"ラベル）

---

### 新規フィーチャー固有コンポーネント

#### OrgLogoForm
- **パス**: `src/features/organizations/components/OrgLogoForm/OrgLogoForm.tsx`
- **目的**: 組織名 + ロゴのフォーム（CreateOrgPage / OrgSettingsPage 共用）
- **責務**:
  - 組織名入力（必須バリデーション）
  - LogoUpload コンポーネント統合
  - 送信処理（mode="create" | "edit"）

---

## 追加・変更フィーチャーモジュール

### 新規: organizations フィーチャー

```
src/features/organizations/
  +-- types/
  |   +-- organization.ts          # Organization 型定義
  +-- api/
  |   +-- organizationRepository.ts # CRUD インターフェース + Firestore 実装
  +-- slices/
      +-- organizationSlice.ts      # currentOrganization state 管理
```

#### Organization 型定義
```typescript
interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  ownerId: string;      // Firebase Auth UID of admin
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### organizationSlice State 構造
```typescript
interface OrganizationState {
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}
```

#### organizationRepository メソッド
| メソッド                         | 説明                                  |
|--------------------------------|---------------------------------------|
| `create(data)`                 | 組織ドキュメント作成                    |
| `getById(orgId)`               | 組織取得                               |
| `update(orgId, data)`          | 組織名・ロゴ URL 更新                   |

---

### 変更: employees フィーチャー

#### Employee 型変更
```typescript
interface Employee {
  // 既存フィールド...
  organizationId: string;           // 追加: 所属組織 ID
  uid: string | null;               // 変更: null = pending
  status: 'active' | 'leave' | 'retired' | 'pending';  // 変更: pending 追加
}
```

#### employeeRepository 変更
- すべての取得メソッドに `organizationId` フィルタを必須化
- `linkUid(employeeId, uid)` メソッド追加（uid 紐付け用）

---

### 変更: auth フィーチャー

#### authService 変更
- サインイン完了後に以下を順次実行するロジックを追加:
  1. Firestore で `email` 一致の employee ドキュメントを検索
  2. 見つかった場合: `uid` を紐付け + `status: 'pending' → 'active'` 更新
  3. 見つからない場合: `/onboarding/new-org` へのフラグを authSlice にセット

#### authSlice 変更
- `orgStatus: 'loading' | 'member' | 'no-org'` フィールド追加

---

## 追加ルーティング

```
AppRoutes.tsx（変更）
+-- /login                        → LoginPage（変更: 分岐ロジック追加）
+-- /onboarding/new-org           → CreateOrgPage（ログイン済み + 組織未所属のみ）
+-- <ProtectedRoute>              （変更: 3段階ガード）
    +-- <Layout>
        +-- /                     → DashboardPage
        +-- /employees            → EmployeeListPage（変更: pending 表示）
        +-- /employees/new        → EmployeeCreatePage（変更: 事前登録対応）
        +-- /employees/:id        → EmployeeDetailPage
        +-- /employees/:id/edit   → EmployeeEditPage
        +-- /admin/departments    → DepartmentAdminPage
        +-- /admin/skills         → SkillAdminPage
        +-- /admin/organization   → OrgSettingsPage（新規）
```

---

## 追加ディレクトリ構成

```
src/
+-- components/
|   +-- LogoUpload/
|       +-- LogoUpload.tsx         # 新規
+-- features/
|   +-- organizations/             # 新規フィーチャー
|   |   +-- types/
|   |   |   +-- organization.ts
|   |   +-- api/
|   |   |   +-- organizationRepository.ts
|   |   +-- slices/
|   |   |   +-- organizationSlice.ts
|   |   +-- components/
|   |       +-- OrgLogoForm/
|   |           +-- OrgLogoForm.tsx
+-- pages/
    +-- CreateOrgPage.tsx          # 新規
    +-- OrgSettingsPage.tsx        # 新規
```

---

## Node.js バックエンド 追加

### 新規ルーター
| ルーター             | パス                               | 説明                     |
|--------------------|-----------------------------------|--------------------------|
| organizationRouter | server/src/routes/organizations.ts | /api/v1/organizations    |

### 新規サービス
| サービス                | 説明                                          |
|----------------------|----------------------------------------------|
| OrganizationService  | 組織 CRUD、uid 紐付け検証、ロゴ URL 管理       |

### 新規リポジトリ
| リポジトリ                           | 説明                           |
|------------------------------------|-------------------------------|
| FirestoreOrganizationRepository    | organizations コレクション CRUD |

### 変更: EmployeeService
- すべての操作で `organizationId` フィルタを必須化
- `linkUid(email, uid)` メソッド追加（uid 紐付け・トランザクション処理）

### 変更: authMiddleware
- `organizationId` を JWT カスタムクレームから取得または employee ドキュメントから解決

---

## データフロー（組織概念追加後）

### サインアップ → 組織作成フロー
```
LoginPage
  → Firebase Auth (Google)
  → authService.handlePostSignIn(user)
  → employeeRepo.findByEmail(email) → 未存在
  → authSlice.setOrgStatus('no-org')
  → ProtectedRoute → /onboarding/new-org
  → CreateOrgPage
  → organizationRepo.create() + employeeRepo.create(admin)
  → organizationSlice.setCurrentOrg()
  → ダッシュボードへ
```

### サインアップ → 既存組織参加フロー
```
LoginPage
  → Firebase Auth (Google)
  → authService.handlePostSignIn(user)
  → employeeRepo.findByEmail(email) → 存在（uid: null）
  → employeeRepo.linkUid(employeeId, uid) ← トランザクション
  → organizationRepo.getById(employee.organizationId)
  → organizationSlice.setCurrentOrg()
  → ダッシュボードへ
```

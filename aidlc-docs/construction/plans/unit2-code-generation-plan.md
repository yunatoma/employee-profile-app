# Unit 2: Firebase Integration — Code Generation Plan

## Unit コンテキスト

- **実装内容**: Firebase Authentication + Firestore + Node.js Express API + 権限管理
- **Brownfield**: 既存ファイルを修正、不足ファイルを新規作成
- **ワークスペースルート**: `/Users/yuna/Documents/develop/employee-profile-app`

## 依存関係

- Unit 1 完了済み（フロントエンド MVP）
- Firebase プロジェクト作成済み
- `server/serviceAccountKey.json` は手動配置（コード生成対象外）

---

## チェックリスト

### グループ A: ルートファイル整備

- [x] **Step A-1**: `.claudeignore` 新規作成
- [x] **Step A-2**: `.gitignore` 修正（server エントリ追加）
- [x] **Step A-3**: `firestore.rules` 新規作成
- [x] **Step A-4**: `package.json` 修正（firebase / concurrently 追加、scripts 更新）
- [x] **Step A-5**: `.env.example` 確認済み（既存ファイルに必要項目あり）

### グループ B: バックエンド — server/ セットアップ

- [x] **Step B-1**: `server/package.json` 新規作成
- [x] **Step B-2**: `server/tsconfig.json` 新規作成
- [x] **Step B-3**: `server/.env.example` 新規作成

### グループ C: バックエンド — ミドルウェア

- [x] **Step C-1**: `server/src/middleware/authMiddleware.ts` 新規作成
- [x] **Step C-2**: `server/src/middleware/roleMiddleware.ts` 新規作成
- [x] **Step C-3**: `server/src/middleware/errorMiddleware.ts` 新規作成

### グループ D: バックエンド — Repository / Service

- [x] **Step D-1**: `server/src/repositories/FirestoreEmployeeRepository.ts` 新規作成
- [x] **Step D-2**: `server/src/services/EmployeeService.ts` 新規作成

### グループ E: バックエンド — Routes / Entry / Script

- [x] **Step E-1**: `server/src/routes/employees.ts` 新規作成
- [x] **Step E-2**: `server/src/index.ts` 新規作成
- [x] **Step E-3**: `server/src/scripts/setup-admin.ts` 新規作成

### グループ F: フロントエンド — 型・Firebase 初期化

- [x] **Step F-1**: `src/features/auth/types/user.ts` 新規作成
- [x] **Step F-2**: `src/features/employees/types/employee.ts` 修正（Employee に createdAt/updatedAt/createdBy 追加、EmployeeFormValues の skills を string[] に変更）
- [x] **Step F-3**: `src/lib/firebase.ts` 新規作成（Firebase SDK 初期化）

### グループ G: フロントエンド — Auth API / API クライアント

- [x] **Step G-1**: `src/features/auth/api/authService.ts` 新規作成
- [x] **Step G-2**: `src/features/auth/api/apiClient.ts` 新規作成
- [x] **Step G-3**: `src/features/employees/api/employeeRepository.ts` 修正（モック → API 実装）

### グループ H: フロントエンド — Redux auth

- [x] **Step H-1**: `src/features/auth/slices/authSlice.ts` 新規作成
- [x] **Step H-2**: `src/app/store.ts` 修正（authReducer 追加）

### グループ I: フロントエンド — Auth コンポーネント・ページ

- [x] **Step I-1**: `src/features/auth/components/ProtectedRoute.tsx` 新規作成
- [x] **Step I-2**: `src/pages/LoginPage.tsx` 新規作成
- [x] **Step I-3**: `src/components/layout/Layout.tsx` 修正（ログアウトボタン + ユーザー名表示）

### グループ J: フロントエンド — 権限制御・フォーム変更

- [x] **Step J-1**: `src/features/employees/components/EmployeeForm/EmployeeForm.tsx` 修正（部署ドロップダウン・スキルチェックボックス）
- [x] **Step J-2**: `src/pages/EmployeeDetailPage.tsx` 修正（権限によるボタン表示制御）
- [x] **Step J-3**: `src/pages/EmployeeCreatePage.tsx` 修正（admin のみアクセス可）
- [x] **Step J-4**: `src/pages/EmployeeEditPage.tsx` 修正（権限チェック）

### グループ K: フロントエンド — ルーティング・Vite 設定

- [x] **Step K-1**: `src/routes/AppRoutes.tsx` 修正（/login ルート + ProtectedRoute）
- [x] **Step K-2**: `vite.config.ts` 修正（proxy 設定追加）
- [x] **Step K-3**: `src/main.tsx` 修正（initializeAuth dispatch）

### グループ L: テスト

- [x] **Step L-1**: `src/features/auth/slices/authSlice.test.ts` 新規作成

---

## ファイルサマリー

### 新規作成（23ファイル）

**バックエンド**:
- `server/package.json`
- `server/tsconfig.json`
- `server/.env.example`
- `server/src/index.ts`
- `server/src/routes/employees.ts`
- `server/src/middleware/authMiddleware.ts`
- `server/src/middleware/roleMiddleware.ts`
- `server/src/middleware/errorMiddleware.ts`
- `server/src/services/EmployeeService.ts`
- `server/src/repositories/FirestoreEmployeeRepository.ts`
- `server/src/scripts/setup-admin.ts`

**フロントエンド**:
- `src/lib/firebase.ts`
- `src/features/auth/types/user.ts`
- `src/features/auth/api/authService.ts`
- `src/features/auth/api/apiClient.ts`
- `src/features/auth/slices/authSlice.ts`
- `src/features/auth/slices/authSlice.test.ts`
- `src/features/auth/components/ProtectedRoute.tsx`
- `src/pages/LoginPage.tsx`

**ルート**:
- `.claudeignore`
- `.env.example`
- `firestore.rules`

### 修正（9ファイル）

- `package.json` — deps + scripts
- `.gitignore` — server エントリ追加
- `src/app/store.ts` — authReducer 追加
- `src/routes/AppRoutes.tsx` — /login + ProtectedRoute
- `vite.config.ts` — proxy 追加
- `src/main.tsx` — initializeAuth dispatch
- `src/components/layout/Layout.tsx` — ログアウト + ユーザー名
- `src/features/employees/types/employee.ts` — フィールド追加・型変更
- `src/features/employees/api/employeeRepository.ts` — API 実装に差し替え
- `src/features/employees/components/EmployeeForm/EmployeeForm.tsx` — UI 変更
- `src/pages/EmployeeDetailPage.tsx` — 権限制御
- `src/pages/EmployeeCreatePage.tsx` — admin ガード
- `src/pages/EmployeeEditPage.tsx` — 権限チェック

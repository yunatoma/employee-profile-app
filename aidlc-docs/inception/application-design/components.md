# Components

## フロントエンド コンポーネント一覧

---

### Layout コンポーネント

#### Layout
- **パス**: `src/components/Layout/Layout.tsx`
- **目的**: 全ページ共通のヘッダー・サイドバーナビゲーションを提供する
- **責務**:
  - ヘッダー（アプリ名・ユーザー情報・ログアウト）の表示
  - サイドバーナビゲーション（ダッシュボード・社員一覧・管理メニュー）の表示
  - `<Outlet />` によるネストルートのレンダリング
- **Phase**: 1

#### ProtectedRoute
- **パス**: `src/components/ProtectedRoute/ProtectedRoute.tsx`
- **目的**: 未認証ユーザーをログイン画面にリダイレクトする認証ガード
- **責務**:
  - Firebase Auth の認証状態を確認する
  - 未認証の場合は `/login` へリダイレクト
  - ロールベースの保護（admin only ルートの制御）
- **Phase**: 2

---

### ページ コンポーネント (src/pages/)

#### DashboardPage
- **パス**: `src/pages/DashboardPage.tsx`
- **目的**: 統計サマリー（社員数・部署別・稼働状況）を表示する
- **責務**:
  - 社員の集計データを Redux Store から取得・表示する
  - StatCard・DepartmentChart コンポーネントを使って統計を可視化する
- **Phase**: 1

#### EmployeeListPage
- **パス**: `src/pages/EmployeeListPage.tsx`（既存・拡張）
- **目的**: 社員一覧テーブルを表示する（Phase 3 で検索バー統合）
- **責務**:
  - 全社員をテーブルで表示する
  - 社員詳細・登録ページへのナビゲーション
  - Phase 3: SearchBar を統合し、OpenSearch 結果をテーブルに反映する
- **Phase**: 1（拡張 Phase 3）

#### EmployeeDetailPage
- **パス**: `src/pages/EmployeeDetailPage.tsx`
- **目的**: 選択した社員の詳細プロフィールを表示する
- **責務**:
  - URL パラメータから社員 ID を取得し、詳細情報を表示する
  - 編集・削除ボタンを提供する
  - 一般社員は自分のプロフィールのみ編集ボタンを表示する
- **Phase**: 1

#### EmployeeCreatePage
- **パス**: `src/pages/EmployeeCreatePage.tsx`
- **目的**: 新規社員登録フォームを提供する
- **責務**:
  - EmployeeForm を mode="create" で表示する
  - 登録成功後に社員詳細ページへリダイレクト
  - 管理者のみアクセス可能（Phase 2）
- **Phase**: 1

#### EmployeeEditPage
- **パス**: `src/pages/EmployeeEditPage.tsx`
- **目的**: 既存社員情報の編集フォームを提供する
- **責務**:
  - EmployeeForm を mode="edit" で表示し、既存データをプリフィルする
  - 保存成功後に社員詳細ページへリダイレクト
  - 一般社員は自分のプロフィールのみ編集可能（Phase 2）
- **Phase**: 1

#### LoginPage
- **パス**: `src/pages/LoginPage.tsx`
- **目的**: Google ログインを提供する
- **責務**:
  - Firebase Auth の Google プロバイダーでサインインする
  - ログイン済みの場合はダッシュボードへリダイレクト
- **Phase**: 2

#### DepartmentAdminPage
- **パス**: `src/pages/DepartmentAdminPage.tsx`
- **目的**: 部署マスターの CRUD 管理画面
- **責務**:
  - 部署一覧の表示・追加・編集・削除
  - 管理者のみアクセス可能
- **Phase**: 2

#### SkillAdminPage
- **パス**: `src/pages/SkillAdminPage.tsx`
- **目的**: スキルマスターの CRUD 管理画面
- **責務**:
  - スキル一覧の表示・追加・編集・削除
  - 管理者のみアクセス可能
- **Phase**: 2

---

### 共通 UI コンポーネント (src/components/)

#### SkillTag
- **パス**: `src/components/SkillTag/SkillTag.tsx`
- **目的**: スキル名をバッジ形式で表示する
- **Phase**: 1

#### StatusBadge
- **パス**: `src/components/StatusBadge/StatusBadge.tsx`
- **目的**: 稼働状況（active/leave/retired）を色付きバッジで表示する
- **Phase**: 1

#### LoadingSpinner
- **パス**: `src/components/LoadingSpinner/LoadingSpinner.tsx`
- **目的**: データ読み込み中のローディング表示
- **Phase**: 1

#### ErrorMessage
- **パス**: `src/components/ErrorMessage/ErrorMessage.tsx`
- **目的**: エラーメッセージを統一フォーマットで表示する
- **Phase**: 1

#### ConfirmDialog
- **パス**: `src/components/ConfirmDialog/ConfirmDialog.tsx`
- **目的**: 削除などの破壊的操作前の確認ダイアログ
- **Phase**: 1

---

### フィーチャー固有コンポーネント (src/features/*/components/)

#### EmployeeForm
- **パス**: `src/features/employees/components/EmployeeForm/EmployeeForm.tsx`
- **目的**: 社員登録・編集で共用するフォームコンポーネント
- **責務**:
  - mode="create" | "edit" で動作を切り替える
  - 全フィールドの入力・バリデーション
  - 部署・スキルのマスター選択（Phase 2 で選択式に変更）
- **Phase**: 1

#### EmployeeTable
- **パス**: `src/features/employees/components/EmployeeTable/EmployeeTable.tsx`
- **目的**: 社員一覧のテーブル表示（EmployeeListPage から分離）
- **Phase**: 1

#### EmployeeProfile
- **パス**: `src/features/employees/components/EmployeeProfile/EmployeeProfile.tsx`
- **目的**: 社員詳細情報の表示（EmployeeDetailPage で使用）
- **Phase**: 1

#### StatCard
- **パス**: `src/features/dashboard/components/StatCard/StatCard.tsx`
- **目的**: 統計値（数値 + ラベル）を表示するカード
- **Phase**: 1

#### DepartmentChart
- **パス**: `src/features/dashboard/components/DepartmentChart/DepartmentChart.tsx`
- **目的**: 部署別社員数の可視化
- **Phase**: 1

---

### フィーチャーモジュール (src/features/)

| フィーチャー   | パス                        | Phase | 概要                        |
|-------------|---------------------------|-------|-----------------------------|
| employees   | src/features/employees/   | 1     | 社員 CRUD・状態管理（既存拡張）|
| dashboard   | src/features/dashboard/   | 1     | 統計集計・ダッシュボード       |
| auth        | src/features/auth/        | 2     | Firebase Auth 認証・ユーザー管理 |
| departments | src/features/departments/ | 2     | 部署マスター                  |
| skills      | src/features/skills/      | 2     | スキルマスター                |
| search      | src/features/search/      | 3     | OpenSearch 検索               |

---

## Node.js バックエンド コンポーネント (server/)

### エントリーポイント
- **パス**: `server/src/index.ts`
- **目的**: Express サーバーの起動・設定

### ルーター (server/src/routes/)

| ルーター                | パス                                  | Phase | 説明                |
|----------------------|--------------------------------------|-------|--------------------|
| employeeRouter       | server/src/routes/employees.ts       | 2     | /api/v1/employees  |
| departmentRouter     | server/src/routes/departments.ts     | 2     | /api/v1/departments|
| skillRouter          | server/src/routes/skills.ts          | 2     | /api/v1/skills     |
| searchRouter         | server/src/routes/search.ts          | 3     | /api/v1/search     |

### ミドルウェア (server/src/middleware/)

| ミドルウェア          | Phase | 説明                            |
|--------------------|-------|---------------------------------|
| authMiddleware     | 2     | Firebase JWT トークン検証          |
| roleMiddleware     | 2     | ロールベースアクセス制御（admin 判定）|
| errorMiddleware    | 2     | 統一エラーハンドリング              |

### サービス (server/src/services/)

| サービス              | Phase | 説明                                    |
|--------------------|-------|----------------------------------------|
| EmployeeService    | 2     | 社員 CRUD ビジネスロジック                 |
| DepartmentService  | 2     | 部署マスター管理                           |
| SkillService       | 2     | スキルマスター管理                          |
| SearchSyncService  | 3     | Firestore 書き込み時の OpenSearch 同期     |

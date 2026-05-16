# Code Structure

## Directory Layout

```
src/
+-- App.tsx                          # ルートコンポーネント (AppRoutes を呼び出すだけ)
+-- main.tsx                         # エントリーポイント (React DOM render)
+-- app/
|   +-- store.ts                     # Redux Store 設定
+-- routes/
|   +-- AppRoutes.tsx                # ルート定義 (BrowserRouter + Routes)
+-- hooks/
|   +-- useAppSelector.ts            # 型付き useSelector フック
|   +-- useAppDispatch.ts            # 型付き useDispatch フック
+-- features/
|   +-- employees/
|       +-- types/
|       |   +-- employee.ts          # Employee 型定義
|       +-- data/
|       |   +-- employees.mock.ts    # モックデータ (5名)
|       +-- api/
|       |   +-- employeeRepository.ts # Repository パターン (現在: インメモリ)
|       +-- slices/
|       |   +-- employeeSlice.ts     # Redux Slice + AsyncThunk
|       +-- utils/
|           +-- filterEmployees.ts   # フィルタユーティリティ (未実装)
+-- pages/
|   +-- DashboardPage.tsx            # ダッシュボード (スタブ: h1 のみ)
|   +-- EmployeeListPage.tsx         # 社員一覧 (実装済み: テーブル表示)
|   +-- EmployeeDetailPage.tsx       # 社員詳細 (スタブ)
|   +-- EmployeeCreatePage.tsx       # 社員登録 (スタブ)
|   +-- EmployeeEditPage.tsx         # 社員編集 (スタブ)
+-- utils/
    +-- employeeLabels.ts            # ラベルユーティリティ (未実装)
```

## Component Inventory

| コンポーネント        | パス                               | 状態       | 説明                          |
|--------------------|------------------------------------|-----------|-------------------------------|
| App                | src/App.tsx                        | 実装済み   | ルートコンポーネント             |
| AppRoutes          | src/routes/AppRoutes.tsx           | 実装済み   | ルート定義                     |
| DashboardPage      | src/pages/DashboardPage.tsx        | スタブ     | ダッシュボード画面               |
| EmployeeListPage   | src/pages/EmployeeListPage.tsx     | 実装済み   | 社員一覧テーブル                |
| EmployeeDetailPage | src/pages/EmployeeDetailPage.tsx   | スタブ     | 社員詳細画面                   |
| EmployeeCreatePage | src/pages/EmployeeCreatePage.tsx   | スタブ     | 社員登録フォーム                |
| EmployeeEditPage   | src/pages/EmployeeEditPage.tsx     | スタブ     | 社員編集フォーム                |

## Routes

| パス                  | コンポーネント        | 説明         |
|----------------------|--------------------|-----------   |
| /                    | DashboardPage      | ダッシュボード |
| /employees           | EmployeeListPage   | 社員一覧      |
| /employees/new       | EmployeeCreatePage | 社員登録      |
| /employees/:id       | EmployeeDetailPage | 社員詳細      |
| /employees/:id/edit  | EmployeeEditPage   | 社員編集      |

## Redux State Shape

```
RootState
+-- employees: EmployeeState
    +-- employees: Employee[]        # 社員リスト
    +-- selectedEmployee: Employee | null  # 選択中の社員
    +-- searchCondition: {
    |   +-- keyword: string          # キーワード検索
    |   +-- department: string       # 部署フィルタ
    |   +-- status: string           # ステータスフィルタ
    |   +-- skill: string            # スキルフィルタ
    +-- loading: boolean             # 読み込み中フラグ
    +-- error: string | null         # エラーメッセージ
```

## Data Models

### Employee

| フィールド      | 型                                              | 必須 | 説明              |
|--------------|------------------------------------------------|------|-----------------|
| id           | string                                          | Yes  | 一意ID            |
| name         | string                                          | Yes  | 氏名              |
| email        | string                                          | Yes  | メールアドレス      |
| department   | string                                          | Yes  | 部署名             |
| position     | string                                          | Yes  | 職種・役職          |
| employmentType | 'full-time' / 'part-time' / 'contract' / 'intern' | Yes | 雇用形態        |
| status       | 'active' / 'leave' / 'retired'                  | Yes  | 稼働ステータス      |
| joinedAt     | string (YYYY-MM-DD)                             | Yes  | 入社日             |
| skills       | string[]                                        | Yes  | スキルリスト        |
| profile      | string                                          | Yes  | 自己紹介・プロフィール |
| avatarUrl    | string (optional)                               | No   | アバター画像 URL    |

## Async Operations (AsyncThunk)

| アクション           | 説明              | 現在の実装       |
|--------------------|-----------------|-----------------|
| fetchEmployees     | 全社員取得         | モックデータ返却   |
| fetchEmployeeById  | 社員1件取得        | モックデータ検索   |
| createEmployee     | 社員新規作成       | インメモリ追加    |
| updateEmployee     | 社員情報更新       | インメモリ更新    |
| deleteEmployee     | 社員削除          | インメモリ削除    |

## Key Design Decisions

1. **Repository Pattern 採用**: `employeeRepository` でデータアクセスを抽象化。Firebase 等への切り替えが容易
2. **型付きフック**: `useAppSelector` / `useAppDispatch` で型安全に Redux を使用
3. **Feature-Sliced 構造**: `features/employees/` に関連ファイルをまとめる
4. **スタブページ多数**: EmployeeList 以外はほぼ未実装（h1 タグのみ）

# Dependencies

## Internal Dependencies

```
App.tsx
  +-- AppRoutes.tsx
        +-- DashboardPage.tsx
        +-- EmployeeListPage.tsx
        |     +-- employeeSlice (dispatch: fetchEmployees)
        |     +-- useAppSelector (state.employees)
        |     +-- useAppDispatch
        +-- EmployeeDetailPage.tsx
        +-- EmployeeCreatePage.tsx
        +-- EmployeeEditPage.tsx

store.ts
  +-- employeeSlice.ts
        +-- employeeRepository.ts
              +-- employees.mock.ts
              +-- employee.ts (type)
```

## External Dependencies (Runtime)

| パッケージ                   | バージョン    | 用途                          |
|---------------------------|------------|------------------------------|
| @reduxjs/toolkit           | ^2.11.2    | Redux 状態管理                |
| react                      | ^19.2.6    | UI フレームワーク               |
| react-dom                  | ^19.2.6    | DOM レンダリング               |
| react-redux                | ^9.2.0     | React-Redux バインディング     |
| react-router-dom           | ^7.15.0    | クライアントサイドルーティング   |
| tailwindcss                | ^4.3.0     | CSS ユーティリティ             |
| @tailwindcss/vite          | ^4.3.0     | Vite プラグイン（Tailwind v4） |

## External Dependencies (DevOnly)

| パッケージ                   | バージョン    | 用途                    |
|---------------------------|------------|------------------------|
| @eslint/js                 | ^10.0.1    | ESLint コア              |
| @types/node                | ^24.12.3   | Node.js 型定義           |
| @types/react               | ^19.2.14   | React 型定義             |
| @types/react-dom           | ^19.2.3    | React DOM 型定義         |
| @vitejs/plugin-react       | ^6.0.1     | Vite React プラグイン    |
| eslint                     | ^10.3.0    | リンター                 |
| eslint-plugin-react-hooks  | ^7.1.1     | Hooks ルール             |
| eslint-plugin-react-refresh| ^0.5.2     | React Refresh           |
| globals                    | ^17.6.0    | グローバル変数定義         |
| typescript                 | ~6.0.2     | TypeScript コンパイラ     |
| typescript-eslint          | ^8.59.2    | TypeScript ESLint       |
| vite                       | ^8.0.12    | ビルドツール              |

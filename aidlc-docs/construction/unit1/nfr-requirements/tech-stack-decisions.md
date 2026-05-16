# Tech Stack Decisions — Unit 1: Frontend MVP

## 確定済み技術スタック（変更なし）

| カテゴリ         | 技術                    | バージョン    | 理由                                  |
|--------------|------------------------|------------|--------------------------------------|
| UI           | React                  | ^19.2.6    | 既存採用済み                            |
| 言語          | TypeScript             | ~6.0.2     | 既存採用済み・型安全                     |
| 状態管理       | Redux Toolkit          | ^2.11.2    | 既存採用済み・searchCondition 管理に適切  |
| ルーティング    | React Router           | ^7.15.0    | 既存採用済み・ネストルート対応              |
| スタイリング    | Tailwind CSS           | ^4.3.0     | 既存採用済み・ユーティリティファースト       |
| ビルド        | Vite                   | ^8.0.12    | 既存採用済み・高速 HMR                  |

## Unit 1 で新たに追加する技術

| カテゴリ         | 技術                         | 理由                                        |
|--------------|----------------------------|--------------------------------------------|
| テスト         | Vitest                     | Vite ネイティブ・TypeScript サポート            |
| テスト         | @testing-library/react     | React コンポーネントのユーザー行動テスト           |
| テスト         | @testing-library/user-event| フォーム操作・クリックイベントのシミュレーション     |
| PBT          | fast-check                 | プロパティベーステスト・TypeScript 対応           |
| テスト         | @vitest/coverage-v8        | カバレッジレポート生成                          |

## 技術選定の詳細

### Vitest（テストフレームワーク）
- **選定理由**: Vite プロジェクトとの完全な統合（設定の共有）
- **代替案**: Jest（設定が煩雑になるため不採用）
- **設定**: `vite.config.ts` に test 設定を追記

### fast-check（PBT ライブラリ）
- **選定理由**: TypeScript ネイティブ・豊富な Arbitrary 型・Vitest との統合が容易
- **適用対象**: `filterEmployees`, `validateEmployeeForm`, `dashboardStats`
- **代替案**: hypothesis（Python のみ）、jsverify（メンテナンス停止のため不採用）

### ブラウザビルドターゲット
- **設定**: Vite の `build.target` に `browserslist` 相当の設定を追加
- **対象**: Chrome/Firefox/Safari/Edge の最新版 + 1世代前
- **設定値例**: `['chrome110', 'firefox110', 'safari16', 'edge110']`

## WCAG 2.1 AA 対応の技術的アプローチ

| 要件                  | 実装方法                                                    |
|--------------------|----------------------------------------------------------|
| セマンティック HTML    | `<button>`, `<nav>`, `<main>`, `<section>`, `<label>` を適切に使用 |
| フォームアクセシビリティ | `<label htmlFor>` + `aria-describedby` でエラーを関連付け |
| ダイアログ             | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| フォーカス管理          | ダイアログ開閉時にフォーカスを制御する（`useRef` + `focus()`）|
| カラーコントラスト      | Tailwind CSS のデフォルトカラーパレット（AA 準拠）を使用       |
| ライブリージョン        | エラーメッセージに `aria-live="polite"` を設定                |

## コードベース構成への影響

```
vite.config.ts         → test 設定追加（Vitest）
package.json           → devDependencies に vitest, @testing-library/*, fast-check 追加
src/__tests__/         または
src/features/employees/__tests__/
  filterEmployees.test.ts    → PBT
  validateEmployeeForm.test.ts → PBT
  dashboardStats.test.ts     → PBT
  employeeSlice.test.ts      → 単体テスト
```

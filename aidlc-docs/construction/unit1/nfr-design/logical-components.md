# Logical Components — Unit 1: Frontend MVP

## 追加ライブラリ（tech-stack への追加）

### react-hook-form

| 項目       | 詳細                                                  |
|---------|-----------------------------------------------------|
| 用途      | EmployeeForm の状態管理・バリデーション                    |
| 採用理由   | 非制御コンポーネントによる再レンダリング削減・バリデーション統合が容易 |
| インストール | `npm install react-hook-form`                       |
| 使用箇所   | `src/features/employees/components/EmployeeForm/`   |

### Vitest + @testing-library + fast-check（テスト基盤）

| パッケージ                       | 用途                          |
|-----------------------------|------------------------------|
| vitest                      | テストランナー                  |
| @testing-library/react      | コンポーネントテスト              |
| @testing-library/user-event | ユーザーインタラクションシミュレーション|
| @vitest/coverage-v8         | カバレッジレポート               |
| fast-check                  | プロパティベーステスト             |
| jsdom                       | ブラウザ環境エミュレート            |

**package.json devDependencies 追加:**
```json
{
  "vitest": "^2.x",
  "@testing-library/react": "^16.x",
  "@testing-library/user-event": "^14.x",
  "@vitest/coverage-v8": "^2.x",
  "fast-check": "^3.x",
  "jsdom": "^25.x"
}
```

**vite.config.ts に追加:**
```typescript
test: {
  environment: 'jsdom',
  coverage: {
    provider: 'v8',
    include: [
      'src/features/employees/utils/**',
      'src/features/dashboard/utils/**',
    ],
  },
}
```

---

## 論理コンポーネント構成

### フォームバリデーション層

```
EmployeeForm（react-hook-form）
  +-- useForm({ mode: 'onBlur' })
  |     バリデーション実行: onBlur（フィールド離脱時）+ onSubmit
  +-- register()
  |     各フィールドの登録・バリデーションルール
  +-- handleSubmit()
  |     送信前バリデーション → onSubmit コールバック呼び出し
  +-- formState.errors
        エラーメッセージの表示制御
```

### カスタムバリデーション（メール重複チェック）

```
validateEmailDuplicate(email, employees, editingId?) → string | true
  ↓
react-hook-form の validate オプションに登録
  ↓
フォーム送信時に自動実行
```

### アクセシビリティ層（ConfirmDialog）

```
ConfirmDialog
  +-- useRef (firstButtonRef)  ← フォーカス管理
  +-- useEffect
  |     isOpen=true → firstButtonRef.current?.focus()
  +-- Escape キーハンドラ
        keydown イベントで onCancel を呼び出す
```

---

## テストコンポーネント構成

### PBT テスト対象

```
filterEmployees.test.ts（fast-check）
  プロパティ1: 返却リストは入力リストの部分集合
  プロパティ2: showRetired=false のとき retired が含まれない
  プロパティ3: keyword が空のとき全員が返る
  プロパティ4: フィルタを2回適用しても結果が変わらない（冪等性）

dashboardStats.test.ts（fast-check）
  プロパティ1: totalActive === byStatus.active + byStatus.leave
  プロパティ2: retired の社員は totalActive に含まれない
  プロパティ3: 空リストのとき totalActive === 0

validateEmployeeForm.test.ts（fast-check + 通常テスト）
  プロパティ1: 必須フィールドが空なら必ずエラーが返る
  プロパティ2: 正常な入力値ではエラーが返らない
  境界テスト: 無効なメール形式パターン多数
  重複チェック: 同じメールアドレスの検出
```

### 単体テスト対象

```
employeeSlice.test.ts（Vitest）
  - fetchEmployees fulfilled: employees が更新される
  - createEmployee fulfilled: 新しい社員が追加される
  - updateEmployee fulfilled: 対象社員が更新される
  - deleteEmployee fulfilled: 対象社員が削除される
  - setSearchCondition: 部分的に条件が更新される
  - clearSearchCondition: 全条件がリセットされる
```

---

## Tailwind CSS カラーパレット（WCAG 2.1 AA 準拠）

| 用途                  | Tailwind クラス              | コントラスト比 |
|--------------------|---------------------------|------------|
| プライマリテキスト     | `text-gray-900`            | 16:1 以上   |
| セカンダリテキスト     | `text-gray-700`            | 8:1 以上    |
| active バッジ        | `bg-green-100 text-green-800` | 4.5:1 以上 |
| leave バッジ         | `bg-yellow-100 text-yellow-800` | 4.5:1 以上|
| retired バッジ       | `bg-gray-100 text-gray-700` | 4.5:1 以上 |
| エラーテキスト        | `text-red-600`             | 4.5:1 以上  |
| 危険ボタン（完全削除） | `bg-red-600 text-white`    | 4.5:1 以上  |

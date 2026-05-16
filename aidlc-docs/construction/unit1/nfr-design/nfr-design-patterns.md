# NFR Design Patterns — Unit 1: Frontend MVP

## パフォーマンスパターン

### P-01: メモ化戦略（Phase 1 は適用なし）

| 対象                        | Phase 1   | Phase 3（予定）          |
|---------------------------|-----------|------------------------|
| `filterEmployees` 計算      | メモ化なし  | `useMemo` でメモ化       |
| `dashboardStats` 計算       | メモ化なし  | `useMemo` でメモ化       |
| `EmployeeRow` コンポーネント  | メモ化なし  | `React.memo` でメモ化    |

**Phase 1 の根拠**: 社員数が少なく（モックデータ 5〜数十件）、パフォーマンス問題が発生しない。
**Phase 3 の対応時期**: OpenSearch 統合で大量データを扱う前に適用する。

### P-02: フォームパフォーマンス（react-hook-form）

`react-hook-form` の非制御コンポーネントモデルを採用することで、
フォーム入力ごとの再レンダリングを防止する。

**効果**:
- 各フィールド入力時に親コンポーネントが再レンダリングされない
- バリデーションは送信時 + 必要に応じてフィールド blur 時に実行

---

## セキュリティパターン

### S-01: XSS 対策（React デフォルト）

- **実装**: JSX のテキスト埋め込みは React が自動エスケープ
- **禁止**: `dangerouslySetInnerHTML` の使用禁止
- **対象**: 社員プロフィール・スキル名など、ユーザー入力値の表示箇所すべて

### S-02: フォームバリデーション（クライアントサイド）

`react-hook-form` の `register` + `validate` オプションでバリデーションを実装。

```
バリデーション実行タイミング:
- 送信時 (onSubmit): 全フィールドをバリデート
- フィールド blur 時 (onBlur): 個別フィールドをバリデート（UX向上）
```

**バリデーション実装パターン**:
```
register('email', {
  required: 'メールアドレスを入力してください',
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '有効なメールアドレスを入力してください',
  },
  validate: (value) => checkEmailDuplicate(value) || 'このメールアドレスはすでに使用されています',
})
```

### S-03: 確認ダイアログによる破壊的操作の保護

- 退職処理・完全削除は必ず `ConfirmDialog` を経由する
- 完全削除は `variant="danger"` で視覚的に警告する
- ダイアログは `role="dialog"` + `aria-modal="true"` でアクセシビリティを確保

---

## アクセシビリティパターン（WCAG 2.1 AA）

### A-01: フォームアクセシビリティ

```
パターン:
<label htmlFor="name">氏名 <span aria-hidden="true">*</span></label>
<input
  id="name"
  aria-required="true"
  aria-describedby="name-error"
  aria-invalid={!!errors.name}
/>
{errors.name && (
  <span id="name-error" role="alert">{errors.name.message}</span>
)}
```

### A-02: ダイアログアクセシビリティ

```
パターン:
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-desc"
>
  <h2 id="dialog-title">{title}</h2>
  <p id="dialog-desc">{message}</p>
  ...
</div>
```

**フォーカス管理**:
- ダイアログ開: 最初のボタンにフォーカスを移動（`useEffect` + `ref.focus()`）
- ダイアログ閉: トリガーとなったボタンにフォーカスを戻す

### A-03: ナビゲーションアクセシビリティ

```
パターン:
<nav aria-label="メインナビゲーション">
  <NavLink aria-current={isActive ? 'page' : undefined}>
    ダッシュボード
  </NavLink>
</nav>
```

---

## エラーハンドリングパターン

### E-01: AsyncThunk エラーパターン（リトライなし）

```
パターン:
- pending   → loading = true
- fulfilled → データ更新
- rejected  → error メッセージを ErrorMessage コンポーネントで表示

リトライ: なし（Phase 3 で検討）
ユーザーへの指示: "再度お試しください" メッセージを ErrorMessage に含める
```

### E-02: フォームエラーパターン

```
エラー表示タイミング:
1. フォーム送信時: 全フィールドをバリデートして一括表示
2. フィールド blur 時: 個別フィールドのみ表示（早期フィードバック）

エラーメッセージ配置: フィールド直下（インライン）
エラーアクセシビリティ: role="alert" + aria-describedby でスクリーンリーダーに通知
```

---

## Phase 3 への先送り事項

| パターン                  | 理由              | Phase 3 の対応             |
|------------------------|-----------------|--------------------------|
| `useMemo` メモ化         | 現規模では不要      | 大量データ対応時に導入          |
| `React.memo`           | 現規模では不要      | リスト高速化時に導入            |
| AsyncThunk リトライ       | モックデータで失敗しない | Firebase 接続時に導入（Unit 2）|

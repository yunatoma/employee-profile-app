# Build and Test Summary — Unit 1: Frontend MVP

## ビルド情報

| 項目 | 内容 |
|------|------|
| ビルドツール | Vite 8 + TypeScript ~6.0 |
| コマンド | `npm run build` |
| 成果物 | `dist/` |

## テスト実行サマリー

### 単体テスト（Vitest）

| カテゴリ | ファイル | 種別 |
|---------|---------|-----|
| フィルタロジック | filterEmployees.test.ts | PBT（fast-check）+ 通常 |
| 統計計算 | dashboardStats.test.ts | PBT（fast-check）+ 通常 |
| フォームバリデーション | validateEmployeeForm.test.ts | PBT（fast-check）+ 境界テスト |
| Redux Slice | employeeSlice.test.ts | 単体テスト |

実行コマンド:
```bash
npm run test -- --run
```

### 統合テスト

**Unit 1 スコープ: N/A**（外部サービスなし）
→ Unit 2（Firebase 接続）完了後に追加

### パフォーマンステスト

**Unit 1 スコープ: N/A**（モックデータ・小規模）
→ Unit 3（OpenSearch）完了後に追加

### セキュリティチェック

```bash
npm audit
```

依存パッケージの脆弱性を確認する。moderate 以上の脆弱性があれば対応を検討する。

## 手動動作確認チェックリスト

- [ ] ダッシュボード統計表示
- [ ] 社員一覧 + フィルタ（退職者表示切替）
- [ ] 社員詳細表示
- [ ] 社員登録（バリデーション含む）
- [ ] 社員編集（初期値・保存）
- [ ] 退職処理（ConfirmDialog → 実行）
- [ ] 完全削除（危険ダイアログ → 実行 → リダイレクト）

## 全体ステータス

| 項目 | ステータス |
|------|---------|
| ビルド | 要確認（`npm run build` 実行） |
| 単体テスト | 要確認（`npm run test -- --run` 実行） |
| 統合テスト | N/A（Unit 1 スコープ外） |
| パフォーマンステスト | N/A（Unit 1 スコープ外） |
| 手動動作確認 | 要実施 |

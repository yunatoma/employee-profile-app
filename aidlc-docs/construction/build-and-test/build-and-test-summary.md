# Build and Test Summary — Unit 1 & Unit 2

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

## 全体ステータス（Unit 1）

| 項目 | ステータス |
|------|---------|
| ビルド | 要確認（`npm run build` 実行） |
| 単体テスト | 要確認（`npm run test -- --run` 実行） |
| 統合テスト | N/A（Unit 1 スコープ外） |
| パフォーマンステスト | N/A（Unit 1 スコープ外） |
| 手動動作確認 | 要実施 |

---

## Unit 2: Firebase Integration — サマリー

### ビルド情報（追加分）

| 項目 | 内容 |
|------|------|
| バックエンド言語 | TypeScript（tsx で実行） |
| バックエンド起動 | `cd server && npm run dev`（tsx watch） |
| 同時起動 | `npm run dev`（concurrently） |
| 環境変数 | `.env.local`（フロント） / `server/.env`（バックエンド） |

### 単体テスト（Unit 2 追加分）

| ファイル | テスト数 | 種別 |
|--------|--------|-----|
| `src/features/auth/slices/authSlice.test.ts` | 8件 | Redux Slice（mocker） |

実行コマンド（全テスト）:
```bash
npm run test -- --run
```

### 統合テスト（Unit 2）

手動シナリオ確認（`integration-test-instructions.md` 参照）:
- [ ] Google ログイン
- [ ] 認証状態の永続化（リロード後）
- [ ] 管理者セットアップ（setup-admin スクリプト）
- [ ] 社員登録（admin）→ Firestore 保存確認
- [ ] 権限制御（一般ユーザーの画面制御）
- [ ] ログアウト → `/login` リダイレクト
- [ ] 401 時の自動サインアウト

### セキュリティチェック

```bash
# フロントエンド
npm audit

# バックエンド
cd server && npm audit
```

### 全体ステータス（Unit 2）

| 項目 | ステータス |
|------|---------|
| フロントエンドビルド | 要確認（`npm run build`） |
| バックエンド型チェック | 要確認（`cd server && npx tsc --noEmit`） |
| 単体テスト（全体） | 要確認（`npm run test -- --run`） |
| 統合テスト（手動） | 要実施（7シナリオ） |
| パフォーマンステスト | N/A（個人開発・小規模） |

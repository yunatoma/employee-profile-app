# Unit 1: Frontend MVP — NFR Requirements Plan

## 実行チェックリスト
- [x] Q&A 回答収集・分析
- [x] nfr-requirements.md 生成
- [x] tech-stack-decisions.md 生成

---

## 既知の NFR（要件定義から確定済み）

- **パフォーマンス**: 社員一覧の初期表示 3 秒以内
- **テスト**: Vitest + プロパティベーステスト（PBT）を適用（拡張ルール Enabled）
- **セキュリティ**: セキュリティ拡張ルール Enabled（XSS 対策・入力バリデーション）
- **型安全**: TypeScript 全レイヤー維持

---

## 確認が必要な NFR

---

### Q1: 対応ブラウザ

どのブラウザをサポートしますか？

A) モダンブラウザのみ（Chrome / Firefox / Safari / Edge の最新版）
B) A に加えて1世代前のバージョンもサポートする
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q2: アクセシビリティ

アクセシビリティの対応レベルを教えてください。

A) 最低限のセマンティック HTML のみ（`button`, `label`, `aria-label` を適切に使う）
B) WCAG 2.1 AA 準拠を目指す（コントラスト比・キーボード操作・スクリーンリーダー対応）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q3: テストカバレッジの目標

Vitest のカバレッジ目標を教えてください。

A) 目標値は設定しない（重要なビジネスロジックにテストを書く）
B) ビジネスロジック（filterEmployees・validateEmployeeForm・dashboardStats）は 100% を目標
C) プロジェクト全体で 80% 以上を目標
D) その他（[Answer]: の後に説明を記入）

[Answer]:B

---

### Q4: コード分割（遅延ロード）

ページコンポーネントの遅延ロード（React.lazy / Suspense）を使いますか？

A) 使う（各ページを遅延ロードしてバンドルサイズを分割する）
B) 使わない（現状の規模では不要、Phase 2 以降で検討）
C) その他（[Answer]: の後に説明を記入）

[Answer]:使わない（現状の規模では不要、Phase 2 以降で検討）

---

### Q5: エラーバウンダリ

React Error Boundary を実装しますか？

A) 実装する（予期しない JS エラーでアプリ全体がクラッシュしないようにする）
B) 実装しない（Phase 1 では AsyncThunk の error ハンドリングで十分）
C) その他（[Answer]: の後に説明を記入）

[Answer]:B

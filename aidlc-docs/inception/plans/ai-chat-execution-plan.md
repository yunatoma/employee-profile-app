# AI Chat Feature - Execution Plan

## Detailed Analysis Summary

### Transformation Scope (Brownfield)
- **Transformation Type**: Feature Addition（新規 AI 統合）
- **Primary Changes**: 新規 AIChatPanel UI コンポーネント群 + Gemini API 統合 + Firestore 新コレクション
- **Related Components**: Firebase Auth（既存） / Firestore（既存） / Redux Toolkit（既存）

### Change Impact Assessment
- **User-facing changes**: Yes - フローティングチャット UI を全ページに追加
- **Structural changes**: Yes - aiRepository レイヤーを新規追加（既存 Repository Pattern 拡張）
- **Data model changes**: Yes - Firestore に chatHistory コレクションを新規追加
- **API changes**: Yes - Gemini API (`@google/generative-ai`) を新規統合
- **NFR impact**: Yes - API キー管理セキュリティ、レスポンス時間要件

### Risk Assessment
- **Risk Level**: Medium
- **Rollback Complexity**: Easy（フローティング UI は App.tsx への 1 行追加で切り離せる）
- **Testing Complexity**: Moderate（Gemini API モック、Firestore エミュレーター）

---

## Workflow Visualization

### Text Alternative

```
INCEPTION PHASE:
  [DONE] Workspace Detection
  [DONE] Reverse Engineering
  [DONE] Requirements Analysis (AI Chat)
  [SKIP] User Stories - 個人開発、要件明確
  [NOW]  Workflow Planning
  [EXEC] Application Design - 新規コンポーネント設計
  [SKIP] Units Generation - 単一ユニット (AI-1)

CONSTRUCTION PHASE - Unit AI-1:
  [EXEC] Functional Design - chatHistory データモデル、ハイブリッド検索ロジック
  [EXEC] NFR Requirements - API キーセキュリティ、レスポンス時間
  [EXEC] NFR Design - セキュリティパターン設計
  [EXEC] Infrastructure Design - Firestore コレクション設計、Gemini 設定
  [EXEC] Code Generation - コード生成
  [EXEC] Build and Test - ビルド・テスト更新

OPERATIONS PHASE:
  [HOLD] Operations (Placeholder)
```

---

## Phases to Execute

### INCEPTION PHASE
- [x] Workspace Detection - COMPLETED (既存)
- [x] Reverse Engineering - COMPLETED (既存)
- [x] Requirements Analysis - COMPLETED (2026-05-18)
- [ ] User Stories - SKIP
  - **Rationale**: 個人開発・要件が明確・ユーザーペルソナは既存の admin/member で定義済み
- [x] Workflow Planning - IN PROGRESS
- [ ] Application Design - EXECUTE
  - **Rationale**: 新規コンポーネント（AIChatButton, AIChatPanel, AIChatMessage, EmployeeSuggestionCard）と aiRepository サービス層を新規定義する
- [ ] Units Generation - SKIP
  - **Rationale**: 単一ユニット (Unit AI-1) のみ。分解不要。

### CONSTRUCTION PHASE - Unit AI-1

- [ ] Functional Design - EXECUTE
  - **Rationale**: 新規データモデル（chatHistory, EmployeeSuggestion）、ハイブリッド検索ビジネスロジック、Gemini プロンプト設計
- [ ] NFR Requirements - EXECUTE
  - **Rationale**: API キー管理（セキュリティ）、レスポンス時間（5秒以内）、レート制限対策
- [ ] NFR Design - EXECUTE
  - **Rationale**: セキュリティパターン（環境変数 + 将来 Cloud Functions）、エラーハンドリングパターン
- [ ] Infrastructure Design - EXECUTE
  - **Rationale**: Firestore chatHistory コレクション設計・Security Rules、Gemini API 設定、環境変数
- [ ] Code Generation - EXECUTE (ALWAYS)
- [ ] Build and Test - EXECUTE (ALWAYS, 既存 build-and-test に AI-1 追記)

### OPERATIONS PHASE
- [ ] Operations - PLACEHOLDER

---

## Success Criteria

- **Primary Goal**: ログイン済みユーザーが社員情報について AI に自然言語で質問でき、候補社員のカード（プロフィールリンク付き）が返ってくる
- **Key Deliverables**:
  - フローティングチャット UI（全ページ共通）
  - Gemini 2.0 Flash を使った社員分析エンジン
  - Firestore chatHistory 永続化
  - 完全無料での動作（Google AI Studio 無料 API キー使用）
- **Quality Gates**:
  - Gemini API キーがフロントエンドコードに直接埋め込まれていない
  - Firestore Security Rules で chatHistory が本人のみアクセス可能
  - AI 回答レスポンスタイム 5 秒以内
  - TypeScript 型安全を維持

# AI チャット機能 - 要件ドキュメント

## インテント分析

- **ユーザーリクエスト**: 社員情報を分析して回答する AI チャット機能を追加したい
- **リクエスト種別**: Feature Addition（既存 Brownfield への新機能追加）
- **スコープ**: フロントエンド UI + Firebase (Firestore) + Gemini AI API 統合
- **複雑度**: Medium（AI 統合あり、ハイブリッド検索ロジック、チャット履歴永続化）

---

## 制約条件（最優先）

### コスト制約
- **課金なし** が絶対条件
- Firebase AI Logic (`firebase/ai` SDK) は **Blaze プランが必須** → 除外
- **採用**: `@google/generative-ai` SDK + Google AI Studio 無料 API キー
  - Gemini 2.0 Flash: **15 RPM / 1,000,000 tokens/day** が完全無料
  - クレジットカード登録不要
  - 個人開発規模では無料枠で十分

---

## 機能要件

### FR-AI-01: AI チャット UI（フローティング）
- 画面右下にチャットボタンを常時表示（全ページ共通）
- ボタンクリックでチャットパネルが展開する
- テキスト入力欄とメッセージ送信ボタンを持つ
- ローディング中はスピナーまたはタイピングインジケーターを表示する

### FR-AI-02: 社員データを活用した AI 回答
以下のすべてのクエリに対応する：
- プロジェクトアサイン候補の推薦（例:「このプロジェクトに誰をアサインすればいい？」）
- スキル検索（例:「React が得意な人は？」）
- 稼働状況確認（例:「今すぐ参加できる人は？」）
- 社員データに関する任意の質問（カスタムクエリ）

### FR-AI-03: ハイブリッドデータ検索アーキテクチャ
1. ユーザーの質問を AI が分析し、検索クエリを生成する
2. Firestore で事前フィルタリング（スキル・部署・稼働状況などで絞り込み）
3. 絞り込んだ候補データを Gemini に渡し、最終的な推薦・分析をさせる
4. コンテキスト超過を防ぎ、精度と効率を両立させる

### FR-AI-04: AI 回答フォーマット
- 自然言語のテキスト説明
- 候補社員のカード表示（名前・部署・スキル・稼働状況）
- 各カードから社員プロフィールページへのリンク

### FR-AI-05: チャット履歴の永続化
- Firestore の `chatHistory` コレクションに保存する
- ログイン済みユーザーごとの履歴を管理する
- 過去のチャット履歴を会話コンテキストとして AI に渡す

### FR-AI-06: アクセス制御
- ログイン済みユーザー全員が使用可能
- 未認証ユーザーはアクセス不可（Firebase Auth と連携）

---

## 非機能要件

### NFR-AI-01: セキュリティ
- Gemini API キーはフロントエンドコードに直接埋め込まない
  - 方針1: Firebase Cloud Functions 経由でプロキシする（推奨）
  - 方針2: 環境変数 + Vite の `VITE_` prefix を使う（開発・個人利用向け簡易版）
- Firestore Security Rules で chatHistory は本人のみ読み書き可能

### NFR-AI-02: パフォーマンス
- AI 回答のレスポンス時間: 5 秒以内（Gemini Flash は高速）
- Firestore 事前フィルタリングで AI に渡すデータを最大 20 件に制限

### NFR-AI-03: エラーハンドリング
- API レート制限超過時はユーザーに分かりやすいメッセージを表示
- Firestore エラー時のフォールバック処理

### NFR-AI-04: 拡張性
- AI クライアントを `aiRepository` インターフェースで抽象化（既存の Repository Pattern に合わせる）
- 将来的に Firebase AI Logic への切り替えが容易な設計

---

## 画面・コンポーネント設計

| コンポーネント | 概要 |
|--------------|------|
| `AIChatButton` | 画面右下のフローティングボタン |
| `AIChatPanel` | チャットパネル（メッセージ一覧 + 入力欄） |
| `AIChatMessage` | 個別メッセージ表示（ユーザー/AI） |
| `EmployeeSuggestionCard` | AI が推薦した社員のカード表示（プロフィールリンク付き） |

---

## データ設計

### Firestore: `chatHistory` コレクション

```
chatHistory/{userId}/sessions/{sessionId}/messages/{messageId}
```

| フィールド | 型 | 説明 |
|-----------|---|------|
| role | 'user' \| 'model' | 送信者 |
| content | string | メッセージ内容 |
| timestamp | Timestamp | 送信日時 |
| suggestions | EmployeeSuggestion[] | AI が推薦した社員リスト（任意） |

### EmployeeSuggestion 型

| フィールド | 型 | 説明 |
|-----------|---|------|
| employeeId | string | 社員 ID |
| name | string | 氏名 |
| department | string | 部署名 |
| skills | string[] | スキル一覧 |
| status | string | 稼働状況 |

---

## 技術スタック追加分

| 項目 | 採用技術 | 理由 |
|------|---------|------|
| AI API | `@google/generative-ai` (Gemini 2.0 Flash) | 完全無料枠、高速、日本語対応 |
| API キー管理 | 環境変数 (`VITE_GEMINI_API_KEY`) | 個人開発向け簡易実装（将来 Cloud Functions 移行可） |
| チャット履歴 | Firebase Firestore | 既存インフラを活用 |
| Redux Slice | `aiChatSlice` | 既存 RTK パターンに合わせる |

---

## 実装フロー

```
ユーザー入力
    |
    v
AIChatSlice (Redux)
    |
    v
aiRepository.query(question, userId)
    |
    +-- 1. Firestore で事前フィルタリング（スキル/部署/稼働状況）
    |       └─ 最大20件の候補を取得
    |
    +-- 2. システムプロンプト生成
    |       └─ 社員候補データ + チャット履歴をコンテキストに組み込む
    |
    +-- 3. Gemini API 呼び出し
    |       └─ @google/generative-ai
    |
    +-- 4. 回答パース
    |       └─ テキスト + 推薦社員リスト（JSON埋め込み）
    |
    v
AIChatPanel に表示
    + EmployeeSuggestionCard（プロフィールリンク付き）
    |
    v
Firestore に履歴保存
```

---

## 新規ユニット定義

**Unit AI-1: AI Chat Feature**
- Functional Design → NFR Requirements → NFR Design → Code Generation
- 既存ユニット（Unit 3: OpenSearch Integration）との関係: 独立して実施（OpenSearch は別ユニットとして後回し可）

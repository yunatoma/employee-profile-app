# AI チャット機能 - 要件確認質問

以下の質問に回答してください。各質問の `[Answer]:` タグの後に選択肢の文字（A, B, C...）を記入してください。
選択肢に合うものがない場合は最後の「Other」を選び、説明を追記してください。

---

## Question 1
AI チャット機能で使いたい AI モデルについて、現状の方針を教えてください。

**背景**: 「課金なし」という制約から、以下の無料・低コスト選択肢を調査しました：
- **Firebase AI Logic (Gemini API)**: Google の Gemini モデル。Firebase プロジェクトに統合済みなら設定が簡単。無料枠あり（Spark プランは無料、Blaze プランは従量課金だが無料枠あり）
- **Ollama（ローカル LLM）**: llama3, mistral 等をローカルで動かす。完全無料だがサーバーが必要
- **Hugging Face Inference API**: 無料枠あり（月ごとのクレジット制限）
- **OpenAI / Claude API**: 有料（除外対象）

A) Firebase AI Logic (Gemini API) を使う（Firebase 統合済みで設定簡単、無料枠あり）
B) Ollama でローカル LLM を動かす（完全無料、サーバー必要）
C) Hugging Face Inference API を使う（無料枠あり）
D) まだ決めていない / 調査結果を見て判断したい
E) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 2
AI チャットの主なユースケースを教えてください。

A) プロジェクトアサイン候補の推薦のみ（例: 「このプロジェクトに誰をアサインすればいい？」）
B) プロジェクトアサイン推薦 + スキル検索（例: 「React が得意な人は？」）
C) プロジェクトアサイン推薦 + スキル検索 + 稼働状況確認（例: 「今すぐ参加できる人は？」）
D) 上記すべて + カスタムクエリ（社員データに関する任意の質問）
E) Other (please describe after [Answer]: tag below)

[Answer]:D

---

## Question 3
AI へ渡す社員データの範囲を教えてください。

A) 全社員データをそのまま渡す（シンプルだが大規模組織では非効率）
B) 質問に関連する社員データだけを絞り込んでから渡す（RAG 的アプローチ）
C) まず Firestore で候補を絞り、その結果を AI に渡して最終判断させる（ハイブリッド）
D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 4
チャット UI の配置を教えてください。

A) フローティングチャットボタン（画面右下に常時表示、どのページからも使える）
B) 専用チャットページ（/chat などの独立したページ）
C) サイドパネル（社員一覧の横に表示）
D) Other (please describe after [Answer]: tag below)

[Answer]:A

---

## Question 5
チャット履歴の保存について教えてください。

A) 保存しない（セッションごとにリセット、シンプル）
B) ブラウザのローカルストレージに保存（サーバー不要）
C) Firestore に保存（ログイン済みユーザーの履歴を永続化）
D) Other (please describe after [Answer]: tag below)

[Answer]:C

---

## Question 6
この AI チャット機能のアクセス権限を教えてください。

A) 管理者のみ使用可能
B) ログイン済みユーザー全員が使用可能
C) 誰でも使用可能（認証不要）
D) Other (please describe after [Answer]: tag below)

[Answer]:B

---

## Question 7
AI の回答形式の好みを教えてください。

A) テキストのみ（シンプルな文章で回答）
B) テキスト + 候補社員リスト（名前・部署・スキルをカード形式で表示）
C) テキスト + 社員プロフィールへのリンク
D) Other (please describe after [Answer]: tag below)

[Answer]:Bとプロフィールへのリンク

---

回答が完了したら「done」と教えてください。

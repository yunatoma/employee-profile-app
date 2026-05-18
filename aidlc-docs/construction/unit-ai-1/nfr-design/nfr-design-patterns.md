# NFR Design Patterns (Unit AI-1)

## セキュリティパターン
- **環境変数パターン**: Vite の `import.meta.env.VITE_GEMINI_API_KEY` で API キーを注入
- **条件付き初期化**: API キー未設定時は geminiClient を null にして安全にフォールバック
- **Firestore Rules**: `allow read, write: if request.auth.uid == userId;`

## エラーハンドリングパターン
- **Fire-and-forget for Firestore**: Firestore 保存は `void` で呼び出し。失敗してもチャット体験に影響させない
- **ユーザー向けエラーメッセージ**: Gemini エラーは isError=true の ChatMessage として Redux に追加
- **loading フラグ**: Redux の `loading` で送信中の二重送信を防ぐ

## 履歴管理パターン
- Redux state はセッション単位（ページリロードでリセット）
- Firestore は永続化（将来的な履歴表示機能への拡張ポイント）
- Gemini へは直近5件のみ渡す（コンテキスト長・コスト最適化）

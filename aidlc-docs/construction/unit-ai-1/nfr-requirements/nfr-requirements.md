# NFR Requirements (Unit AI-1)

## セキュリティ
- VITE_GEMINI_API_KEY を環境変数で管理（コードに直書き禁止）
- .env.local を .gitignore に追加（既存設定を確認）
- Firestore Security Rules: chatHistory は本人のみ R/W

## パフォーマンス
- Gemini レスポンス: 5秒以内（Gemini 2.0 Flash は通常1-3秒）
- 社員フィルタリング: 最大20件（コンテキスト肥大化防止）
- Firestore: 直近5件の履歴のみ Gemini に渡す

## エラーハンドリング
- API キー未設定時: コンソール警告 + チャットに「設定が必要です」表示
- Gemini エラー（429 レート制限等）: ユーザー向けエラーメッセージ表示
- Firestore エラー: 保存失敗しても UI には影響させない（fire-and-forget）

## コスト
- Gemini 2.0 Flash 無料枠: 15 RPM / 1M tokens/day
- 個人開発規模で超過リスクなし

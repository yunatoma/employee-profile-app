# Infrastructure Design (Unit AI-1)

## AI API
- **サービス**: Google AI (Gemini 2.0 Flash)
- **SDK**: `@google/generative-ai` (npm)
- **認証**: VITE_GEMINI_API_KEY (Google AI Studio で発行)
- **エンドポイント**: SDK 経由（直接 HTTP 不要）

## データストレージ
- **Firestore コレクション**: `chatHistory/{userId}/sessions/{sessionId}/messages`
- **接続**: 既存 `firestore` export from `src/lib/firebase.ts` を再利用

## 環境変数（追加）
```
VITE_GEMINI_API_KEY=AIza...（Google AI Studio で取得）
```

## パッケージ追加
```
npm install @google/generative-ai
```

## Firestore Security Rules 追加
```javascript
match /chatHistory/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

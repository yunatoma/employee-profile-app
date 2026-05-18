# Code Generation Plan - Unit AI-1: AI Chat Feature

## Context
- Project: Brownfield (React + TypeScript + Redux Toolkit + Firebase)
- Workspace Root: /Users/yuna/Documents/develop/employee-profile-app
- Pattern: Feature-Sliced Design (`src/features/aiChat/`)

## Steps

### Step 1: パッケージインストール
- [ ] `@google/generative-ai` を npm install

### Step 2: 型定義
- [ ] 作成: `src/features/aiChat/types/aiChat.ts`
  - ChatRole, EmployeeSuggestion, ChatMessage, AIChatState, GeminiResponse

### Step 3: Gemini クライアント
- [ ] 作成: `src/features/aiChat/api/geminiClient.ts`
  - GoogleGenerativeAI 初期化
  - generateResponse(systemPrompt, question, history) 関数

### Step 4: AI チャットリポジトリ
- [ ] 作成: `src/features/aiChat/api/aiChatRepository.ts`
  - query(question, employees, history): GeminiResponse
  - saveMessage(userId, sessionId, message): void (fire-and-forget)
  - filterEmployeesForQuery(question, employees): Employee[]（最大20件）

### Step 5: Redux Slice
- [ ] 作成: `src/features/aiChat/slices/aiChatSlice.ts`
  - state: { messages, isOpen, loading, error, sessionId }
  - actions: toggleChat, clearMessages
  - thunk: sendMessage(question)

### Step 6: Store 更新
- [ ] 修正: `src/app/store.ts`
  - aiChatReducer を追加

### Step 7: UI コンポーネント
- [ ] 作成: `src/features/aiChat/components/EmployeeSuggestionCard/EmployeeSuggestionCard.tsx`
- [ ] 作成: `src/features/aiChat/components/AIChatMessage/AIChatMessage.tsx`
- [ ] 作成: `src/features/aiChat/components/AIChatPanel/AIChatPanel.tsx`
- [ ] 作成: `src/features/aiChat/components/AIChatButton/AIChatButton.tsx`

### Step 8: Layout 統合
- [ ] 修正: `src/components/layout/Layout.tsx`
  - `<AIChatButton>` を追加（ログイン済みユーザーのみ表示）

### Step 9: 環境変数サンプル
- [ ] 修正: `.env.example`（または `.env.local.example`）に VITE_GEMINI_API_KEY を追加

### Step 10: ドキュメント
- [ ] 作成: `aidlc-docs/construction/unit-ai-1/code/summary.md`

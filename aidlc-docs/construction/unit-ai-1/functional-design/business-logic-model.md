# Functional Design - Business Logic Model (Unit AI-1)

## 1. メッセージ送信フロー

```
sendMessage(question: string, userId: string)
  1. ユーザーメッセージを Redux state に追加（即時表示）
  2. Redux state から全社員リストを取得
  3. 社員を事前フィルタリング（最大20件）
     - status が 'retired' を除外
     - 質問テキストからキーワード抽出（スキル名、部署名との一致）
     - マッチ件数が少なければフォールバックで active 社員全員
  4. チャット履歴（直近5件）を取得
  5. aiChatRepository.query(question, employees, history) を呼び出し
  6. Firestore に user/model メッセージを保存
  7. Redux state を AI レスポンスで更新
```

## 2. Gemini プロンプト設計

### システムプロンプト
```
あなたは社員管理システムの AIアシスタントです。
以下の社員データを参照し、ユーザーの質問に日本語で答えてください。

## 社員データ（JSON）
{employeesJson}

## 回答ルール
- 社員候補を提案するときは suggestions に含めること
- 候補がない場合は suggestions を空配列にすること
- text は自然な日本語で書くこと
```

### ユーザーターン
```
{chatHistory}
User: {question}
```

### 構造化出力（JSON Schema）
```json
{
  "type": "OBJECT",
  "properties": {
    "text": { "type": "STRING" },
    "suggestions": {
      "type": "ARRAY",
      "items": {
        "type": "OBJECT",
        "properties": {
          "employeeId": { "type": "STRING" },
          "name": { "type": "STRING" },
          "department": { "type": "STRING" },
          "skills": { "type": "ARRAY", "items": { "type": "STRING" } },
          "status": { "type": "STRING" }
        }
      }
    }
  }
}
```

## 3. 事前フィルタリングロジック

```
filterEmployeesForQuery(question: string, employees: Employee[]): Employee[]
  1. active/leave 社員のみ（retired 除外）
  2. 質問からスキル名・部署名をキーワード抽出
  3. キーワードに一致する社員を優先
  4. 最大20件を返す（超過時は active 優先で切り捨て）
```

## 4. Firestore 保存ロジック

```
saveMessages(userId, sessionId, userMsg, modelMsg)
  - chatHistory/{userId}/sessions/{sessionId}/messages に追加
  - セッションIDは aiChatSlice 初期化時に uuid で生成
```

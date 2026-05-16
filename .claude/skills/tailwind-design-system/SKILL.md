---
name: redux-toolkit-review
description: Redux Toolkitのstate設計、slice設計、createAsyncThunk、loading/error管理、API連携をレビューするときに使う
---

# Redux Toolkit Review

Redux Toolkitを使った状態管理をレビューするときは、以下の観点で確認してください。

## レビュー観点

- stateの構造が分かりやすいか
- Reduxで管理すべき状態とローカルstateでよい状態が分かれているか
- actionの責務が適切か
- reducerが複雑になりすぎていないか
- createAsyncThunkの使い方が自然か
- loading / error の管理が適切か
- repository層との責務分離ができているか
- 将来的にAPI通信へ切り替えやすいか
- selectorに切り出した方がよい処理がないか
- TypeScriptで型安全に扱えているか

## 今回のプロジェクト前提

人材管理SaaS風アプリでは、以下の状態を扱います。

- employees
- selectedEmployee
- searchCondition
- loading
- error

社員情報の取得・登録・更新・削除は、repository層を経由する方針です。

## 出力形式

レビュー結果は以下の形式で出力してください。

1. 良い点
2. 気になる点
3. Reduxに持つべきではない可能性がある状態
4. selector化した方がよい処理
5. 修正例
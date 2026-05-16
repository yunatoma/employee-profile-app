---
name: react-best-practices
description: React / TypeScript のコンポーネント設計、props設計、責務分離、パフォーマンスをレビューするときに使う
---

# React Best Practices

React / TypeScript のコードをレビューするときは、以下の観点で確認してください。

## レビュー観点

- コンポーネントの責務が大きすぎないか
- 表示用コンポーネントとロジックが分離されているか
- propsの設計が分かりやすいか
- useEffectの依存配列が適切か
- 不要な再レンダリングが起きやすい構成になっていないか
- mapのkeyが適切か
- TypeScriptの型定義が適切か
- anyに頼りすぎていないか
- データ取得処理がUIコンポーネントに密結合していないか
- 将来的なAPI通信を考慮した責務分離になっているか

## 出力形式

レビュー結果は以下の形式で出力してください。

1. 良い点
2. 気になる点
3. 修正した方がよい理由
4. 修正例
5. 優先度---
name: tailwind-design-system
description: Tailwind CSS v4を使ったUI設計、余白、色、コンポーネント共通化、アクセシビリティをレビューするときに使う
---

# Tailwind Design System

Tailwind CSS v4を使ったUIをレビューするときは、以下の観点で確認してください。

## レビュー観点

- 余白や文字サイズに一貫性があるか
- 色の使い方が分かりやすいか
- Button、Input、Select、Badge、Cardなどに共通化できる箇所がないか
- classNameが長くなりすぎて可読性が落ちていないか
- レスポンシブ対応で崩れそうな箇所がないか
- hover、focus、disabledなどの状態が考慮されているか
- アクセシビリティ上の問題がないか
- Tailwind CSS v4の前提に合っているか

## 注意点

Tailwind CSS v4では、基本的に以下を前提としてください。

- Viteでは `@tailwindcss/vite` を使用する
- `src/index.css` には `@import "tailwindcss";` を書く
- `@tailwind base;`、`@tailwind components;`、`@tailwind utilities;` は使わない
- `tailwind.config.js` は基本不要
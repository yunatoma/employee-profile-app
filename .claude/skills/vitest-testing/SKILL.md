---
name: vitest-testing
description: Vitestで単体テスト、Reactコンポーネントテスト、Redux Sliceのテストケースを考えるときに使う
---

# Vitest Testing

Vitestでテストケースを考えるときは、以下の観点で確認してください。

## テスト観点

- 正常系
- 異常系
- 空データ
- 境界値
- 複数条件の組み合わせ
- エラー時の挙動
- モックが必要な箇所
- テスト名が分かりやすいか
- 実装詳細に依存しすぎていないか
- 将来的な仕様変更で壊れやすい箇所を確認できているか

## 優先してテストしたい対象

- filterEmployees
- employeeLabels
- employeeSlice
- React Hook Form + Zodのバリデーション
- EmployeeTable
- EmployeeSearchForm

## 出力形式

以下の形式で出力してください。

1. テストすべき観点
2. 優先度
3. テストケース一覧
4. Vitestのコード例
5. 注意点
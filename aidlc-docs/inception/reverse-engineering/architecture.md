# Architecture Overview

## Business Overview

employee-profile-app は、社員のプロフィール情報（氏名・部署・スキル・稼働状況など）を一元管理するための人材管理 Web アプリケーション。
個人開発として構築されており、現時点ではモックデータを使ったローカル動作のみ実装されている。

将来的には Firebase をバックエンドとして採用し、OpenSearch による高速全文検索を追加する計画がある。

## Architecture Pattern

- **フロントエンド SPA**: React + Redux Toolkit によるクライアントサイドレンダリング
- **Repository Pattern**: データアクセス層を `employeeRepository` として抽象化済み
  - 現在: モックデータ（インメモリ）
  - 将来: Firebase / REST API に差し替え予定
- **Feature-Sliced 設計**: `src/features/` 配下に機能単位でモジュールをまとめる構造

## System Context

```
+-------------------+
|   ブラウザ (SPA)   |
|                   |
|  React + Redux    |
|  Tailwind CSS     |
+--------+----------+
         |
         | (現在: インメモリ)
         | (将来: HTTP / Firebase SDK)
         |
+--------+----------+
|   データ層         |
|  employeeRepository|
+-------------------+
```

## Technology Stack

| カテゴリ       | 技術                     | バージョン   |
|--------------|--------------------------|------------|
| UI フレームワーク | React                   | ^19.2.6    |
| 言語          | TypeScript               | ~6.0.2     |
| 状態管理       | Redux Toolkit            | ^2.11.2    |
| ルーティング    | React Router             | ^7.15.0    |
| スタイリング    | Tailwind CSS             | ^4.3.0     |
| ビルドツール    | Vite                     | ^8.0.12    |
| パッケージ管理  | npm                      | -          |

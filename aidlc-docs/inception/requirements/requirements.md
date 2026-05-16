# 要件ドキュメント

## インテント分析

- **ユーザーリクエスト**: React + TypeScript + Redux Toolkit + Firebase + Node.js を使った人材管理アプリを個人開発。将来的に OpenSearch で高速検索を追加したい。
- **リクエスト種別**: Enhancement（既存 Brownfield に機能追加） + 将来の Migration（Firebase / OpenSearch 統合）
- **スコープ**: System-wide（フロントエンド完成 → バックエンド統合 → 検索基盤）
- **複雑度**: Complex（複数フェーズ、複数技術スタック統合）

---

## アプリの目的

社員のプロフィール情報（氏名・部署・職種・スキル・稼働状況）を一元管理し、
全社員が自分のプロフィールを閲覧・編集でき、人事担当者が全社員を管理できる Web アプリケーション。

---

## 想定ユーザー

| ロール           | 権限                                            |
|---------------|------------------------------------------------|
| 一般社員         | 自分のプロフィールを閲覧・編集する                  |
| 人事担当者/管理者 | 全社員のプロフィールを登録・閲覧・編集・削除する       |

---

## 実装フェーズ

### Phase 1 - MVP（スタブ完成）
**目標**: 現在のスタブページをすべて実装し、モックデータで CRUD を完成させる

- 社員詳細ページ（EmployeeDetailPage）実装
- 社員登録ページ（EmployeeCreatePage）実装
- 社員編集ページ（EmployeeEditPage）実装
- ダッシュボード（統計サマリー: 社員数・部署別・稼働状況）実装
- 検索・フィルタなし（一覧表示のみ）
- 認証なし（モックデータで動作）

### Phase 2 - Firebase 統合（バックエンド接続）
**目標**: 本番データベースに接続し、認証・権限管理を実装する

- Firebase Authentication（Google ログイン）
- Firebase Firestore（社員データ永続化）
- Node.js バックエンド API サーバー（Firebase + Node.js 同時導入）
- 役割ベースのアクセス制御（一般社員 vs 管理者）
- 部署マスター・スキルマスター管理

### Phase 3 - 高度化・検索基盤
**目標**: 高速検索と追加機能を実装する

- OpenSearch 統合（社員名・スキル・部署・稼働状況の高速全文検索）
- アバター画像アップロード（Firebase Storage）
- クライアントサイドフィルタ強化

---

## 機能要件（詳細）

### Phase 1 機能要件

#### FR-01: 社員一覧表示
- 全社員をテーブル形式で表示する（氏名・部署・職種・ステータス・スキル）
- ローディング・エラー状態を表示する
- 各行から詳細ページへ遷移できる
- `retired`（退職）の社員はデフォルト非表示、フィルタで表示切替できる

#### FR-02: 社員詳細表示
- 社員の全プロフィール情報を表示する
- 編集ボタンから編集画面へ遷移できる
- 削除機能を提供する

#### FR-03: 社員登録
- 必要事項をフォームで入力し、新規社員を作成できる
- 必須項目のバリデーションを行う
- 部署・スキルはマスターデータから選択する（Phase 1 ではマスターは静的データ）

#### FR-04: 社員編集
- 既存の社員情報を編集・保存できる
- フォームバリデーションを行う

#### FR-05a: 社員退職処理
- 「退職処理」ボタンで `status` を `'retired'` に変更する（DB には残す）
- 確認ダイアログを表示してから実行する
- 社員一覧でデフォルト非表示（フィルタで表示切替可能）
- 管理者のみ実行可能（Phase 2 で権限チェック追加）

#### FR-05b: 社員完全削除
- 「完全削除」ボタンで DB から物理削除する
- 「完全削除」であることを明示した別の確認ダイアログを表示する
- 管理者のみ実行可能（Phase 2 で権限チェック追加）

#### FR-06: ダッシュボード
- 総社員数を表示する
- 部署別の社員数を表示する
- 稼働状況（active / leave / retired）の内訳を表示する

### Phase 2 機能要件

#### FR-07: Google 認証
- Google アカウントでログイン・ログアウトできる
- 未認証ユーザーはログイン画面にリダイレクトされる

#### FR-08: 権限管理
- 一般社員: 自分のプロフィールのみ編集可能
- 管理者: 全社員の CRUD が可能

#### FR-09: Firebase Firestore 接続
- employeeRepository を Firestore 版に差し替える（Repository Pattern を維持）

#### FR-10: マスターデータ管理（Firestore）
- 部署マスター（departments コレクション）
- スキルマスター（skills コレクション）

### Phase 3 機能要件

#### FR-11: OpenSearch 検索
- 社員名・スキル・部署・稼働状況で全文検索できる
- 検索結果をリアルタイムで表示する

#### FR-12: アバター画像アップロード
- Firebase Storage にアバター画像をアップロードできる
- 画像プレビューを表示する

---

## 非機能要件

### NFR-01: セキュリティ（Phase 2 以降）
- Firebase Security Rules で Firestore へのアクセス制御
- JWT トークンによる API 認証（Node.js バックエンド）
- 入力値のサーバーサイドバリデーション
- XSS・CSRF 対策

### NFR-02: パフォーマンス
- 社員一覧の初期表示: 3 秒以内
- OpenSearch 検索レスポンス: 1 秒以内（Phase 3）

### NFR-03: テスト（拡張ルール: PBT 適用）
- ビジネスロジック（フィルタ・バリデーション）に Vitest + プロパティベーステストを適用
- 純粋関数（filterEmployees 等）は PBT 優先
- Redux Slice の単体テスト

### NFR-04: 拡張性（OpenSearch 後付け設計）
- Repository Pattern を全フェーズで維持する
- 検索専用の `searchRepository` インターフェースを分離する
- Firestore への書き込みと OpenSearch インデックス同期は Node.js で管理する
- フロントエンドは検索エンドポイントを切り替えるだけでよい設計

### NFR-05: 保守性
- TypeScript 型安全を全レイヤーで維持する
- Feature-Sliced 設計を継続する

---

## 画面一覧

| 画面名              | URL パス              | Phase | 概要                         |
|-------------------|----------------------|-------|------------------------------|
| ダッシュボード       | /                    | 1     | 統計サマリー表示               |
| 社員一覧            | /employees           | 1     | 全社員テーブル（既存・拡張）     |
| 社員詳細            | /employees/:id       | 1     | 社員プロフィール詳細表示         |
| 社員登録            | /employees/new       | 1     | 新規社員入力フォーム            |
| 社員編集            | /employees/:id/edit  | 1     | 既存社員情報の編集フォーム       |
| ログイン            | /login               | 2     | Google ログイン画面            |
| マスター管理（部署）  | /admin/departments   | 2     | 部署マスターの CRUD            |
| マスター管理（スキル）| /admin/skills        | 2     | スキルマスターの CRUD           |
| 検索結果            | /search              | 3     | OpenSearch 検索結果            |

---

## データ設計

### Employee（Firestore: employees コレクション）

| フィールド      | 型                                              | 必須 | 変更点          |
|--------------|------------------------------------------------|------|----------------|
| id           | string                                          | Yes  | 変更なし         |
| name         | string                                          | Yes  | 変更なし         |
| email        | string                                          | Yes  | 変更なし         |
| departmentId | string (→ departments コレクションの ref)        | Yes  | 変更: 文字列→参照 |
| position     | string                                          | Yes  | 変更なし（暫定）   |
| employmentType | 'full-time' / 'part-time' / 'contract' / 'intern' | Yes | 変更なし      |
| status       | 'active' / 'leave' / 'retired'                  | Yes  | 変更なし         |
| joinedAt     | string (YYYY-MM-DD)                             | Yes  | 変更なし         |
| skillIds     | string[] (→ skills コレクションの ref)           | Yes  | 変更: 文字列→参照 |
| profile      | string                                          | Yes  | 変更なし         |
| avatarUrl    | string (optional)                               | No   | 変更なし         |
| uid          | string (Firebase Auth UID)                      | Yes  | 追加(Phase 2)   |
| role         | 'member' / 'admin'                              | Yes  | 追加(Phase 2)   |
| createdAt    | Timestamp                                       | Yes  | 追加(Phase 2)   |
| updatedAt    | Timestamp                                       | Yes  | 追加(Phase 2)   |

### Department（Firestore: departments コレクション）Phase 2

| フィールド  | 型      | 必須 | 説明   |
|-----------|--------|------|------|
| id        | string | Yes  | 一意ID |
| name      | string | Yes  | 部署名 |

### Skill（Firestore: skills コレクション）Phase 2

| フィールド  | 型      | 必須 | 説明     |
|-----------|--------|------|--------|
| id        | string | Yes  | 一意ID   |
| name      | string | Yes  | スキル名 |
| category  | string | No   | カテゴリ |

---

## 技術構成

| レイヤー        | Phase 1                 | Phase 2                      | Phase 3              |
|--------------|-------------------------|------------------------------|----------------------|
| フロントエンド  | React 19 + RTK + Router | 同左                          | 同左                 |
| スタイル       | Tailwind CSS v4         | 同左                          | 同左                 |
| 状態管理       | Redux Toolkit           | 同左                          | 同左                 |
| データ層       | モックデータ (Repository)| Firestore (Repository 差替)   | 同左 + searchRepo    |
| 認証          | なし                    | Firebase Auth (Google)       | 同左                 |
| バックエンド   | なし                    | Node.js API サーバー          | 同左 + OpenSearch API |
| DB           | インメモリ               | Firebase Firestore           | 同左                 |
| 検索          | なし                    | なし                          | OpenSearch           |
| ストレージ     | なし                    | なし（準備のみ）               | Firebase Storage     |

---

## OpenSearch 後付けのための設計方針

1. **Repository Pattern を全フェーズで維持**: `employeeRepository` インターフェースを変えずに実装を差し替える
2. **searchRepository を分離**: 検索専用インターフェース（`searchRepository`）を別に定義し、Phase 1/2 は Firestore クエリ、Phase 3 は OpenSearch に差し替える
3. **Node.js でインデックス同期**: Firestore への書き込み時に Node.js バックエンドが OpenSearch にも同期（書き込みの一元管理）
4. **フロントエンドは API エンドポイントのみ意識**: 検索は `/api/search` にリクエストを送るだけで、裏側の変更に影響されない
5. **環境変数でバックエンド切り替え**: `VITE_SEARCH_BACKEND=opensearch | firestore` のような設定で切り替え可能にする

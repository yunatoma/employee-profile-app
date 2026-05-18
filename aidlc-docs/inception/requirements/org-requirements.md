# 要件ドキュメント - 組織概念追加

**作成日**: 2026-05-17
**種別**: Brownfield Enhancement（既存システムへの新機能追加）
**複雑度**: Complex（認証フロー・データモデル・セキュリティルール・UI すべてに影響）

---

## インテント分析

- **ユーザーリクエスト**: マルチテナント「組織」概念の追加。サインアップ時に新組織を作るか、既存組織の事前登録ユーザーとして参加するかの二択にしたい。
- **リクエスト種別**: Enhancement（既存 Firebase 統合への組織レイヤー追加）
- **スコープ**: System-wide（認証フロー・Firestore データモデル・Security Rules・フロントエンド）

---

## 設計コンセプト: 事前登録モデル

招待リンク/コード方式ではなく、**メールアドレス事前登録**方式を採用する。

### 参加フロー

```
【新規組織作成フロー】
  サインアップ（Google）
    → そのメールが employees コレクションに存在しない
    → 組織作成ウィザードへ
    → 組織名・ロゴを入力
    → organizations ドキュメント作成
    → 自分の employee ドキュメント作成（role: 'admin'）
    → ダッシュボードへ

【既存組織への参加フロー】
  管理者が事前に employees ドキュメントを作成（email 指定、uid: null、status: 'pending'）
    ↓
  対象者がその email の Google アカウントでサインアップ
    → メールが employees コレクションに存在する
    → uid・photoURL・displayName を employee ドキュメントに自動紐付け
    → status: 'pending' → 'active' に更新
    → ダッシュボードへ

【ログインフロー（既存ユーザー）】
  Google ログイン → uid が employees コレクションに存在する → ダッシュボードへ
```

---

## 機能要件

### ORG-FR-01: 組織作成（新規サインアップ時）

- Google アカウントでサインアップし、メールが未登録の場合、組織作成ウィザードを表示する
- 入力項目:
  - 組織名（必須）
  - ロゴ画像（任意、Firebase Storage にアップロード）
- 完了時: organizations ドキュメントと自分の employee ドキュメント（role: 'admin'）を作成する

### ORG-FR-02: 既存組織への自動参加

- Google サインアップ時に、そのメールアドレスが employees コレクションに存在する場合、自動的に uid を紐付けて参加させる
- employee ドキュメントの `uid` フィールドを更新し、`status: 'pending'` → `'active'` に変更する
- 紐付け後、自組織のダッシュボードへリダイレクトする

### ORG-FR-03: 社員の事前登録（管理者機能）

- 管理者は社員のメールアドレスを入力して employee ドキュメントを事前作成できる
- 事前作成時の状態: `uid: null`, `status: 'pending'`
- 対象者が未だサインアップしていない旨を UI で表示する（"招待待ち"ラベル等）

### ORG-FR-04: 組織データの完全分離

- 社員一覧・詳細・検索など、すべてのデータ操作は自組織内のみに限定する
- `organizationId` が一致しないデータは絶対に表示・アクセスできない
- Firestore Security Rules でサーバーサイドでも強制する

### ORG-FR-05: 組織プロフィール管理

- 管理者は組織名・ロゴ画像を編集できる
- ロゴ画像は Firebase Storage に保存し、URL を organizations ドキュメントに記録する

### ORG-FR-06: 認証ガード強化

- 未ログイン → ログインページへリダイレクト
- ログイン済みだが組織未所属（メール未登録・org 未作成） → 組織作成ウィザードへリダイレクト
- ログイン済みかつ組織所属 → ダッシュボードへ

---

## 非機能要件

### ORG-NFR-01: セキュリティ（最重要）

- Firestore Security Rules: すべての read/write に `organizationId` チェックを必須とする
- Cloud Functions または Firestore Rules で、uid 紐付け処理の正当性を検証する
- 自分の `organizationId` 以外の organizations ドキュメントは読み取り不可

### ORG-NFR-02: データ整合性

- uid 紐付け（ORG-FR-02）は Firestore トランザクションまたはアトミック処理で行う
- 同一 uid が複数の employee ドキュメントに紐付かないよう制約する

### ORG-NFR-03: 拡張性

- `organizationId` を全コレクションのルートキーとして設計し、将来のクロスオーグ機能追加に備える
- organizations コレクションのスキーマに拡張フィールド余地を持たせる

---

## データモデル

### organizations コレクション（新規追加）

| フィールド   | 型        | 必須 | 説明                         |
|------------|----------|------|------------------------------|
| id         | string   | Yes  | ドキュメント ID（自動生成）    |
| name       | string   | Yes  | 組織名                       |
| logoUrl    | string   | No   | Firebase Storage URL         |
| ownerId    | string   | Yes  | 作成者の Firebase Auth UID   |
| createdAt  | Timestamp| Yes  | 作成日時                     |
| updatedAt  | Timestamp| Yes  | 更新日時                     |

### employees コレクション（変更）

追加・変更フィールド:

| フィールド       | 型                       | 必須 | 変更内容                              |
|----------------|------------------------|------|---------------------------------------|
| organizationId | string                 | Yes  | 追加: 所属組織 ID                     |
| uid            | string \| null         | Yes  | 変更: null = pending（未サインアップ） |
| status         | 'active'/'leave'/'retired'/'pending' | Yes | 変更: 'pending' 状態を追加       |
| role           | 'member' \| 'admin'    | Yes  | 変更なし（既存の Phase 2 設計を維持） |

---

## 画面追加・変更

| 画面名             | URL パス              | 変更種別 | 概要                                         |
|------------------|----------------------|--------|----------------------------------------------|
| 組織作成ウィザード | /onboarding/new-org  | 新規   | 組織名・ロゴ入力、組織作成                    |
| ログイン           | /login               | 変更   | サインアップ後の分岐ロジック追加               |
| 社員登録           | /employees/new       | 変更   | 事前登録（メール入力のみで pending 作成）対応  |
| 社員一覧           | /employees           | 変更   | pending 状態の社員表示（"招待待ち"バッジ）    |
| 組織設定           | /admin/organization  | 新規   | 組織名・ロゴ編集                              |

---

## 移行方針

- **既存データ**: 開発中のため全データリセット・再構築
- **移行スクリプト不要**: 既存 Firestore コレクションをクリアし、新スキーマで再作成する

---

## 影響範囲

| 対象                    | 影響度 | 内容                                              |
|------------------------|------|---------------------------------------------------|
| Firestore データモデル  | 大   | employees に organizationId 追加、organizations 新規作成 |
| Firestore Security Rules | 大 | 全コレクションに organizationId チェック追加         |
| Firebase Storage        | 中   | ロゴ画像アップロード（Phase 3 予定を前倒し）         |
| 認証フロー（フロントエンド）| 大 | サインアップ後の分岐ロジック追加                   |
| Redux State             | 中   | currentOrganization state の追加                  |
| Repository Layer        | 中   | employeeRepository に organizationId フィルタ追加  |
| Node.js バックエンド    | 小   | API の organizationId バリデーション追加            |

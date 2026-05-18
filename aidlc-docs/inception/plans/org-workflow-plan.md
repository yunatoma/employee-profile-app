# Workflow Plan - 組織概念追加

**作成日**: 2026-05-17
**フェーズ**: INCEPTION → CONSTRUCTION

---

## スキップステージ

| ステージ           | 判定   | 理由                                              |
|------------------|--------|---------------------------------------------------|
| Workspace Detection | 実施済み | aidlc-state.md 存在確認済み                     |
| Reverse Engineering | スキップ | 既存成果物あり                                   |
| User Stories       | スキップ | 個人開発・要件定義で十分（既存方針を踏襲）          |

---

## INCEPTION PHASE（残り）

| ステージ            | 深度         | 理由                                              |
|-------------------|------------|---------------------------------------------------|
| Requirements Analysis | 完了済み  | org-requirements.md 生成・承認済み                |
| Workflow Planning     | Standard   | 今ここ                                           |
| Application Design    | Standard   | 新コレクション・新コンポーネント・新サービスあり    |
| Units Generation      | Standard   | 複数ユニットへの分解が必要                         |

---

## CONSTRUCTION PHASE - ユニット構成

### Unit Org-1: Organization Foundation（データ基盤）

**目的**: Firestore スキーマ変更・Security Rules・Redux org state の確立

| ステージ              | 実施 | 理由                                            |
|--------------------|------|-------------------------------------------------|
| Functional Design  | YES  | 新データモデル（organizations, employees 変更）  |
| NFR Requirements   | YES  | セキュリティが最重要（データ分離・Rules）         |
| NFR Design         | YES  | Security Rules の設計パターン                    |
| Infrastructure Design | YES | Firestore コレクション・Storage バケット構成    |
| Code Generation    | YES  | 常に実施                                        |

**成果物**:
- `organizations` Firestore コレクション定義
- `employees` スキーマ更新（organizationId, pending status）
- Firestore Security Rules 全面改訂
- Firebase Storage Security Rules（ロゴ用）
- Redux `organizationSlice`
- `organizationRepository` インターフェース + Firestore 実装

---

### Unit Org-2: Auth Flow & Onboarding（認証・参加フロー）

**目的**: サインアップ後の分岐ロジック・組織作成ウィザード・uid 自動紐付け

| ステージ              | 実施 | 理由                                                   |
|--------------------|------|--------------------------------------------------------|
| Functional Design  | YES  | 複雑な分岐ロジック（新規/既存メール判定・uid 紐付け）   |
| NFR Requirements   | YES  | セキュリティ（uid 紐付けの正当性・トランザクション整合性）|
| NFR Design         | YES  | アトミック処理・エラーハンドリング設計                  |
| Infrastructure Design | SKIP | Unit Org-1 で確立済み                              |
| Code Generation    | YES  | 常に実施                                               |

**成果物**:
- サインアップ後ルーティングロジック（AuthGuard 拡張）
- 組織作成ウィザードページ（`/onboarding/new-org`）
- ロゴ画像アップロードコンポーネント（Firebase Storage）
- uid 自動紐付け処理（Firestore トランザクション）

---

### Unit Org-3: Org Management UI（組織管理 UI）

**目的**: 社員事前登録・pending 状態 UI・組織設定ページ

| ステージ              | 実施 | 理由                                           |
|--------------------|------|------------------------------------------------|
| Functional Design  | YES  | 事前登録フロー・pending 状態の表示ルール        |
| NFR Requirements   | SKIP | Unit Org-1/2 で確立済み                        |
| NFR Design         | SKIP | Unit Org-1/2 で確立済み                        |
| Infrastructure Design | SKIP | Unit Org-1 で確立済み                       |
| Code Generation    | YES  | 常に実施                                       |

**成果物**:
- 社員登録フォーム改修（メール入力のみで pending 作成対応）
- 社員一覧の pending バッジ表示
- 組織設定ページ（`/admin/organization`）- 組織名・ロゴ編集

---

## 実行順序

```
[完了済み] Requirements Analysis
     |
     v
Workflow Planning (今ここ)
     |
     v
Application Design
     |
     v
Units Generation
     |
     v
Unit Org-1: Organization Foundation
     |
     v
Unit Org-2: Auth Flow & Onboarding
     |
     v
Unit Org-3: Org Management UI
     |
     v
Build and Test（更新）
```

---

## 依存関係

```
Unit Org-1 (データ基盤・Security Rules)
    └─ Unit Org-2 が依存（Firestore スキーマ・Redux state が前提）
         └─ Unit Org-3 が依存（Auth フロー・組織 state が前提）
```

---

## 既存ユニットへの影響

| 既存ユニット       | 影響                                                      | 対応方針                        |
|-----------------|-----------------------------------------------------------|---------------------------------|
| Unit 1 (Frontend MVP) | employee 型に organizationId・pending status 追加 | Unit Org-1 の FD で型更新      |
| Unit 2 (Firebase)     | employeeRepository に organizationId フィルタ追加 | Unit Org-1 の Code Gen で更新  |
| Unit 3 (OpenSearch)   | 未着手のため新スキーマで設計可能                   | 影響なし（後続で対応）          |

# Unit of Work — ストーリーマップ

## 機能要件 → ユニット対応表

| 機能要件 ID | 機能名              | Unit   | 優先度 | 備考                          |
|-----------|-------------------|--------|-------|------------------------------|
| FR-01     | 社員一覧表示         | Unit 1 | High  | EmployeeTable 分離・Layout 統合 |
| FR-02     | 社員詳細表示         | Unit 1 | High  | EmployeeDetailPage 実装       |
| FR-03     | 社員登録            | Unit 1 | High  | EmployeeForm（mode=create）   |
| FR-04     | 社員編集            | Unit 1 | High  | EmployeeForm（mode=edit）     |
| FR-05a    | 社員退職処理         | Unit 1 | High  | status を 'retired' に変更。一覧でデフォルト非表示 |
| FR-05b    | 社員完全削除         | Unit 1 | High  | DB から完全削除。管理者のみ。別確認ダイアログ |
| FR-06     | ダッシュボード        | Unit 1 | High  | StatCard + DepartmentChart    |
| FR-07     | Google 認証         | Unit 2 | High  | LoginPage + authSlice         |
| FR-08     | 権限管理            | Unit 2 | High  | roleMiddleware + permissions  |
| FR-09     | Firestore 接続      | Unit 2 | High  | employeeRepository 差し替え   |
| FR-10     | マスターデータ管理    | Unit 2 | Medium| Department/Skill Admin Pages  |
| FR-11     | OpenSearch 検索     | Unit 3 | Medium| SearchBar + searchSlice       |
| FR-12     | アバター画像         | Unit 3 | Low   | Firebase Storage              |

---

## Unit 1: Frontend MVP — 詳細ストーリー

### 共通基盤
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| Layout（ヘッダー + サイドバー）を実装する | Layout.tsx                          |
| スキルをタグで表示できる                | SkillTag.tsx                        |
| 稼働状況を色付きバッジで表示できる       | StatusBadge.tsx                     |
| ローディング中を表示できる              | LoadingSpinner.tsx                  |
| エラーを統一フォーマットで表示できる     | ErrorMessage.tsx                    |
| 削除前に確認ダイアログを表示できる       | ConfirmDialog.tsx                   |
| ステータス・雇用形態の日本語ラベルを変換できる | employeeLabels.ts              |

### ダッシュボード
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| 総社員数を表示できる                   | StatCard + dashboardStats.ts        |
| 部署別の社員数を表示できる              | DepartmentChart + dashboardStats.ts |
| 稼働状況の内訳（active/leave/retired）を表示できる | StatCard + dashboardStats.ts |

### 社員詳細
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| 社員の全プロフィール情報を表示できる     | EmployeeDetailPage + EmployeeProfile|
| 詳細画面から編集ページへ遷移できる      | EmployeeDetailPage（リンク）          |
| 管理者が「退職処理」ボタンで status を retired に変更できる | EmployeeDetailPage + ConfirmDialog |
| 管理者が「完全削除」ボタンで DB から削除できる（別確認ダイアログ） | EmployeeDetailPage + ConfirmDialog |
| 一覧ページで退職者（retired）はデフォルト非表示、フィルタで表示切替できる | EmployeeListPage + filterEmployees |

### 社員登録・編集
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| 新規社員情報をフォームで入力できる      | EmployeeForm（mode=create）          |
| 既存社員情報を編集できる              | EmployeeForm（mode=edit）            |
| 必須項目が未入力の場合にバリデーションエラーを表示できる | EmployeeForm（validation）|
| 登録・保存後に詳細ページへリダイレクトされる | EmployeeCreatePage / EditPage   |

---

## Unit 2: Firebase Integration — 詳細ストーリー

### 認証
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| Google アカウントでログインできる       | LoginPage + authService             |
| ログアウトできる                      | Layout（ログアウトボタン）+ authSlice  |
| 未認証ユーザーはログイン画面へリダイレクトされる | ProtectedRoute               |
| 認証状態がページ再読み込み後も維持される | authSlice（onAuthStateChanged）     |

### データ永続化
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| 社員データが Firestore に保存される    | FirestoreEmployeeRepository         |
| Node.js API 経由で社員 CRUD ができる  | EmployeeService + /api/v1/employees |
| 部署・スキルをマスターから選択できる    | EmployeeForm（選択式）+ マスター API  |

### 権限管理
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| 一般社員は自分のプロフィールのみ編集できる | permissions.ts + EmployeeEditPage |
| 管理者は全社員の CRUD ができる         | roleMiddleware + EmployeeService    |
| 管理者のみ登録・退職処理・完全削除ボタンが表示される | EmployeeDetailPage（条件分岐）|

### マスター管理
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| 管理者が部署を追加・編集・削除できる    | DepartmentAdminPage                 |
| 管理者がスキルを追加・編集・削除できる  | SkillAdminPage                      |

---

## Unit 3: OpenSearch Integration — 詳細ストーリー

### 検索
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| 社員名でリアルタイム検索できる          | SearchBar + searchSlice             |
| スキルで社員を検索できる              | SearchBar + OpenSearch クエリ        |
| 部署・稼働状況で絞り込みできる          | SearchBar + OpenSearch フィルタ      |
| 検索結果が 1 秒以内に表示される        | OpenSearch + searchRepository       |
| 社員登録・更新・削除時に検索インデックスが自動更新される | SearchSyncService   |

### アバター画像
| ストーリー                             | コンポーネント / ファイル              |
|-------------------------------------|-------------------------------------|
| 社員プロフィール画像をアップロードできる | EmployeeForm（Storage アップロード）  |
| プロフィール画像が詳細ページに表示される | EmployeeProfile（avatarUrl 表示）   |

---

## 非機能要件 → ユニット対応表

| NFR ID | 名称                  | Unit   | 概要                               |
|-------|---------------------|--------|----------------------------------|
| NFR-01 | セキュリティ            | Unit 2 | JWT 認証、Firestore Rules、入力バリデーション |
| NFR-02 | パフォーマンス           | Unit 3 | OpenSearch 検索レスポンス 1 秒以内  |
| NFR-03 | PBT（プロパティベーステスト）| Unit 1 | filterEmployees・バリデーションロジック |
| NFR-04 | 拡張性（OpenSearch 後付け）| All   | Repository Pattern・searchRepository 分離 |
| NFR-05 | 保守性                 | Unit 1 | TypeScript 型安全・Feature-Sliced 設計継続 |

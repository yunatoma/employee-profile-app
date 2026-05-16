# Services

## サービスレイヤーの設計方針

- **フロントエンド**: Redux AsyncThunk が Repository を呼び出す。サービス層は Repository に集約。
- **バックエンド（Node.js）**: Controller（Router）→ Service → Repository（Firestore）の3層構造
- **OpenSearch 同期**: Node.js の Service 層で Firestore 書き込みと OpenSearch インデックス更新を一元管理

---

## フロントエンド サービス

### EmployeeRepository（フロントエンド）

**役割**: 社員データへのアクセスを抽象化する唯一の窓口

| Phase | 実装             | 詳細                                    |
|-------|-----------------|----------------------------------------|
| 1     | mockRepository  | インメモリのモックデータ（現在の実装）        |
| 2     | firestoreRepository | Firestore SDK への直接アクセスから Node.js API へ切り替え |

**インターフェースは変更せず、実装のみ差し替え**（Repository Pattern）

### AuthService（フロントエンド）— Phase 2

**役割**: Firebase Authentication の操作をラップする

- `signInWithGoogle()` — Google プロバイダーでポップアップサインイン
- `signOut()` — Firebase からサインアウト
- `onAuthStateChanged(callback)` — 認証状態変化を監視（アプリ起動時に呼び出し）
- `getCurrentUser()` — 現在の Firebase User を取得

### SearchService（フロントエンド）— Phase 3

**役割**: 検索 API への呼び出しを抽象化する

- `search(query: SearchQuery)` — Node.js `/api/v1/search` へ HTTP リクエスト
- 実装を `searchRepository` として抽象化し、将来の差し替えに対応

---

## Node.js バックエンド サービス — Phase 2

### EmployeeService

**役割**: 社員 CRUD のビジネスロジック・権限チェックを担当

**オーケストレーション**:
1. リクエストを受け取り、ユーザーのロールを確認する
2. Firestore Repository を呼び出してデータを操作する
3. SearchSyncService を呼び出して OpenSearch に同期する（Phase 3）
4. レスポンスを整形して返す

```
Router (routes/employees.ts)
  → authMiddleware（JWT 検証）
  → roleMiddleware（管理者判定）
  → EmployeeService（ビジネスロジック）
    → FirestoreEmployeeRepository（Firestore 操作）
    → SearchSyncService（OpenSearch 同期, Phase 3）
```

### DepartmentService — Phase 2

**役割**: 部署マスターの CRUD を管理する

- 部署の一覧・作成・更新・削除
- 管理者のみ更新・削除を許可

### SkillService — Phase 2

**役割**: スキルマスターの CRUD を管理する

- スキルの一覧・作成・更新・削除（カテゴリ管理含む）
- 管理者のみ更新・削除を許可

### SearchSyncService — Phase 3

**役割**: Firestore への書き込みと OpenSearch インデックスの同期を担当する

**設計ポイント（OpenSearch 後付け対応）**:
- `EmployeeService` 内の create / update / delete の後に同期処理を呼び出す
- OpenSearch が利用不可でも Firestore 操作は成功させる（非同期・障害許容）
- 将来的にはイベント駆動（Firestore Trigger → Cloud Functions）に移行可能な設計

```
EmployeeService.create(data)
  → FirestoreRepository.create(data)  ← 必ず実行
  → SearchSyncService.syncOnCreate(employee)  ← 非同期・障害許容
```

---

## サービス間コミュニケーション

```
[フロントエンド]
  Redux AsyncThunk
    → employeeRepository（API クライアント）
      → Node.js API: POST /api/v1/employees
        → authMiddleware → EmployeeService
          → FirestoreRepository
          → SearchSyncService（Phase 3）

[認証フロー]
  Firebase Auth SDK（フロントエンド）
    → Google 認証
    → ID トークン取得
    → Node.js API リクエストヘッダーに付与
    → authMiddleware で検証

[検索フロー（Phase 3）]
  SearchBar（フロントエンド）
    → searchRepository
      → Node.js API: GET /api/v1/search?q=...
        → SearchService → OpenSearch クエリ
```

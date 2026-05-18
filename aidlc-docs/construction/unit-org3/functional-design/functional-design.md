# Functional Design — Unit Org-3: Org Management UI

**作成日**: 2026-05-17
**前提**: Unit Org-2 完了（認証フロー・CreateOrgPage・ProtectedRoute 3段階ガード）

---

## 概要

Unit Org-3 は「組織に入った後の UI 整備」を担う。管理者が社員を事前登録でき、pending 状態の社員が視覚的に識別でき、組織設定ページでロゴ・名称を編集できる。さらにサイドバーに組織情報を表示する。

---

## ビジネスロジック定義

### BL-ORG3-01: 事前登録

管理者が、まだ Google アカウントで参加していない人を先にシステムに登録する。

```
入力: name, email（最低限）
処理:
  1. POST /api/v1/employees に { name, email, status: 'pending', uid: null } を送信
  2. organizationId はサーバー側で req.user.organizationId から付与（Unit Org-1 実装済み）
  3. department / position / employmentType / joinedAt は空文字またはデフォルト値で送信
完了後: 社員一覧にリダイレクト（一覧で pending バッジ確認）
```

**権限**: admin ロールのみ実行可能

---

### BL-ORG3-02: pending バッジ表示

社員一覧で `status === 'pending'` の社員に「招待待ち」バッジを表示する。

```
表示条件: employee.status === 'pending'
表示場所: EmployeeTable・EmployeeGallery の StatusBadge
ステータスフィルタ: 既存フィルタには 'pending' を追加しない（デフォルトで表示）
```

---

### BL-ORG3-03: 組織設定

管理者が組織名・ロゴを編集できる。

```
取得: GET /api/v1/organizations/:orgId（ページ表示時）
更新: PUT /api/v1/organizations/:orgId（フォーム送信時）
  - 組織名: 必須・空不可
  - ロゴ: 任意・変更する場合は Storage にアップロードしてから URL を送信
権限: admin ロールのみ
```

---

### BL-ORG3-04: ヘッダー組織情報表示

Layout のサイドバーヘッダーに組織名・ロゴを表示する。

```
データ源: Redux state.organization.currentOrganization
取得タイミング: Layout マウント時に dispatch(fetchOrganization(orgId)) を呼ぶ
  - orgId は state.auth.user の Firebase カスタムクレームから取得
  - ただしフロントエンドは organizationId クレームを持たないため、
    組織作成/ログイン直後に organizationSlice に保存されている値を利用する
表示内容:
  - ロゴあり: 丸形ロゴ画像
  - ロゴなし: 組織名の頭文字をアイコン表示
  - 組織名テキスト
```

---

## 画面・コンポーネント設計

### EmployeeCreatePage（変更）— タブ追加

```
既存タブ構成:
  - フォームで1件登録（変更なし）
  - CSVで一括登録（変更なし）

追加タブ:
  - 事前登録（新規）

事前登録タブの UI:
  - name フィールド（必須）
  - email フィールド（必須・メール形式）
  - 「事前登録する」ボタン
  - 説明テキスト: 「このメールアドレスで Google ログインすると自動で組織に参加します」

表示条件: admin ロールのみタブを表示
```

---

### StatusBadge（変更）— pending 対応

```
追加スタイル:
  pending: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:ring-sky-900'

追加ラベル（employeeLabels.ts）:
  pending: '招待待ち'
```

---

### OrgSettingsPage（新規）— `/admin/organization`

```
表示条件: admin ロールのみアクセス可（ProtectedRoute 内で useEffect でガード）

フォーム構成:
  - 現在のロゴプレビュー（ある場合）
  - LogoUpload コンポーネント（変更する場合のみアップロード）
  - 組織名入力フィールド（必須）
  - 「保存する」ボタン（二重送信防止）

送信フロー:
  1. ロゴがあれば先に Storage にアップロード → URL 取得
  2. PUT /api/v1/organizations/:orgId を呼ぶ
  3. dispatch(updateOrganization(...)) で Redux を更新
  4. 成功: 「更新しました」トースト or インラインメッセージ表示
```

---

### Layout（変更）— サイドバーヘッダーに組織情報追加

```
変更箇所: サイドバー上部の「HR 社員管理」エリア

変更後の表示:
  - ロゴあり:
    <img src={org.logoUrl} className="h-7 w-7 rounded-full object-cover" />
    <span>{org.name}</span>
  - ロゴなし（or ロード中）:
    既存の HR アイコン + 組織名 or「社員管理」（fallback）

データ取得:
  Layout マウント時に useEffect で fetchOrganization を dispatch
  orgId は organization.currentOrganization?.id が取得できない場合は、
  authService でサインイン時に取得した organizationId クレームを使う
  → 実装上: Layout は organization.currentOrganization を参照する
    初回はサインイン時点で createOrganization.fulfilled / initializeAuth.fulfilled で
    currentOrganization が設定されていることが前提
    → 未設定の場合は fetchOrganization の別の手段が必要

  補足: organizationId はカスタムクレームに含まれるが、フロントから直接読めるのは
  getIdTokenResult() のみ。Layout では都度呼ぶのはコスト高いため、
  createOrgPage で作成直後 / initializeAuth 後に別途 fetchOrganization を dispatch する設計とする。

  具体的実装:
    - CreateOrgPage: createOrganization.fulfilled 後に fetchOrganization(result.organization.id) を dispatch
    - initializeAuth.fulfilled 後に orgStatus === 'member' なら organizationId を特定して fetchOrganization を dispatch
    → ただし orgId がフロントでわからない問題がある

  シンプルな解決策:
    authService の handlePostSignIn で getIdTokenResult() を呼んでいる → organizationId クレームが取れる
    → AuthResult に organizationId?: string を追加して authSlice に保存
    → Layout で state.auth.organizationId を見て fetchOrganization を dispatch する
```

---

## AuthResult / authSlice への organizationId 追加

`handlePostSignIn` では既に `getIdTokenResult()` を呼んでおり `claims.organizationId` が取れる。
これを `AuthResult` と `authSlice` に追加することで Layout が利用できるようにする。

```
AuthResult の変更:
  organizationId?: string  // member の場合のみ設定

authSlice の変更:
  AuthState に organizationId?: string を追加
  initializeAuth.fulfilled / signInWithGoogle.fulfilled で更新
  setOrgStatus で 'member' になった場合: CreateOrgPage で organization.currentOrganization.id を参照可能
```

---

## AppRoutes 変更

```typescript
// 追加ルート（ProtectedRoute 内）
<Route path="/admin/organization" element={<OrgSettingsPage />} />
```

---

## Layout ナビゲーション変更

```
管理者メニューに追加:
  <NavLink to="/admin/organization" ...>
    <BuildingIcon />
    組織設定
  </NavLink>
```

---

## データフロー図

```
ログイン
  → initializeAuth.fulfilled
    → AuthState に organizationId セット
    → Layout マウント時 fetchOrganization(organizationId) を dispatch
      → organization.currentOrganization がセット
        → サイドバーに組織名・ロゴ表示

管理者が事前登録
  → POST /api/v1/employees { name, email, status: 'pending', uid: null, ... }
    → サーバー: organizationId を req.user.organizationId から付与して保存
      → EmployeeListPage に '招待待ち' バッジ表示

該当者が Google ログイン
  → handlePostSignIn → link-uid API
    → Firestore transaction: uid セット + status 'active' に更新
      → カスタムクレーム設定 → orgStatus: 'member'
```

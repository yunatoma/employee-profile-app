# デプロイ手順

## 構成

| コンポーネント | デプロイ先 | リージョン |
|-------------|-----------|----------|
| フロントエンド（React） | Firebase Hosting | グローバル |
| Node.js Express API | Google Cloud Run | asia-northeast1 |
| Firestore / Auth | Firebase | asia-northeast1 |

Firebase Hosting のリライトで `/api/v1/**` → Cloud Run に転送するため、
フロントエンドからは本番でも同一オリジンで API を叩ける。

---

## 初回セットアップ

### 1. GCP / Firebase CLI ログイン

```bash
gcloud auth login
gcloud config set project employee-profile-app-184e1

firebase login
```

### 2. Cloud Run サービスアカウントを作成

```bash
# サービスアカウント作成
gcloud iam service-accounts create employee-api-sa \
  --display-name "Employee API (Cloud Run)"

# Firestore アクセス権限を付与
gcloud projects add-iam-policy-binding employee-profile-app-184e1 \
  --member="serviceAccount:employee-api-sa@employee-profile-app-184e1.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

# Firebase Auth トークン検証権限を付与
gcloud projects add-iam-policy-binding employee-profile-app-184e1 \
  --member="serviceAccount:employee-api-sa@employee-profile-app-184e1.iam.gserviceaccount.com" \
  --role="roles/firebase.sdkAdminServiceAgent"
```

---

## バックエンドデプロイ（Cloud Run）

```bash
# プロジェクトルートから実行
gcloud run deploy employee-api \
  --source ./server \
  --region asia-northeast1 \
  --platform managed \
  --allow-unauthenticated \
  --service-account employee-api-sa@employee-profile-app-184e1.iam.gserviceaccount.com \
  --set-env-vars ALLOWED_ORIGIN=https://employee-profile-app-184e1.web.app \
  --min-instances 0 \
  --max-instances 3
```

> `--source ./server` を使うと Cloud Build が Dockerfile をビルドしてデプロイする。
> `GOOGLE_APPLICATION_CREDENTIALS` は不要（Cloud Run は自動で ADC を使用）。

### デプロイ後に Cloud Run の URL を確認

```bash
gcloud run services describe employee-api \
  --region asia-northeast1 \
  --format "value(status.url)"
```

---

## フロントエンドデプロイ（Firebase Hosting）

```bash
# ビルド
npm run build

# デプロイ
firebase deploy --only hosting
```

> `firebase.json` のリライト設定により、`/api/v1/**` は自動で Cloud Run に転送される。
> フロントエンドコードの変更は不要。

---

## Firestore ルールのデプロイ

```bash
firebase deploy --only firestore:rules
```

---

## 全体を一括デプロイする場合

```bash
# 1. バックエンド
gcloud run deploy employee-api --source ./server --region asia-northeast1 ...（上記参照）

# 2. フロントエンド + Firestore ルール
npm run build
firebase deploy
```

---

## 環境変数について

### Cloud Run（本番）

| 変数 | 値 | 設定方法 |
|-----|---|---------|
| `ALLOWED_ORIGIN` | `https://employee-profile-app-184e1.web.app` | `--set-env-vars` |
| `PORT` | `8080`（Cloud Run が自動設定） | 不要 |
| `GOOGLE_APPLICATION_CREDENTIALS` | 不要（ADC を使用） | 設定しない |

### フロントエンド（本番ビルド）

`.env.local` の `VITE_*` 変数はビルド時に埋め込まれるため、
本番用の値を `.env.local` に設定してから `npm run build` を実行すること。

---

## CI/CD（GitHub Actions + WIF/OIDC）

自動化は別途実装予定（WIF + OIDC 認証を使用）。

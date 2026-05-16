# デプロイ計画 - 確認事項

## 構成概要（Unit 2 時点の計画）

| コンポーネント | デプロイ先 |
|-------------|-----------|
| フロントエンド（React） | Firebase Hosting |
| Node.js Express API | Google Cloud Run |
| Firebase Auth / Firestore | Firebase（継続） |

---

## Q&A

**Q1. Google Cloud プロジェクトについて**

A. Firebase プロジェクトと同じ GCP プロジェクトを使う（推奨・費用節約）
B. 別の GCP プロジェクトを用意する

[Answer]:A

---

**Q2. Cloud Run のリージョンについて**

A. `asia-northeast1`（東京、Firestore と同じ）
B. `us-central1`（デフォルト）
C. その他

[Answer]:A

---

**Q3. カスタムドメインについて**

A. Firebase Hosting のデフォルトドメイン（`xxx.web.app`）でOK
B. 独自ドメインを使いたい

[Answer]:A

---

**Q4. Cloud Run の公開方法について**

A. 公開する（フロントエンドから直接 HTTPS で叩く）
B. Firebase Hosting のリライトで `/api/v1` → Cloud Run にプロキシする

[Answer]:B

---

**Q5. CI/CD について**

A. 手動デプロイ（コマンド実行）でOK
B. GitHub Actions で自動デプロイしたい

[Answer]:Bですが、サービスアカウントキーJSONをGitHubに保存せず、*Workload Identity Federation（WIF） + OIDC* を使って、GitHub ActionsからGoogle Cloudへ安全に自動デプロイする方法でやりたいです。私の方でやりたいので一旦ここはおいておいて下さい。
gcloud builds list --region=asia-northeast1 --limit=1 --format="value(id)" | xargs -I{} gcloud builds log {} --region=asia-northeast1 

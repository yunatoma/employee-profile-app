# 要件の明確化 質問ファイル

回答を分析したところ、2つの矛盾が見つかりました。
以下の質問にお答えください。

---

## 矛盾 1: Firebase の導入タイミング（Q2 vs Q3）

**Q2（A）で回答**: Firebase Authentication を MVP に含める
**Q3（C）で回答**: 現在のスタブページ（詳細・登録・編集）の実装完了のみ（Firebase は後で）

これらは矛盾しています。
「Firebase を後で」と「Firebase Auth を MVP に含める」は同時に成立しません。

### 明確化 Q1: MVP のゴールはどちらですか？

A) **フェーズ分け案（推奨）**:
   - Phase 1（MVP）= スタブページを完成させ、モックデータで CRUD を動かす
   - Phase 2 = Firebase（Auth + Firestore + Storage）を接続する

B) **Firebase 込み MVP 案**:
   - MVP = スタブページ完成 ＋ Firebase Auth ＋ Firestore 接続まで一気にやる
   - （Firebase を "後で" というのは誤りだった）

C) その他（[Answer]: の後に説明を記入）

[Answer]:A

---

## 矛盾 2: Node.js のタイミング（Q5 vs Q3）

**Q5（A）で回答**: Firebase + Node.js API の構成を MVP から含める
**Q3（C）で回答**: 現在のスタブページの実装完了のみ（Firebase は後で）

Q3 で「Firebase は後で」と回答されているのに、Q5 で「Node.js を MVP から含める」は整合しません。
Node.js バックエンドは通常 Firebase と同時か、それ以降に追加されます。

### 明確化 Q2: Node.js の位置づけはどちらですか？

A) **Node.js は OpenSearch のタイミングで追加**:
   - MVP（Phase 1）= スタブページ完成
   - Phase 2 = Firebase 接続
   - Phase 3 = Node.js + OpenSearch 検索機能

B) **Node.js は Firebase と同時に追加**:
   - MVP（Phase 1）= スタブページ完成
   - Phase 2 = Firebase ＋ Node.js API サーバー同時導入

C) **Node.js は最初から不要**（Firebase だけで完結させる）:
   - フロントエンドから Firestore に直接アクセスし、Node.js は使わない

D) その他（[Answer]: の後に説明を記入）

[Answer]:B

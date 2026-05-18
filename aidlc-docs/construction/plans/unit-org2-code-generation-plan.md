# Unit Org-2 Code Generation Plan

## 対象ファイル一覧

### フロントエンド（変更）
- [x] 1. `src/features/auth/types/user.ts` — OrgStatus 型追加
- [x] 2. `src/features/auth/api/authService.ts` — 全面改訂（users コレクション廃止 → link-uid API）
- [x] 3. `src/features/auth/slices/authSlice.ts` — orgStatus 追加、thunk 戻り値更新
- [x] 4. `src/features/auth/components/ProtectedRoute.tsx` — 3段階ガードに拡張

### フロントエンド（新規）
- [x] 5. `src/components/LogoUpload/LogoUpload.tsx` — ロゴアップロードコンポーネント
- [x] 6. `src/pages/CreateOrgPage.tsx` — 組織作成ページ（UX-02/03/04）

### フロントエンド（変更）
- [x] 7. `src/routes/AppRoutes.tsx` — /onboarding/new-org ルート追加

### サーバーサイド（変更）
- [x] 8. `server/src/index.ts` — SP-09 uid 一致検証追加
- [x] 9. `server/src/routes/organizations.ts` — SP-10 重複防止追加
- [x] 10. `server/src/scripts/reset-db.ts` — users コレクション削除追加

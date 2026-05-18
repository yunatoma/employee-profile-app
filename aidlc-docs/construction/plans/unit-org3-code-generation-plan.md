# Unit Org-3 Code Generation Plan

## 対象ファイル一覧

- [x] 1. `src/features/auth/types/user.ts` — AuthResult に organizationId? 追加
- [x] 2. `src/features/auth/api/authService.ts` — organizationId を AuthResult に含める
- [x] 3. `src/features/auth/slices/authSlice.ts` — organizationId? state 追加
- [x] 4. `src/utils/employeeLabels.ts` — pending: '招待待ち' 追加
- [x] 5. `src/components/ui/StatusBadge.tsx` — pending スタイル追加
- [x] 6. `src/pages/EmployeeCreatePage.tsx` — 事前登録タブ追加
- [x] 7. `src/pages/OrgSettingsPage.tsx` — 新規作成
- [x] 8. `src/components/layout/Layout.tsx` — 組織名・ロゴ表示 + 組織設定ナビ追加
- [x] 9. `src/routes/AppRoutes.tsx` — /admin/organization ルート追加

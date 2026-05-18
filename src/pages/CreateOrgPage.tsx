import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuth } from '../lib/firebase';
import { uploadLogo } from '../features/organizations/api/logoService';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { createOrganization, updateOrganization } from '../features/organizations/slices/organizationSlice';
import { setOrgStatus, setOrganizationId, setUserRole } from '../features/auth/slices/authSlice';
import type { AuthUser } from '../features/auth/types/user';
import { LogoUpload } from '../components/LogoUpload/LogoUpload';

export function CreateOrgPage() {
  const { user, orgStatus } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UX-04: リダイレクトガード
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
    if (orgStatus === 'member') navigate('/', { replace: true });
  }, [user, orgStatus, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return; // UX-02: 二重送信防止
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      // Step 1: 組織を作成（ロゴなし）
      const result = await dispatch(
        createOrganization({ name: name.trim(), creatorName: creatorName.trim() || undefined }),
      ).unwrap();

      // Step 2: SP-11 トークン強制リフレッシュ（organizationId・role クレームを取得）
      if (result.forceTokenRefresh) {
        const firebaseUser = firebaseAuth.currentUser;
        if (firebaseUser) {
          await firebaseUser.getIdToken(true);
          const tokenResult = await firebaseUser.getIdTokenResult();
          const newRole = tokenResult.claims.role as AuthUser['role'] | undefined;
          if (newRole) dispatch(setUserRole(newRole));
        }
      }

      dispatch(setOrgStatus('member'));
      dispatch(setOrganizationId(result.organization.id));

      // Step 3: UX-03 ロゴアップロード（トークンリフレッシュ後・失敗時続行）
      if (logoFile) {
        try {
          const logoUrl = await uploadLogo(result.organization.id, logoFile);
          await dispatch(updateOrganization({ orgId: result.organization.id, data: { logoUrl } })).unwrap();
        } catch (uploadErr) {
          console.warn('ロゴアップロード失敗（続行）:', uploadErr);
        }
      }

      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '組織の作成に失敗しました');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">組織を作成する</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          あなたが最初の管理者になります。
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              組織名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 株式会社サンプル"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              あなたの名前（任意）
            </label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="例: 山田 太郎"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              組織ロゴ（任意）
            </label>
            <LogoUpload
              onFileSelect={(file) => setLogoFile(file)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 text-sm transition-colors"
          >
            {submitting ? '作成中...' : '組織を作成する'}
          </button>
        </form>
      </div>
    </div>
  );
}

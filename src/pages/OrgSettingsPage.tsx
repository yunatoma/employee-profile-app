import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchOrganization, updateOrganization } from '../features/organizations/slices/organizationSlice';
import { LogoUpload } from '../components/LogoUpload/LogoUpload';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function OrgSettingsPage() {
  const { user, organizationId } = useAppSelector((state) => state.auth);
  const { currentOrganization, loading } = useAppSelector((state) => state.organization);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // admin のみアクセス可能
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // 組織情報を取得
  useEffect(() => {
    if (organizationId && !currentOrganization) {
      dispatch(fetchOrganization(organizationId));
    }
  }, [organizationId, currentOrganization, dispatch]);

  // 初期値を組織データからセット
  useEffect(() => {
    if (currentOrganization) {
      setName(currentOrganization.name);
    }
  }, [currentOrganization]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || !currentOrganization) return;
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let logoUrl: string | undefined;

      if (logoFile) {
        try {
          const logoRef = ref(storage, `organizations/${currentOrganization.id}/logo`);
          await uploadBytes(logoRef, logoFile);
          logoUrl = await getDownloadURL(logoRef);
        } catch (uploadErr) {
          console.warn('ロゴアップロード失敗（続行）:', uploadErr);
        }
      }

      await dispatch(
        updateOrganization({
          orgId: currentOrganization.id,
          data: { name: name.trim(), ...(logoUrl ? { logoUrl } : {}) },
        }),
      ).unwrap();

      setSuccessMessage('組織情報を更新しました');
      setLogoFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !currentOrganization) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">組織設定</h1>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              組織ロゴ
            </label>
            {currentOrganization?.logoUrl && !logoFile && (
              <img
                src={currentOrganization.logoUrl}
                alt="現在のロゴ"
                className="h-16 w-16 rounded-full object-cover mb-3 border border-gray-200 dark:border-gray-700"
              />
            )}
            <LogoUpload onFileSelect={(file) => setLogoFile(file)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              組織名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {successMessage && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 text-sm transition-colors"
          >
            {submitting ? '保存中...' : '保存する'}
          </button>
        </form>
      </div>
    </div>
  );
}

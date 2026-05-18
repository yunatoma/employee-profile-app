import { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  fetchAdminRequests,
  fetchMyRequests,
  createRequest,
  updateRequestStatus,
} from '../features/requests/slices/requestsSlice';
import type { MasterRequest, MasterRequestType } from '../features/requests/types/request';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// ---- ステータスバッジ ----------------------------------------

function StatusBadge({ status }: { status: MasterRequest['status'] }) {
  const map = {
    pending: { label: '申請中', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
    approved: { label: '承認済み', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
    rejected: { label: '却下', className: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function TypeBadge({ type }: { type: MasterRequestType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-400">
      {type === 'skill' ? 'スキル' : 'プロジェクト'}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ---- メンバー用：申請フォーム ----------------------------------------

function RequestForm({ skillCategories }: { skillCategories: { category: string; skills: string[] }[] }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [type, setType] = useState<MasterRequestType>('skill');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      await dispatch(
        createRequest({
          type,
          value: value.trim(),
          category: type === 'skill' ? category.trim() || undefined : undefined,
          reason: reason.trim() || undefined,
          requestedByName: user?.displayName ?? user?.email ?? '',
        }),
      ).unwrap();
      setValue('');
      setCategory('');
      setReason('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('申請の送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
      <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">追加申請</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 種別 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">申請の種類</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="skill"
                checked={type === 'skill'}
                onChange={() => { setType('skill'); setCategory(''); }}
                className="text-sky-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">スキル</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="project"
                checked={type === 'project'}
                onChange={() => setType('project')}
                className="text-sky-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">プロジェクト</span>
            </label>
          </div>
        </div>

        {/* スキルのカテゴリ */}
        {type === 'skill' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              カテゴリ <span className="text-gray-400 text-xs">（任意）</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={skillCategories.length > 0 ? `例: ${skillCategories[0].category}` : 'カテゴリ名を入力'}
              list="category-list"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <datalist id="category-list">
              {skillCategories.map((cat) => (
                <option key={cat.category} value={cat.category} />
              ))}
            </datalist>
          </div>
        )}

        {/* 追加したい値 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {type === 'skill' ? 'スキル名' : 'プロジェクト名'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={type === 'skill' ? '例: Next.js' : '例: ECサイトリニューアル'}
            required
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* 申請理由 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            申請理由 <span className="text-gray-400 text-xs">（任意）</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="追加が必要な理由や背景をお書きください"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
          />
        </div>

        {success && <p className="text-sm text-emerald-600 dark:text-emerald-400">申請を送信しました</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !value.trim()}
          className="rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 text-sm transition-colors"
        >
          {submitting ? '送信中...' : '申請する'}
        </button>
      </form>
    </div>
  );
}

// ---- メンバー用：自分の申請履歴 ----------------------------------------

function MyRequestsList() {
  const myList = useAppSelector((state) => state.requests.myList);

  if (myList.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">申請履歴はありません</p>;
  }

  return (
    <div className="space-y-2">
      {myList.map((req) => (
        <div
          key={req.id}
          className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <TypeBadge type={req.type} />
              <span className="text-sm font-medium text-gray-900 dark:text-white">{req.value}</span>
              {req.category && (
                <span className="text-xs text-gray-500 dark:text-gray-400">（{req.category}）</span>
              )}
            </div>
            {req.reason && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{req.reason}</p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(req.createdAt)}</p>
          </div>
          <StatusBadge status={req.status} />
        </div>
      ))}
    </div>
  );
}

// ---- 管理者用：申請一覧 ----------------------------------------

function AdminRequestsPanel() {
  const dispatch = useAppDispatch();
  const { adminList, loading, error } = useAppSelector((state) => state.requests);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    dispatch(fetchAdminRequests(filter === 'pending' ? 'pending' : undefined));
  }, [dispatch, filter]);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    setActionError(null);
    try {
      await dispatch(updateRequestStatus({ id, status })).unwrap();
    } catch {
      setActionError('操作に失敗しました。再度お試しください。');
    } finally {
      setProcessingId(null);
    }
  };

  const displayed = filter === 'pending'
    ? adminList.filter((r) => r.status === 'pending')
    : adminList;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">申請一覧</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            未処理のみ
          </button>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            すべて
          </button>
        </div>
      </div>

      {(error || actionError) && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error || actionError}
        </p>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : displayed.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filter === 'pending' ? '未処理の申請はありません' : '申請はありません'}
        </p>
      ) : (
        <div className="space-y-3">
          {displayed.map((req) => (
            <div
              key={req.id}
              className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <TypeBadge type={req.type} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{req.value}</span>
                    {req.category && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">（{req.category}）</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    申請者: {req.requestedByName} ・ {formatDate(req.createdAt)}
                  </p>
                  {req.reason && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{req.reason}</p>
                  )}
                </div>
                <StatusBadge status={req.status} />
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    disabled={processingId === req.id}
                    onClick={() => handleAction(req.id, 'approved')}
                    className="rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 transition-colors"
                  >
                    承認
                  </button>
                  <button
                    type="button"
                    disabled={processingId === req.id}
                    onClick={() => handleAction(req.id, 'rejected')}
                    className="rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30 disabled:opacity-50 text-xs font-medium px-3 py-1.5 transition-colors"
                  >
                    却下
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- RequestsPage ----------------------------------------

export function RequestsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { skillCategories } = useAppSelector((state) => state.settings);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      dispatch(fetchMyRequests());
    }
  }, [dispatch, isAdmin]);

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">申請管理</h1>
        <AdminRequestsPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">スキル・プロジェクト申請</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        スキルやプロジェクトの追加を管理者に申請できます。承認されると自動的にマスタへ反映されます。
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RequestForm skillCategories={skillCategories} />

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">申請履歴</h2>
          <MyRequestsList />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { createEmployee } from '../features/employees/slices/employeeSlice';
import { EmployeeForm } from '../features/employees/components/EmployeeForm/EmployeeForm';
import { EmployeeCsvImport } from '../features/employees/components/EmployeeCsvImport/EmployeeCsvImport';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { EmployeeFormValues } from '../features/employees/types/employee';

type Tab = 'form' | 'csv' | 'preregister';

export function EmployeeCreatePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.employees);
  const authUser = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<Tab>('form');
  const [csvImporting, setCsvImporting] = useState(false);

  // 事前登録フォーム state
  const [preEmail, setPreEmail] = useState('');
  const [preName, setPreName] = useState('');
  const [preSubmitting, setPreSubmitting] = useState(false);
  const [preError, setPreError] = useState<string | null>(null);

  useEffect(() => {
    if (authUser && authUser.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [authUser, navigate]);

  const newEmployeeId = useMemo(() => crypto.randomUUID(), []);

  const handleSubmit = async (values: EmployeeFormValues) => {
    const result = await dispatch(
      createEmployee({
        id: newEmployeeId,
        ...values,
      }),
    );

    if (createEmployee.fulfilled.match(result)) {
      navigate(`/employees/${result.payload.id}`);
    }
  };

  const handleCsvImport = async (rows: EmployeeFormValues[]) => {
    setCsvImporting(true);
    try {
      for (const values of rows) {
        await dispatch(
          createEmployee({
            id: crypto.randomUUID(),
            ...values,
          }),
        );
      }
      navigate('/employees');
    } finally {
      setCsvImporting(false);
    }
  };

  const handlePreRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preSubmitting) return;
    if (!preName.trim() || !preEmail.trim()) return;

    setPreSubmitting(true);
    setPreError(null);

    try {
      const result = await dispatch(
        createEmployee({
          id: crypto.randomUUID(),
          name: preName.trim(),
          email: preEmail.trim(),
          department: '',
          position: '',
          employmentType: 'full-time',
          status: 'pending',
          joinedAt: new Date().toISOString().split('T')[0],
          skills: [],
          profile: '',
        }),
      );

      if (createEmployee.fulfilled.match(result)) {
        navigate('/employees');
      } else {
        setPreError('事前登録に失敗しました');
      }
    } catch {
      setPreError('事前登録に失敗しました');
    } finally {
      setPreSubmitting(false);
    }
  };

  if (loading && activeTab === 'form') return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">社員を登録する</h1>
      {error && <ErrorMessage message={error} />}

      {/* タブ */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'form'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          フォームで1件登録
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('csv')}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            activeTab === 'csv'
              ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          CSVで一括登録
        </button>
        {authUser?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setActiveTab('preregister')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'preregister'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            事前登録
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        {activeTab === 'form' ? (
          <EmployeeForm mode="create" employeeId={newEmployeeId} onSubmit={handleSubmit} isLoading={loading} />
        ) : activeTab === 'csv' ? (
          <EmployeeCsvImport onImport={handleCsvImport} importing={csvImporting} />
        ) : (
          <div className="max-w-md space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">事前登録</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                このメールアドレスで Google ログインすると、自動で組織に参加します。
              </p>
            </div>
            <form onSubmit={handlePreRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={preName}
                  onChange={(e) => setPreName(e.target.value)}
                  placeholder="例: 山田 太郎"
                  disabled={preSubmitting}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={preEmail}
                  onChange={(e) => setPreEmail(e.target.value)}
                  placeholder="例: yamada@example.com"
                  disabled={preSubmitting}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              {preError && <p className="text-sm text-red-500">{preError}</p>}
              <button
                type="submit"
                disabled={preSubmitting || !preName.trim() || !preEmail.trim()}
                className="rounded-lg bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 text-sm transition-colors"
              >
                {preSubmitting ? '登録中...' : '事前登録する'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

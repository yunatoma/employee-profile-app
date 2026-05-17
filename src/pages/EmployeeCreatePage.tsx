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

type Tab = 'form' | 'csv';

export function EmployeeCreatePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.employees);
  const authUser = useAppSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState<Tab>('form');
  const [csvImporting, setCsvImporting] = useState(false);

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
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        {activeTab === 'form' ? (
          <EmployeeForm mode="create" employeeId={newEmployeeId} onSubmit={handleSubmit} isLoading={loading} />
        ) : (
          <EmployeeCsvImport onImport={handleCsvImport} importing={csvImporting} />
        )}
      </div>
    </div>
  );
}

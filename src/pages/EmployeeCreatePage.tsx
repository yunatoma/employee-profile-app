import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { createEmployee } from '../features/employees/slices/employeeSlice';
import { EmployeeForm } from '../features/employees/components/EmployeeForm/EmployeeForm';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { EmployeeFormValues } from '../features/employees/types/employee';

export function EmployeeCreatePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((state) => state.employees);
  const authUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (authUser && authUser.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [authUser, navigate]);

  const handleSubmit = async (values: EmployeeFormValues) => {
    const result = await dispatch(
      createEmployee({
        id: crypto.randomUUID(),
        ...values,
      }),
    );

    if (createEmployee.fulfilled.match(result)) {
      navigate(`/employees/${result.payload.id}`);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">社員を登録する</h1>
      {error && <ErrorMessage message={error} />}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <EmployeeForm mode="create" onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}

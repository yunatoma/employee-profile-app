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

  const handleSubmit = async (values: EmployeeFormValues) => {
    const skills = values.skills
      ? values.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const result = await dispatch(
      createEmployee({
        id: crypto.randomUUID(),
        ...values,
        skills,
      }),
    );

    if (createEmployee.fulfilled.match(result)) {
      navigate(`/employees/${result.payload.id}`);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">社員を登録する</h1>
      {error && <ErrorMessage message={error} />}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <EmployeeForm mode="create" onSubmit={handleSubmit} isLoading={loading} />
      </div>
    </div>
  );
}

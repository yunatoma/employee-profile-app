import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  fetchEmployeeById,
  updateEmployee,
} from '../features/employees/slices/employeeSlice';
import { EmployeeForm } from '../features/employees/components/EmployeeForm/EmployeeForm';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import type { EmployeeFormValues } from '../features/employees/types/employee';

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedEmployee, loading, error } = useAppSelector(
    (state) => state.employees,
  );
  const authUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (id) dispatch(fetchEmployeeById(id));
  }, [dispatch, id]);

  const handleSubmit = async (values: EmployeeFormValues) => {
    if (!selectedEmployee) return;

    const result = await dispatch(
      updateEmployee({ ...selectedEmployee, ...values }),
    );

    if (updateEmployee.fulfilled.match(result)) {
      navigate(`/employees/${selectedEmployee.id}`);
    }
  };

  if (loading || !selectedEmployee) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const isAdmin = authUser?.role === 'admin';
  const isOwnProfile = authUser?.email === selectedEmployee.email;

  if (!isAdmin && !isOwnProfile) {
    return <ErrorMessage message="このプロフィールを編集する権限がありません" />;
  }

  const initialValues: Partial<EmployeeFormValues> = {
    name: selectedEmployee.name,
    email: selectedEmployee.email,
    department: selectedEmployee.department,
    position: selectedEmployee.position,
    employmentType: selectedEmployee.employmentType,
    status: selectedEmployee.status,
    joinedAt: selectedEmployee.joinedAt,
    skills: selectedEmployee.skills,
    profile: selectedEmployee.profile,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">社員情報を編集する</h1>
      {error && <ErrorMessage message={error} />}
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <EmployeeForm
          mode="edit"
          initialValues={initialValues}
          editingEmployee={selectedEmployee}
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </div>
    </div>
  );
}

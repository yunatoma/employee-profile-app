import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  fetchEmployeeById,
  retireEmployee,
  deleteEmployee,
} from '../features/employees/slices/employeeSlice';
import { EmployeeProfile } from '../features/employees/components/EmployeeProfile/EmployeeProfile';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selectedEmployee, loading, error } = useAppSelector(
    (state) => state.employees,
  );
  const authUser = useAppSelector((state) => state.auth.user);

  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchEmployeeById(id));
  }, [dispatch, id]);

  const handleRetire = async () => {
    if (!selectedEmployee) return;
    await dispatch(retireEmployee(selectedEmployee.id));
    setRetireDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedEmployee) return;
    await dispatch(deleteEmployee(selectedEmployee.id));
    navigate('/employees');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!selectedEmployee) return <ErrorMessage message="社員情報が見つかりません" />;

  const isAdmin = authUser?.role === 'admin';
  const isOwnProfile = authUser?.email === selectedEmployee.email;
  const canEdit = isAdmin || isOwnProfile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">社員詳細</h1>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              to={`/employees/${selectedEmployee.id}/edit`}
              data-testid="employee-detail-edit-button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800"
            >
              編集
            </Link>
          )}
          {isAdmin && selectedEmployee.status !== 'retired' && (
            <button
              onClick={() => setRetireDialogOpen(true)}
              data-testid="employee-detail-retire-button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800"
            >
              退職処理
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleteDialogOpen(true)}
              data-testid="employee-detail-delete-button"
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
            >
              完全削除
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <EmployeeProfile employee={selectedEmployee} />
      </div>

      <ConfirmDialog
        isOpen={retireDialogOpen}
        title="退職処理の確認"
        message={`${selectedEmployee.name} さんを退職済みにしますか？この操作は編集で元に戻せます。`}
        confirmLabel="退職処理を実行"
        onConfirm={handleRetire}
        onCancel={() => setRetireDialogOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="完全削除の確認"
        message={`${selectedEmployee.name} さんのデータを完全に削除します。この操作は取り消せません。`}
        confirmLabel="完全に削除する"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        variant="danger"
      />
    </div>
  );
}

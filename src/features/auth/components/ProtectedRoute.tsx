import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

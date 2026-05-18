import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/useAppSelector';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, orgStatus } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // 1. 認証初期化中 または orgStatus 確定待ち → スピナー（UX-01）
  if (loading || orgStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // 2. 未ログイン → /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. 組織未所属 → オンボーディング
  if (orgStatus === 'no-org') {
    return <Navigate to="/onboarding/new-org" replace />;
  }

  return <>{children}</>;
}

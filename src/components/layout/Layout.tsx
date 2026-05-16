import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { signOut } from '../../features/auth/slices/authSlice';

export function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(signOut());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 shrink-0 bg-white shadow-sm">
        <div className="px-6 py-5">
          <p className="text-lg font-bold text-gray-900">社員管理</p>
        </div>
        <nav aria-label="メインナビゲーション" className="px-3 pb-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            ダッシュボード
          </NavLink>
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `mt-1 flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            社員一覧
          </NavLink>
          <NavLink
            to="/employees/new"
            className={({ isActive }) =>
              `mt-1 flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            社員を登録する
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
      <div className="fixed bottom-4 right-4 flex items-center gap-3">
        {user && (
          <span className="text-sm text-gray-600">{user.displayName}</span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          data-testid="layout-logout-button"
          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50"
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}

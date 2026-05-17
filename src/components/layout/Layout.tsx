import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { signOut } from '../../features/auth/slices/authSlice';
import { useDarkMode } from '../../hooks/useDarkMode';

function SunIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-5-5M9 20H4v-2a4 4 0 015-5m6-4a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function OrgIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <rect x="2" y="16" width="6" height="4" rx="1" />
      <rect x="9" y="16" width="6" height="4" rx="1" />
      <rect x="16" y="16" width="6" height="4" rx="1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v4M5 16v-3a1 1 0 011-1h12a1 1 0 011 1v3" />
    </svg>
  );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
  }`;

export function Layout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { dark, toggle } = useDarkMode();

  const handleLogout = async () => {
    await dispatch(signOut());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* サイドバー */}
      <aside className="flex h-full w-60 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {/* ロゴ */}
        <div className="flex h-14 items-center border-b border-gray-200 px-5 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500">
              <span className="text-xs font-bold text-white">HR</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">社員管理</span>
          </div>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 px-3 py-4">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
            メニュー
          </p>
          <NavLink to="/" end className={navLinkClass}>
            <GridIcon />
            ダッシュボード
          </NavLink>
          <NavLink to="/employees" className={navLinkClass}>
            <UsersIcon />
            社員一覧
          </NavLink>
          <NavLink to="/org" className={navLinkClass}>
            <OrgIcon />
            組織図
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/employees/new" className={navLinkClass}>
              <PlusIcon />
              社員を登録する
            </NavLink>
          )}
        </nav>

        {/* ユーザーエリア */}
        <div className="border-t border-gray-200 p-3 dark:border-gray-800">
          {user && (
            <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900">
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {user.displayName.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-900 dark:text-white">{user.displayName}</p>
                <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                  {user.role === 'admin' ? '管理者' : '一般ユーザー'}
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={toggle}
              title={dark ? 'ライトモード' : 'ダークモード'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              data-testid="layout-logout-button"
              className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              ログアウト
            </button>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="mx-auto max-w-7xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

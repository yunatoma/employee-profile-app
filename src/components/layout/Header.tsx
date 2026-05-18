import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { signOut } from '../../features/auth/slices/authSlice';
import { useDarkMode } from '../../hooks/useDarkMode';

const routeTitles: Record<string, string> = {
  '/': 'ダッシュボード',
  '/employees': '社員一覧',
  '/employees/new': '社員登録',
  '/org': '組織図',
  '/profile': 'マイプロフィール',
  '/settings': 'マスタ設定',
  '/admin/organization': '組織設定',
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith('/employees/') && pathname.endsWith('/edit')) return '社員情報編集';
  if (pathname.startsWith('/employees/')) return '社員詳細';
  return '';
}

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

function UserEditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
    </svg>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { dark, toggle } = useDarkMode();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const title = getPageTitle(pathname);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await dispatch(signOut());
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-8 dark:border-gray-800 dark:bg-gray-900">
      <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>

      {user && (
        <div className="flex items-center gap-2">
          {/* ダークモード切り替え */}
          <button
            type="button"
            onClick={toggle}
            title={dark ? 'ライトモード' : 'ダークモード'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* ユーザーメニュー */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900">
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {user.displayName.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.displayName}</span>
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {/* ユーザー情報 */}
                <div className="border-b border-gray-100 px-4 py-2.5 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{user.displayName}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {user.role === 'admin' ? '管理者' : 'メンバー'}
                  </p>
                </div>

                {/* メニュー項目 */}
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <UserEditIcon />
                  プロフィールを編集
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  data-testid="layout-logout-button"
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <LogoutIcon />
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

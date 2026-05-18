import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { fetchSettings } from '../../features/settings/slices/settingsSlice';
import { fetchOrganization } from '../../features/organizations/slices/organizationSlice';
import { AIChatButton } from '../../features/aiChat/components/AIChatButton/AIChatButton';
import { Header } from './Header';

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

function SettingsIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}


const makeNavLinkClass = (collapsed: boolean) =>
  ({ isActive }: { isActive: boolean }) =>
    `flex items-center rounded-lg py-2 text-sm font-medium transition-colors ${
      collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
    } ${
      isActive
        ? 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
    }`;

export function Layout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const organizationId = useAppSelector((state) => state.auth.organizationId);
  const currentOrganization = useAppSelector((state) => state.organization.currentOrganization);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (organizationId && !currentOrganization) {
      dispatch(fetchOrganization(organizationId));
    }
  }, [organizationId, currentOrganization, dispatch]);

  const navLinkClass = makeNavLinkClass(collapsed);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* サイドバー */}
      <aside
        className={`flex h-full shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* 組織ヘッダー */}
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="サイドバーを開く"
            className="flex h-14 w-full items-center justify-center border-b border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
          >
            {currentOrganization?.logoUrl ? (
              <img src={currentOrganization.logoUrl} alt="組織ロゴ" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500">
                <span className="text-xs font-bold text-white">
                  {currentOrganization ? currentOrganization.name.charAt(0) : 'HR'}
                </span>
              </div>
            )}
          </button>
        ) : (
          <div className="flex h-14 items-center justify-between border-b border-gray-200 px-3 dark:border-gray-800">
            <div className="flex items-center gap-2 min-w-0">
              {currentOrganization?.logoUrl ? (
                <img src={currentOrganization.logoUrl} alt="組織ロゴ" className="h-7 w-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sky-500">
                  <span className="text-xs font-bold text-white">
                    {currentOrganization ? currentOrganization.name.charAt(0) : 'HR'}
                  </span>
                </div>
              )}
              <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {currentOrganization?.name ?? '社員管理'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              title="サイドバーを閉じる"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <ChevronLeftIcon />
            </button>
          </div>
        )}

        {/* ナビゲーション */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 px-2 py-4">
          {!collapsed && (
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600">
              メニュー
            </p>
          )}
          <NavLink to="/" end className={navLinkClass} title={collapsed ? 'ダッシュボード' : undefined}>
            <GridIcon />
            {!collapsed && 'ダッシュボード'}
          </NavLink>
          <NavLink to="/employees" className={navLinkClass} title={collapsed ? '社員一覧' : undefined}>
            <UsersIcon />
            {!collapsed && '社員一覧'}
          </NavLink>
          <NavLink to="/org" className={navLinkClass} title={collapsed ? '組織図' : undefined}>
            <OrgIcon />
            {!collapsed && '組織図'}
          </NavLink>
          <NavLink to="/profile" className={navLinkClass} title={collapsed ? 'マイプロフィール' : undefined}>
            <UserCircleIcon />
            {!collapsed && 'マイプロフィール'}
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/employees/new" className={navLinkClass} title={collapsed ? '社員を登録する' : undefined}>
              <PlusIcon />
              {!collapsed && '社員を登録する'}
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/settings" className={navLinkClass} title={collapsed ? 'マスタ設定' : undefined}>
              <SettingsIcon />
              {!collapsed && 'マスタ設定'}
            </NavLink>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin/organization" className={navLinkClass} title={collapsed ? '組織設定' : undefined}>
              <BuildingIcon />
              {!collapsed && '組織設定'}
            </NavLink>
          )}
        </nav>

        {/* 展開ボタン（折り畳み時のみ） */}
        {collapsed && (
          <div className="border-t border-gray-200 p-2 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              title="サイドバーを開く"
              className="flex h-8 w-full items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </aside>

      {/* メインコンテンツ */}
      <main className="flex flex-col flex-1 h-full overflow-y-auto">
        <Header />
        <div className="mx-auto w-full max-w-screen-2xl p-8">
          <Outlet />
        </div>
      </main>

      {/* AI チャット（ログイン済みユーザーのみ） */}
      {user && <AIChatButton />}
    </div>
  );
}

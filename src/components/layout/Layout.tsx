import { NavLink, Outlet } from 'react-router-dom';

export function Layout() {
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
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchEmployees } from '../features/employees/slices/employeeSlice';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDarkMode } from '../hooks/useDarkMode';
import type { Employee } from '../features/employees/types/employee';

// ---- 定数 ----
const CARD_H = 76;
const CARD_GAP = 16;
const CONNECTOR_W = 80;
const MEMBER_CARD_H = 64;
const MEMBER_CARD_GAP = 12;
const MEMBER_LABEL_H = 28;

// ---- ユーティリティ ----
function memberBlockH(members: Employee[]) {
  return (
    MEMBER_LABEL_H +
    MEMBER_CARD_GAP +
    members.length * MEMBER_CARD_H +
    Math.max(0, members.length - 1) * MEMBER_CARD_GAP
  );
}

// ---- サブコンポーネント ----
function RootCard({ count }: { count: number }) {
  return (
    <div
      className="flex w-52 items-center gap-3 rounded-xl bg-white px-4 py-3 shadow ring-2 ring-sky-200 dark:bg-gray-900 dark:ring-sky-800"
      style={{ height: CARD_H }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
        全社
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">全社員</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{count}名</p>
      </div>
    </div>
  );
}

function DeptCard({
  dept,
  members,
  selected,
  onClick,
}: {
  dept: string;
  members: Employee[];
  selected: boolean;
  onClick: () => void;
}) {
  const rep = members[0];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-52 shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left shadow-sm ring-1 transition-all dark:bg-gray-900 ${
        selected
          ? 'bg-sky-50 ring-2 ring-sky-400 dark:bg-sky-950/40 dark:ring-sky-500'
          : 'bg-white ring-gray-200 hover:ring-sky-300 dark:ring-gray-800 dark:hover:ring-sky-700'
      }`}
      style={{ height: CARD_H }}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-lg dark:bg-sky-900">
        {rep?.avatarUrl ? (
          <img src={rep.avatarUrl} alt={rep.name} className="h-full w-full object-cover" />
        ) : (
          <span>👤</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{dept}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{members.length}名</p>
      </div>
    </button>
  );
}

function MemberCard({ employee }: { employee: Employee }) {
  return (
    <Link
      to={`/employees/${employee.id}`}
      className="flex w-56 shrink-0 items-center gap-3 rounded-xl bg-white px-4 py-2.5 shadow-sm ring-1 ring-gray-200 hover:ring-sky-300 dark:bg-gray-900 dark:ring-gray-800 dark:hover:ring-sky-700"
      style={{ height: MEMBER_CARD_H }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm dark:bg-sky-900">
        {employee.avatarUrl ? (
          <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
        ) : (
          <span>👤</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{employee.name}</p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">{employee.position}</p>
      </div>
      <StatusBadge status={employee.status} />
    </Link>
  );
}

/** 部署カードの右に展開されるメンバーツリー（行の高さ内に収める） */
function InlineMembers({
  dept,
  members,
  rowH,
  dark,
}: {
  dept: string;
  members: Employee[];
  rowH: number;
  dark: boolean;
}) {
  const memberUnit = MEMBER_CARD_H + MEMBER_CARD_GAP;
  const blockH = memberBlockH(members);
  // ブロックを行内で縦中央揃え
  const blockTopY = Math.max(0, (rowH - blockH) / 2);

  const deptCenterY = rowH / 2;
  const membersCenterY = blockTopY + blockH / 2;

  const memberCY = (i: number) =>
    blockTopY + MEMBER_LABEL_H + MEMBER_CARD_GAP + i * memberUnit + MEMBER_CARD_H / 2;

  const spineX = CONNECTOR_W / 2;
  const lineColor = dark ? '#374151' : '#d1d5db';

  return (
    <div className="flex items-start">
      <svg width={CONNECTOR_W} height={rowH} className="shrink-0 overflow-visible">
        {/* 部署カード中心 → スパイン水平線 */}
        <line x1={0} y1={deptCenterY} x2={spineX} y2={deptCenterY} stroke={lineColor} strokeWidth={2} />
        {/* スパイン → メンバーブロック中心への垂直線 */}
        <line x1={spineX} y1={deptCenterY} x2={spineX} y2={membersCenterY} stroke={lineColor} strokeWidth={2} />
        {/* メンバー間のスパイン縦線 */}
        {members.length > 1 && (
          <line
            x1={spineX} y1={memberCY(0)}
            x2={spineX} y2={memberCY(members.length - 1)}
            stroke={lineColor} strokeWidth={2}
          />
        )}
        {/* 各メンバーへの横枝 */}
        {members.map((_, i) => (
          <line
            key={i}
            x1={spineX} y1={memberCY(i)}
            x2={CONNECTOR_W} y2={memberCY(i)}
            stroke={lineColor} strokeWidth={2}
          />
        ))}
      </svg>

      {/* ラベル + メンバーカード */}
      <div className="flex flex-col" style={{ paddingTop: blockTopY }}>
        <div
          className="mb-3 flex items-center rounded-lg bg-sky-100 px-3 text-xs font-semibold text-sky-700 dark:bg-sky-950 dark:text-sky-400"
          style={{ height: MEMBER_LABEL_H }}
        >
          {dept}
        </div>
        <div className="flex flex-col" style={{ gap: MEMBER_CARD_GAP }}>
          {members.map((emp) => (
            <MemberCard key={emp.id} employee={emp} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- メインツリー ----
function OrgTree({
  departments,
  totalCount,
  dark,
}: {
  departments: [string, Employee[]][];
  totalCount: number;
  dark: boolean;
}) {
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(
    new Set(departments.length > 0 ? [departments[0][0]] : []),
  );

  const toggleDept = (dept: string) => {
    setSelectedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  // 各行の高さ（選択中は配下メンバーに合わせて拡張）
  const rowHeights = departments.map(([dept, members]) =>
    selectedDepts.has(dept) ? Math.max(CARD_H, memberBlockH(members)) : CARD_H,
  );

  const totalH =
    rowHeights.reduce((a, b) => a + b, 0) + Math.max(0, departments.length - 1) * CARD_GAP;

  // 各行の部署カード中心 Y（全体座標）
  const rowCenterYs = departments.map((_, i) => {
    const top = rowHeights.slice(0, i).reduce((a, b) => a + b, 0) + i * CARD_GAP;
    return top + rowHeights[i] / 2;
  });

  const rootCenterY = totalH / 2;
  const spineX = CONNECTOR_W / 2;
  const lineColor = dark ? '#374151' : '#d1d5db';

  return (
    <div className="flex items-start">
      {/* ルートカード */}
      <div style={{ marginTop: rootCenterY - CARD_H / 2 }}>
        <RootCard count={totalCount} />
      </div>

      {/* ルート → 部署 接続SVG */}
      <svg width={CONNECTOR_W} height={totalH} className="shrink-0 overflow-visible">
        <line x1={0} y1={rootCenterY} x2={spineX} y2={rootCenterY} stroke={lineColor} strokeWidth={2} />
        {departments.length > 1 && (
          <line
            x1={spineX} y1={rowCenterYs[0]}
            x2={spineX} y2={rowCenterYs[rowCenterYs.length - 1]}
            stroke={lineColor} strokeWidth={2}
          />
        )}
        {rowCenterYs.map((y, i) => (
          <line key={i} x1={spineX} y1={y} x2={CONNECTOR_W} y2={y} stroke={lineColor} strokeWidth={2} />
        ))}
      </svg>

      {/* 部署行リスト */}
      <div className="flex flex-col" style={{ gap: CARD_GAP }}>
        {departments.map(([dept, members], i) => (
          <div key={dept} className="flex items-center" style={{ height: rowHeights[i] }}>
            <DeptCard
              dept={dept}
              members={members}
              selected={selectedDepts.has(dept)}
              onClick={() => toggleDept(dept)}
            />
            {selectedDepts.has(dept) && (
              <InlineMembers dept={dept} members={members} rowH={rowHeights[i]} dark={dark} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- ページ ----
export function OrgChartPage() {
  const dispatch = useAppDispatch();
  const { employees, loading, error } = useAppSelector((state) => state.employees);
  const { dark } = useDarkMode();

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const activeEmployees = employees.filter((e) => e.status !== 'retired');

  const byDepartment = activeEmployees.reduce<Record<string, Employee[]>>((acc, e) => {
    if (!acc[e.department]) acc[e.department] = [];
    acc[e.department].push(e);
    return acc;
  }, {});

  const departments = Object.entries(byDepartment).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">組織図</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          部署カードをクリックするとメンバーが表示されます
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl bg-gray-50 p-10 dark:bg-gray-950">
        <OrgTree departments={departments} totalCount={activeEmployees.length} dark={dark} />
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchEmployees } from '../features/employees/slices/employeeSlice';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useDarkMode } from '../hooks/useDarkMode';
import type { Employee } from '../features/employees/types/employee';

// ─── 定数 ────────────────────────────────────────────
const CARD_H = 80;
const CARD_GAP = 12;
const CONN = 56;

// ─── ツリー型 ─────────────────────────────────────────
type OrgNode = {
  employee: Employee;
  children: OrgNode[];
};

// ─── 高さ計算ヘルパー ─────────────────────────────────
function colH(nodes: OrgNode[], sel: Set<string>): number {
  if (nodes.length === 0) return 0;
  return (
    nodes.reduce((s, n) => s + nodeH(n, sel), 0) +
    (nodes.length - 1) * CARD_GAP
  );
}

function nodeH(node: OrgNode, sel: Set<string>): number {
  if (!sel.has(node.employee.id) || node.children.length === 0) return CARD_H;
  return Math.max(CARD_H, colH(node.children, sel));
}

function childCenterYs(node: OrgNode, sel: Set<string>): number[] {
  const h = nodeH(node, sel);
  const chH = colH(node.children, sel);
  const offset = Math.max(0, (h - chH) / 2);
  let cum = 0;
  return node.children.map((c) => {
    const cH = nodeH(c, sel);
    const y = offset + cum + cH / 2;
    cum += cH + CARD_GAP;
    return y;
  });
}

// ─── ツリー構築（全社員横断） ─────────────────────────
function buildTree(emp: Employee, all: Employee[]): OrgNode {
  const reports = all.filter((e) => e.managerId === emp.id);
  return { employee: emp, children: reports.map((r) => buildTree(r, all)) };
}

// ─── 社員カード ───────────────────────────────────────
function EmployeeCard({
  employee,
  selected,
  hasChildren,
  onClick,
}: {
  employee: Employee;
  selected: boolean;
  hasChildren: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex w-48 shrink-0 cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 shadow-sm ring-1 transition-all select-none dark:bg-gray-900 ${
        selected
          ? 'bg-sky-50 ring-2 ring-sky-400 dark:bg-sky-950/40 dark:ring-sky-500'
          : 'bg-white ring-gray-200 hover:ring-sky-300 dark:ring-gray-800 dark:hover:ring-sky-700'
      }`}
      style={{ height: CARD_H }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm dark:bg-sky-900">
        {employee.avatarUrl ? (
          <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
        ) : (
          <span>👤</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{employee.name}</p>
        <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">{employee.position}</p>
        <p className="truncate text-[10px] text-sky-500 dark:text-sky-400">{employee.department}</p>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        {hasChildren && (
          <svg
            className={`h-3 w-3 text-gray-400 transition-transform ${selected ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        )}
        <Link
          to={`/employees/${employee.id}`}
          onClick={(e) => e.stopPropagation()}
          title="詳細を見る"
          className="flex h-5 w-5 items-center justify-center rounded text-gray-300 hover:bg-sky-100 hover:text-sky-500 dark:text-gray-600 dark:hover:bg-sky-900 dark:hover:text-sky-400"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ─── 1ノード（カード + 展開） ─────────────────────────
function OrgItem({
  node,
  selected,
  onToggle,
  lineColor,
}: {
  node: OrgNode;
  selected: Set<string>;
  onToggle: (id: string) => void;
  lineColor: string;
}) {
  const isExpanded = selected.has(node.employee.id) && node.children.length > 0;
  const h = nodeH(node, selected);
  const chH = isExpanded ? colH(node.children, selected) : 0;
  const childYs = isExpanded ? childCenterYs(node, selected) : [];
  const spineX = CONN / 2;

  return (
    <div className="flex" style={{ height: h }}>
      {/* カード（縦中央揃え） */}
      <div style={{ marginTop: (h - CARD_H) / 2 }}>
        <EmployeeCard
          employee={node.employee}
          selected={selected.has(node.employee.id)}
          hasChildren={node.children.length > 0}
          onClick={() => onToggle(node.employee.id)}
        />
      </div>

      {/* コネクタ + 子ノード */}
      {isExpanded && (
        <>
          <svg width={CONN} height={h} className="shrink-0 overflow-visible">
            <line x1={0} y1={h / 2} x2={spineX} y2={h / 2} stroke={lineColor} strokeWidth={1.5} />
            <line
              x1={spineX} y1={Math.min(h / 2, childYs[0])}
              x2={spineX} y2={Math.max(h / 2, childYs.at(-1)!)}
              stroke={lineColor} strokeWidth={1.5}
            />
            {childYs.map((y, i) => (
              <line key={i} x1={spineX} y1={y} x2={CONN} y2={y} stroke={lineColor} strokeWidth={1.5} />
            ))}
          </svg>

          {/* 子ノード列（縦中央揃え） */}
          <div
            className="flex flex-col"
            style={{ marginTop: Math.max(0, (h - chH) / 2), gap: CARD_GAP }}
          >
            {node.children.map((child) => (
              <OrgItem
                key={child.employee.id}
                node={child}
                selected={selected}
                onToggle={onToggle}
                lineColor={lineColor}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── ルートツリー ─────────────────────────────────────
function OrgRoots({ roots, dark }: { roots: OrgNode[]; dark: boolean }) {
  // ルート（社長）を最初から展開
  const [selected, setSelected] = useState<Set<string>>(
    new Set(roots.map((r) => r.employee.id)),
  );
  const lineColor = dark ? '#374151' : '#d1d5db';

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="flex flex-col" style={{ gap: CARD_GAP }}>
      {roots.map((node) => (
        <OrgItem
          key={node.employee.id}
          node={node}
          selected={selected}
          onToggle={toggle}
          lineColor={lineColor}
        />
      ))}
    </div>
  );
}

// ─── ページ ───────────────────────────────────────────
export function OrgChartPage() {
  const dispatch = useAppDispatch();
  const { employees, loading, error } = useAppSelector((state) => state.employees);
  const { dark } = useDarkMode();

  useEffect(() => { dispatch(fetchEmployees()); }, [dispatch]);

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status !== 'retired'),
    [employees],
  );

  // managerId が全社員の中に存在しない = ルート（社長）
  const roots = useMemo(() => {
    const allIds = new Set(activeEmployees.map((e) => e.id));
    return activeEmployees
      .filter((e) => !e.managerId || !allIds.has(e.managerId))
      .map((r) => buildTree(r, activeEmployees));
  }, [activeEmployees]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">組織図</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          社員カードをクリックして展開・折りたたみができます
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl bg-gray-50 p-10 dark:bg-gray-950">
        <div className="w-max">
          {roots.length > 0 ? (
            <OrgRoots roots={roots} dark={dark} />
          ) : (
            <p className="text-sm text-gray-400">社員データがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}

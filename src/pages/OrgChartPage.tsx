import {
  useEffect,
  useState,
  useMemo,
  useContext,
  createContext,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchEmployees, updateEmployee } from '../features/employees/slices/employeeSlice';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { useDarkMode } from '../hooks/useDarkMode';
import type { Employee } from '../features/employees/types/employee';

// ─── 定数 ────────────────────────────────────────────
const CARD_H = 80;
const CARD_GAP = 12;
const CONN = 56;
const DRAG_THRESHOLD = 5;
const HOVER_EXPAND_DELAY = 600; // ms

// ─── ツリー型 ─────────────────────────────────────────
type OrgNode = {
  employee: Employee;
  children: OrgNode[];
};

// ─── 編集コンテキスト ─────────────────────────────────
type EditCtx = {
  editMode: boolean;
  draggedId: string | null;
  overId: string | null;
  invalidIds: Set<string>;
  onPointerDown: (id: string, e: React.PointerEvent) => void;
  onPointerEnter: (id: string) => void;
  onPointerLeave: (id: string) => void;
  onPointerUp: (id: string) => void;
  onSavePosition: (id: string, position: string) => void;
  positions: string[];
};

const OrgEditContext = createContext<EditCtx>({
  editMode: false,
  draggedId: null,
  overId: null,
  invalidIds: new Set(),
  onPointerDown: () => {},
  onPointerEnter: () => {},
  onPointerLeave: () => {},
  onPointerUp: () => {},
  onSavePosition: () => {},
  positions: [],
});

// ─── 子孫IDを取得（循環参照防止） ────────────────────
function getDescendantIds(nodeId: string, all: Employee[]): Set<string> {
  const result = new Set<string>();
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const e of all) {
      if (e.managerId === current && !result.has(e.id)) {
        result.add(e.id);
        queue.push(e.id);
      }
    }
  }
  return result;
}

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

// ─── ツリー構築 ───────────────────────────────────────
function buildTree(emp: Employee, all: Employee[]): OrgNode {
  const reports = all.filter((e) => e.managerId === emp.id);
  return { employee: emp, children: reports.map((r) => buildTree(r, all)) };
}

// ─── 役職ピッカー ─────────────────────────────────────
type PickerAnchor = { x: number; y: number; width: number };

function PositionPicker({
  current,
  positions,
  anchor,
  onSelect,
  onClose,
}: {
  current: string;
  positions: string[];
  anchor: PickerAnchor;
  onSelect: (pos: string) => void;
  onClose: () => void;
}) {
  const [showNew, setShowNew] = useState(false);
  const [newVal, setNewVal] = useState('');

  const commitNew = () => {
    const v = newVal.trim();
    if (v) onSelect(v);
    else onClose();
  };

  // 透明オーバーレイ（z-index: 9998）とドロップダウン本体（z-index: 9999）を重ねる。
  // ドロップダウンの方が前面なのでその領域のポインターイベントはオーバーレイに届かない。
  // 外側クリック時のみオーバーレイの onPointerDown が発火して閉じる。
  return createPortal(
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onPointerDown={onClose}
      />
      <div
        style={{ position: 'fixed', left: anchor.x, top: anchor.y, minWidth: Math.max(anchor.width, 160), zIndex: 9999 }}
        className="overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700"
      >
        <div className="max-h-52 overflow-y-auto py-1">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => onSelect(pos)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                pos === current
                  ? 'font-medium text-sky-600 dark:text-sky-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className={`h-3.5 w-3.5 shrink-0 ${pos === current ? 'opacity-100' : 'opacity-0'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              {pos}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700">
          {showNew ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5">
              <input
                autoFocus
                value={newVal}
                onChange={(e) => setNewVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitNew();
                  if (e.key === 'Escape') setShowNew(false);
                }}
                placeholder="新しい役職名…"
                className="min-w-0 flex-1 rounded bg-gray-50 px-2 py-1 text-xs text-gray-900 outline-none dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={commitNew}
                className="shrink-0 rounded bg-sky-500 px-2 py-0.5 text-[10px] font-medium text-white hover:bg-sky-600"
              >
                追加
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50 dark:text-gray-500 dark:hover:bg-gray-700"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新しい役職を追加
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── ドラッグゴースト ─────────────────────────────────
function DragGhost({ employee, x, y }: { employee: Employee; x: number; y: number }) {
  return (
    <div
      style={{ position: 'fixed', left: x + 16, top: y - 20, pointerEvents: 'none', zIndex: 9999 }}
      className="flex w-44 items-center gap-2 rounded-xl bg-white px-3 py-2.5 opacity-90 shadow-xl ring-2 ring-sky-400 dark:bg-gray-900"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm dark:bg-sky-900">
        {employee.avatarUrl ? (
          <img src={employee.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>👤</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{employee.name}</p>
        <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">{employee.position}</p>
      </div>
    </div>
  );
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
  const { editMode, draggedId, overId, invalidIds, onPointerDown, onPointerEnter, onPointerLeave, onPointerUp, onSavePosition, positions } =
    useContext(OrgEditContext);

  const [pickerAnchor, setPickerAnchor] = useState<PickerAnchor | null>(null);

  const openPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPickerAnchor({ x: rect.left, y: rect.bottom + 4, width: rect.width });
  };

  const selectPos = (pos: string) => {
    setPickerAnchor(null);
    if (pos !== employee.position) onSavePosition(employee.id, pos);
  };

  const isDragging = draggedId === employee.id;
  const isOver = overId === employee.id && draggedId !== null && draggedId !== employee.id;
  const isInvalid = isOver && invalidIds.has(employee.id);
  const isValid = isOver && !isInvalid;

  const ringClass = isValid
    ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-950/40'
    : isInvalid
    ? 'ring-2 ring-red-400 bg-red-50 dark:bg-red-950/40'
    : selected
    ? 'bg-sky-50 ring-2 ring-sky-400 dark:bg-sky-950/40 dark:ring-sky-500'
    : 'bg-white ring-gray-200 hover:ring-sky-300 dark:ring-gray-800 dark:hover:ring-sky-700';

  // ドロップ時のラベル（ドラッグ中かつホバー中のみ表示）
  const dropLabel = isValid
    ? hasChildren
      ? `${employee.name}と同じグループに配置`
      : `${employee.name}の部下として配置`
    : isInvalid
    ? '配置できません'
    : null;

  return (
    <div
      onPointerDown={editMode ? (e) => { e.preventDefault(); onPointerDown(employee.id, e); } : undefined}
      onPointerEnter={editMode ? () => onPointerEnter(employee.id) : undefined}
      onPointerLeave={editMode ? () => onPointerLeave(employee.id) : undefined}
      onPointerUp={editMode ? () => onPointerUp(employee.id) : undefined}
      onClick={onClick}
      className={`relative flex w-48 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 shadow-sm ring-1 transition-colors select-none dark:bg-gray-900
        ${editMode ? 'cursor-grab' : 'cursor-pointer'}
        ${isDragging ? 'opacity-30' : ''}
        ${ringClass}`}
      style={{ height: CARD_H, touchAction: 'none' }}
    >
      {dropLabel && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-medium shadow ${
            isValid
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
          style={{ top: CARD_H + 4, zIndex: 10 }}
        >
          {dropLabel}
        </div>
      )}
      {editMode && (
        <svg className="h-3.5 w-3.5 shrink-0 text-gray-500 dark:text-gray-400" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="9" cy="19" r="1.5" />
          <circle cx="15" cy="5" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="15" cy="19" r="1.5" />
        </svg>
      )}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm dark:bg-sky-900">
        {employee.avatarUrl ? (
          <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
        ) : (
          <span>👤</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{employee.name}</p>
        <p
          title={editMode ? 'クリックして役職を変更' : undefined}
          onPointerDown={editMode ? (e) => e.stopPropagation() : undefined}
          onClick={editMode ? openPicker : undefined}
          className={`truncate text-[11px] text-gray-500 dark:text-gray-400 ${editMode ? 'cursor-pointer rounded px-0.5 -mx-0.5 hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
        >
          {employee.position || <span className="text-gray-300 dark:text-gray-600 italic">未設定</span>}
        </p>
        {editMode && pickerAnchor && (
          <PositionPicker
            current={employee.position}
            positions={positions}
            anchor={pickerAnchor}
            onSelect={selectPos}
            onClose={() => setPickerAnchor(null)}
          />
        )}
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
        {!editMode && (
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
        )}
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

          {/* 子ノード列 */}
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

// ─── 編集サイドパネル ─────────────────────────────────
function OrgEditPanel({ employees }: { employees: Employee[] }) {
  const { onSavePosition, positions } = useContext(OrgEditContext);
  const [search, setSearch] = useState('');
  const [pickerState, setPickerState] = useState<{ emp: Employee; anchor: PickerAnchor } | null>(null);

  const managerMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const e of employees) m[e.id] = e.name;
    return m;
  }, [employees]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    );
  }, [employees, search]);

  const grouped = useMemo(() => {
    const g: Record<string, Employee[]> = {};
    for (const e of filtered) (g[e.department] ??= []).push(e);
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b, 'ja'));
  }, [filtered]);

  return (
    <div className="flex w-64 shrink-0 flex-col overflow-hidden rounded-xl bg-white ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
      {/* ヘッダー */}
      <div className="border-b border-gray-100 px-3 py-2.5 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">社員一覧</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">役職をクリックして変更</p>
      </div>

      {/* 検索 */}
      <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800">
        <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 ring-1 ring-gray-200 focus-within:ring-sky-400 dark:bg-gray-800 dark:ring-gray-700">
          <svg className="h-3 w-3 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="名前・役職・部署"
            className="min-w-0 flex-1 bg-transparent text-xs text-gray-900 outline-none dark:text-white placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="shrink-0 text-gray-300 hover:text-gray-500">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 社員リスト */}
      <div className="flex-1 overflow-y-auto">
        {grouped.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-400">該当する社員がいません</p>
        ) : (
          grouped.map(([dept, emps]) => (
            <div key={dept}>
              <p className="sticky top-0 bg-gray-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:bg-gray-800 dark:text-gray-500">
                {dept}
              </p>
              {emps.map((emp) => (
                <div key={emp.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm dark:bg-sky-900">
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-gray-900 dark:text-white">{emp.name}</p>
                    <button
                      onClick={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setPickerState({ emp, anchor: { x: rect.left, y: rect.bottom + 4, width: rect.width } });
                      }}
                      className="truncate text-left text-[11px] text-gray-500 underline decoration-dotted decoration-gray-400 hover:text-sky-500 dark:text-gray-400 dark:hover:text-sky-400"
                    >
                      {emp.position || <span className="italic text-gray-300 dark:text-gray-600">未設定</span>}
                    </button>
                  </div>
                  {emp.managerId && managerMap[emp.managerId] && (
                    <p className="max-w-[48px] shrink-0 truncate text-[10px] text-gray-300 dark:text-gray-600" title={`上司: ${managerMap[emp.managerId]}`}>
                      {managerMap[emp.managerId]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {pickerState && (
        <PositionPicker
          current={pickerState.emp.position}
          positions={positions}
          anchor={pickerState.anchor}
          onSelect={(pos) => { onSavePosition(pickerState.emp.id, pos); setPickerState(null); }}
          onClose={() => setPickerState(null)}
        />
      )}
    </div>
  );
}

// ─── ルートドロップゾーン ─────────────────────────────
function RootDropZone({ onDropRoot }: { onDropRoot: () => void }) {
  const { draggedId } = useContext(OrgEditContext);
  const [isOver, setIsOver] = useState(false);

  if (!draggedId) return null;

  return (
    <div
      onPointerEnter={() => setIsOver(true)}
      onPointerLeave={() => setIsOver(false)}
      onPointerUp={() => { onDropRoot(); setIsOver(false); }}
      className={`mb-4 flex items-center justify-center rounded-xl border-2 border-dashed py-3 text-sm transition-all
        ${isOver
          ? 'border-sky-400 bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400'
          : 'border-gray-300 text-gray-400 dark:border-gray-700 dark:text-gray-500'}`}
    >
      <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
      ここにドロップするとルートレベルに移動
    </div>
  );
}

// ─── ルートツリー（外から expand できるよう forwardRef） ─
type OrgRootsHandle = { expand: (id: string) => void };

const OrgRoots = forwardRef<
  OrgRootsHandle,
  { roots: OrgNode[]; dark: boolean; onDropRoot: () => void }
>(function OrgRoots({ roots, dark, onDropRoot }, ref) {
  const { editMode } = useContext(OrgEditContext);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(roots.map((r) => r.employee.id)),
  );
  const lineColor = dark ? '#374151' : '#d1d5db';

  // 外部からノードを展開するためのハンドル
  useImperativeHandle(ref, () => ({
    expand: (id: string) =>
      setSelected((prev) => (prev.has(id) ? prev : new Set([...prev, id]))),
  }), []);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div>
      {editMode && <RootDropZone onDropRoot={onDropRoot} />}
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
    </div>
  );
});

// ─── ページ ───────────────────────────────────────────
export function OrgChartPage() {
  const dispatch = useAppDispatch();
  const { employees, loading, error } = useAppSelector((state) => state.employees);
  const { user } = useAppSelector((state) => state.auth);
  const { dark } = useDarkMode();
  const isAdmin = user?.role === 'admin';

  const [editMode, setEditMode] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState<Employee[] | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [invalidIds, setInvalidIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const orgRootsRef = useRef<OrgRootsHandle>(null);

  // ドラッグ状態をrefで管理（グローバルイベントハンドラ内でも最新の値を参照するため）
  const dragStateRef = useRef<{
    draggedId: string;
    invalidIds: Set<string>;
    startX: number;
    startY: number;
    activated: boolean;
  } | null>(null);

  const activeEmployeesRef = useRef<Employee[]>([]);

  useEffect(() => { dispatch(fetchEmployees()); }, [dispatch]);

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status !== 'retired'),
    [employees],
  );

  useEffect(() => {
    activeEmployeesRef.current = activeEmployees;
  }, [activeEmployees]);

  const positions = useMemo(() => {
    const set = new Set(activeEmployees.map((e) => e.position).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [activeEmployees]);

  const roots = useMemo(() => {
    const allIds = new Set(activeEmployees.map((e) => e.id));
    return activeEmployees
      .filter((e) => !e.managerId || !allIds.has(e.managerId))
      .map((r) => buildTree(r, activeEmployees));
  }, [activeEmployees]);

  // グローバルな pointermove / pointerup を1度だけ登録
  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const ds = dragStateRef.current;
      if (!ds) return;
      if (!ds.activated) {
        if (Math.hypot(e.clientX - ds.startX, e.clientY - ds.startY) > DRAG_THRESHOLD) {
          ds.activated = true;
          // 閾値を超えてはじめてドラッグ中として扱う（単純クリックでのちらつき防止）
          setDraggedId(ds.draggedId);
          setInvalidIds(ds.invalidIds);
        }
      }
      if (ds.activated) {
        setGhostPos({ x: e.clientX, y: e.clientY });
      }
    };

    const handleUp = () => {
      if (!dragStateRef.current) return;
      dragStateRef.current = null;
      setDraggedId(null);
      setGhostPos(null);
      setOverId(null);
      setInvalidIds(new Set());
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
    return () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
    };
  }, []);

  // ホバーし続けると自動展開（折りたたまれたノードをドラッグ中に開く）
  useEffect(() => {
    if (!overId) return;
    const timer = setTimeout(() => {
      if (dragStateRef.current?.activated) {
        orgRootsRef.current?.expand(overId);
      }
    }, HOVER_EXPAND_DELAY);
    return () => clearTimeout(timer);
  }, [overId]);

  const handlePointerDown = useCallback((id: string, e: React.PointerEvent) => {
    const all = activeEmployeesRef.current;
    const descendants = getDescendantIds(id, all);
    const blockedParents = new Set([id, ...descendants]);
    // 子を持つノードのID集合
    const hasChildrenSet = new Set(all.map((e) => e.managerId).filter((m): m is string => !!m));
    const invalidTargets = new Set<string>([id]); // 自分自身は常に無効
    for (const emp of all) {
      if (emp.id === id) continue;
      if (hasChildrenSet.has(emp.id)) {
        // 子ありノード → 兄弟配置 (newManagerId = emp.managerId)
        if (emp.managerId !== undefined && blockedParents.has(emp.managerId)) {
          invalidTargets.add(emp.id);
        }
      } else {
        // 子なしノード → 子配置 (newManagerId = emp.id)
        if (blockedParents.has(emp.id)) {
          invalidTargets.add(emp.id);
        }
      }
    }
    dragStateRef.current = {
      draggedId: id,
      invalidIds: invalidTargets,
      startX: e.clientX,
      startY: e.clientY,
      activated: false,
    };
    // draggedId は閾値超えてから set する（単純クリックでのちらつき防止）
    setOverId(null);
    setGhostPos(null);
  }, []);

  const handlePointerEnter = useCallback((id: string) => {
    if (!dragStateRef.current?.activated) return;
    setOverId(id);
  }, []);

  const handlePointerLeave = useCallback((id: string) => {
    setOverId((prev) => (prev === id ? null : prev));
  }, []);

  const handlePointerUp = useCallback(async (targetId: string) => {
    const ds = dragStateRef.current;
    if (!ds || !ds.activated) return;
    if (ds.draggedId === targetId || ds.invalidIds.has(targetId)) return;
    const all = activeEmployeesRef.current;
    const dragged = all.find((e) => e.id === ds.draggedId);
    const target = all.find((e) => e.id === targetId);
    if (!dragged || !target) return;
    // 子ありノード → 兄弟配置、子なしノード → 子配置
    const targetHasChildren = all.some((e) => e.managerId === targetId);
    const newManagerId = targetHasChildren ? target.managerId : targetId;
    if (dragged.managerId === newManagerId) return; // 変化なし
    setSaving(true);
    await dispatch(updateEmployee({ ...dragged, managerId: newManagerId }));
    setSaving(false);
    // 新しい親ノードを展開して移動したメンバーが見えるようにする
    if (newManagerId) {
      orgRootsRef.current?.expand(newManagerId);
    }
  }, [dispatch]);

  const handleSavePosition = useCallback(async (id: string, position: string) => {
    const emp = activeEmployeesRef.current.find((e) => e.id === id);
    if (!emp) return;
    setSaving(true);
    await dispatch(updateEmployee({ ...emp, position }));
    setSaving(false);
  }, [dispatch]);

  const handleToggleEditMode = useCallback(() => {
    setEditMode((prev) => {
      if (!prev) {
        // 編集開始時にスナップショットを保存
        setEditSnapshot([...activeEmployeesRef.current]);
      } else {
        setEditSnapshot(null);
      }
      return !prev;
    });
  }, []);

  const handleReset = useCallback(async () => {
    if (!editSnapshot) return;
    const current = activeEmployeesRef.current;
    const changed = editSnapshot.filter((snap) => {
      const cur = current.find((e) => e.id === snap.id);
      if (!cur) return false;
      return cur.managerId !== snap.managerId || cur.position !== snap.position;
    });
    if (changed.length === 0) return;
    setSaving(true);
    await Promise.all(changed.map((snap) => {
      const cur = current.find((e) => e.id === snap.id)!;
      return dispatch(updateEmployee({ ...cur, managerId: snap.managerId, position: snap.position }));
    }));
    setSaving(false);
    setEditSnapshot([...editSnapshot]);
  }, [dispatch, editSnapshot]);

  const handleDropRoot = useCallback(async () => {
    const ds = dragStateRef.current;
    if (!ds || !ds.activated) return;
    const dragged = activeEmployeesRef.current.find((e) => e.id === ds.draggedId);
    if (!dragged || !dragged.managerId) return;
    setSaving(true);
    const { managerId: _m, ...rest } = dragged;
    void _m;
    await dispatch(updateEmployee({ ...rest, managerId: undefined }));
    setSaving(false);
  }, [dispatch]);

  const ghostEmployee = draggedId ? activeEmployees.find((e) => e.id === draggedId) : null;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <OrgEditContext.Provider
      value={{
        editMode,
        draggedId,
        overId,
        invalidIds,
        onPointerDown: handlePointerDown,
        onPointerEnter: handlePointerEnter,
        onPointerLeave: handlePointerLeave,
        onPointerUp: handlePointerUp,
        onSavePosition: handleSavePosition,
        positions,
      }}
    >
      <div className="space-y-6" style={draggedId ? { userSelect: 'none', cursor: 'grabbing' } : undefined}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">組織図</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {editMode
                ? 'ドラッグ&ドロップで配置変更・役職テキストをクリックして直接編集できます'
                : '社員カードをクリックして展開・折りたたみができます'}
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              {saving && (
                <span className="text-xs text-gray-400 dark:text-gray-500">保存中...</span>
              )}
              {editMode && (
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  リセット
                </button>
              )}
              <button
                onClick={handleToggleEditMode}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  editMode
                    ? 'bg-gray-500 text-white hover:bg-gray-600'
                    : 'bg-sky-500 text-white hover:bg-sky-600'
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {editMode ? '編集終了' : '組織図を編集'}
              </button>
            </div>
          )}
        </div>

        <div className={`flex items-start gap-4 ${editMode ? '' : ''}`}>
          {editMode && (
            <div className="sticky top-0 shrink-0" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <OrgEditPanel employees={activeEmployees} />
            </div>
          )}
          <div className="flex-1 overflow-x-auto rounded-xl bg-gray-50 p-10 dark:bg-gray-950">
            <div className="w-max">
              {roots.length > 0 ? (
                <OrgRoots ref={orgRootsRef} roots={roots} dark={dark} onDropRoot={handleDropRoot} />
              ) : (
                <p className="text-sm text-gray-400">社員データがありません</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ドラッグゴースト */}
      {ghostPos && ghostEmployee && (
        <DragGhost employee={ghostEmployee} x={ghostPos.x} y={ghostPos.y} />
      )}
    </OrgEditContext.Provider>
  );
}

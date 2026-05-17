import { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { updateSettings, type SkillCategory, type Settings } from '../features/settings/slices/settingsSlice';
import { ErrorMessage } from '../components/ui/ErrorMessage';

// ---- プロジェクトリスト編集 ----------------------------------------

type SimpleListProps = {
  items: string[];
  onChange: (items: string[]) => void;
};

function SimpleList({ items, onChange }: SimpleListProps) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    const v = input.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setInput('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
          placeholder="追加する項目を入力"
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          追加
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((i) => i !== item))}
              className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600"
              aria-label={`${item}を削除`}
            >×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- スキルカテゴリ編集 ----------------------------------------

type SkillCategoryEditorProps = {
  categories: SkillCategory[];
  onChange: (categories: SkillCategory[]) => void;
};

function SkillCategoryEditor({ categories, onChange }: SkillCategoryEditorProps) {
  const [newCategoryName, setNewCategoryName] = useState('');

  const updateCategory = (index: number, updated: SkillCategory) => {
    const next = [...categories];
    next[index] = updated;
    onChange(next);
  };

  const removeCategory = (index: number) => {
    onChange(categories.filter((_, i) => i !== index));
  };

  const addCategory = () => {
    const v = newCategoryName.trim();
    if (!v || categories.some((c) => c.category === v)) return;
    onChange([...categories, { category: v, skills: [] }]);
    setNewCategoryName('');
  };

  return (
    <div className="space-y-4">
      {categories.map((cat, i) => (
        <div key={cat.category} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{cat.category}</h3>
            <button
              type="button"
              onClick={() => removeCategory(i)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              カテゴリを削除
            </button>
          </div>
          <SimpleList
            items={cat.skills}
            onChange={(skills) => updateCategory(i, { ...cat, skills })}
          />
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
          placeholder="新しいカテゴリ名"
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-sky-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <button
          type="button"
          onClick={addCategory}
          className="rounded-lg border border-sky-500 px-4 py-2 text-sm font-medium text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20"
        >
          カテゴリを追加
        </button>
      </div>
    </div>
  );
}

// ---- SettingsPage ----------------------------------------

export function SettingsPage() {
  const dispatch = useAppDispatch();
  const { skillCategories: savedCategories, projects: savedProjects, error } = useAppSelector(
    (state) => state.settings,
  );

  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && savedCategories.length > 0) {
      setSkillCategories(savedCategories);
      setProjects(savedProjects);
      setInitialized(true);
    }
  }, [savedCategories, savedProjects, initialized]);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    const settings: Settings = { skillCategories, projects };
    await dispatch(updateSettings(settings));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">マスタ設定</h1>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">スキル一覧（カテゴリ別）</h2>
          <SkillCategoryEditor categories={skillCategories} onChange={setSkillCategories} />
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300">プロジェクト一覧</h2>
          <SimpleList items={projects} onChange={setProjects} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存する'}
        </button>
        {saveSuccess && <p className="text-sm text-sky-600 dark:text-sky-400">保存しました</p>}
      </div>
    </div>
  );
}

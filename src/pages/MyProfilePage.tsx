import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchEmployees, updateEmployee } from '../features/employees/slices/employeeSlice';
import { uploadAvatar } from '../features/employees/api/avatarService';
import { EmployeeProfile } from '../features/employees/components/EmployeeProfile/EmployeeProfile';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { validateEmployeeForm } from '../features/employees/utils/validateEmployeeForm';
import type { Employee } from '../features/employees/types/employee';

const POSITION_CATEGORY_MAP: { keywords: string[]; category: string }[] = [
  {
    keywords: ['フロントエンド', 'frontend', 'front-end', 'ui', 'ux', 'デザイン', 'design', 'デザイナー', 'designer',
               'バックエンド', 'backend', 'back-end', 'インフラ', 'infra', 'sre', 'devops',
               'データ', 'data', 'ml', 'ai', '機械学習', 'エンジニア', 'engineer', '開発', 'developer',
               'cto', 'vp', 'テックリード', 'アーキテクト', 'リーダー', 'leader', 'マネージャ', 'manager'],
    category: 'エンジニア系',
  },
  { keywords: ['営業', 'sales', 'セールス', 'account', 'カスタマーサクセス'], category: '営業系' },
  { keywords: ['経営', '社長', 'ceo', 'cfo', '役員', '執行役', 'bizdev', '事業開発', '事業企画'], category: '経営・管理系' },
];

function getCategoryForPosition(position: string): string {
  if (!position) return '';
  const lower = position.toLowerCase();
  for (const { keywords, category } of POSITION_CATEGORY_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return '';
}

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900/30';
const labelClass = 'block text-sm font-medium text-gray-600 dark:text-gray-400';

const PROFILE_FIELDS = [
  { name: 'selfIntroduction', label: '自己紹介文', rows: 4 },
  { name: 'strengths', label: '強み', rows: 3 },
  { name: 'growthSkills', label: '今伸ばしたいスキル', rows: 3 },
  { name: 'interests', label: '興味のある分野', rows: 3 },
  { name: 'hobbies', label: '趣味・好きなこと', rows: 3 },
  { name: 'personalMessage', label: '一言メッセージ', rows: 2 },
  { name: 'workLocation', label: '勤務地・リモート可否', rows: 2 },
  { name: 'availability', label: '稼働時間・勤務スタイル', rows: 2 },
  { name: 'careerHistory', label: '過去の経験・経歴', rows: 4 },
  { name: 'certifications', label: '資格', rows: 3 },
] as const satisfies readonly {
  name: keyof Employee;
  label: string;
  rows: number;
}[];

export function MyProfilePage() {
  const dispatch = useAppDispatch();
  const { employees, loading, error } = useAppSelector((state) => state.employees);
  const skillCategories = useAppSelector((state) => state.settings.skillCategories);
  const allProjects = useAppSelector((state) => state.settings.projects);
  const authUser = useAppSelector((state) => state.auth.user);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [formValues, setFormValues] = useState<Partial<Employee> | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  useEffect(() => {
    if (employees.length === 0) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, employees.length]);

  const myEmployee = employees.find((e) => e.email === authUser?.email) ?? null;

  const positions = useMemo(() => {
    const set = new Set(employees.map((e) => e.position).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [employees]);

  useEffect(() => {
    if (myEmployee && !formValues) {
      setFormValues(myEmployee);
      setAvatarPreview(myEmployee.avatarUrl ?? null);
      setCategoryFilter(getCategoryForPosition(myEmployee.position ?? ''));
    }
  }, [myEmployee, formValues]);

  if (loading || (employees.length === 0 && !error)) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!myEmployee) {
    const empSample = employees.slice(0, 3).map((e) => `"${e.email}"`).join(', ');
    return (
      <ErrorMessage
        message={`社員が見つかりません / 検索メール: "${authUser?.email}" / 社員数: ${employees.length} / 先頭3件のメール: ${empSample}`}
      />
    );
  }
  if (!formValues) return <LoadingSpinner />;

  const currentValues = formValues as Employee;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setAvatarError('JPEG または PNG 形式のファイルを選択してください');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('ファイルサイズは 5MB 以下にしてください');
      return;
    }
    setAvatarError(null);
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleProjectToggle = (project: string) => {
    const projects = (currentValues.projects ?? []).includes(project)
      ? (currentValues.projects ?? []).filter((p) => p !== project)
      : [...(currentValues.projects ?? []), project];
    setFormValues({ ...currentValues, projects });
  };

  const handleSkillToggle = (skill: string) => {
    const skills = currentValues.skills.includes(skill)
      ? currentValues.skills.filter((s) => s !== skill)
      : [...currentValues.skills, skill];
    setFormValues({ ...currentValues, skills });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);

    const errors = validateEmployeeForm(currentValues, employees, myEmployee.id);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSaving(true);

    try {
      let avatarUrl = myEmployee.avatarUrl;
      if (avatarFile) {
        setAvatarUploading(true);
        avatarUrl = await uploadAvatar(myEmployee.id, avatarFile);
        setAvatarUploading(false);
        setAvatarFile(null);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
      }
      await dispatch(updateEmployee({ ...myEmployee, ...currentValues, avatarUrl }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError('保存に失敗しました');
    } finally {
      setSaving(false);
      setAvatarUploading(false);
    }
  };

  const updatedEmployee = { ...myEmployee, ...currentValues, avatarUrl: avatarPreview ?? myEmployee.avatarUrl };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">マイプロフィール</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左: プロフィール表示 */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">プレビュー</h2>
          <EmployeeProfile employee={updatedEmployee} />
        </div>

        {/* 右: 編集フォーム */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">編集</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* アバター */}
            <div>
              <p className={labelClass}>顔写真</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="プレビュー" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <label className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800">
                  {avatarUploading ? 'アップロード中...' : '写真を選択'}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    disabled={saving}
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              {avatarError && <p className="mt-1 text-xs text-red-500">{avatarError}</p>}
            </div>

            {/* 氏名 */}
            <div>
              <label htmlFor="mp-name" className={labelClass}>
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                id="mp-name"
                type="text"
                value={currentValues.name}
                disabled={saving}
                className={inputClass}
                onChange={(e) => setFormValues({ ...currentValues, name: e.target.value })}
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
            </div>

            {/* 職種 */}
            <div>
              <label htmlFor="mp-position" className={labelClass}>
                職種 <span className="text-red-500">*</span>
              </label>
              <select
                id="mp-position"
                value={currentValues.position}
                disabled={saving}
                className={inputClass}
                onChange={(e) => setFormValues({ ...currentValues, position: e.target.value })}
              >
                <option value="">選択してください</option>
                {/* 現在の値がリストにない場合も選択肢として表示 */}
                {currentValues.position && !positions.includes(currentValues.position) && (
                  <option value={currentValues.position}>{currentValues.position}</option>
                )}
                {positions.map((pos) => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
              {formErrors.position && <p className="mt-1 text-xs text-red-600">{formErrors.position}</p>}
            </div>

            {/* スキル */}
            <div>
              <div className="flex items-center gap-2">
                <p className={labelClass}>スキル</p>
                <select
                  value={categoryFilter}
                  disabled={saving}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="ml-auto rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-sky-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  <option value="">すべて</option>
                  {skillCategories.map((c) => (
                    <option key={c.category} value={c.category}>{c.category}</option>
                  ))}
                </select>
              </div>
              {(() => {
                const filtered = categoryFilter
                  ? (skillCategories.find((c) => c.category === categoryFilter)?.skills ?? [])
                  : skillCategories.flatMap((c) => c.skills);
                const extra = currentValues.skills.filter((s) => !filtered.includes(s));
                return (
                  <>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {filtered.map((skill) => (
                        <label key={skill} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <input
                            type="checkbox"
                            checked={currentValues.skills.includes(skill)}
                            disabled={saving}
                            className="rounded border-gray-300 text-sky-500 focus:ring-sky-400 dark:border-gray-600"
                            onChange={() => handleSkillToggle(skill)}
                          />
                          {skill}
                        </label>
                      ))}
                    </div>
                    {extra.length > 0 && (
                      <div className="mt-3 border-t border-gray-100 pt-2 dark:border-gray-700">
                        <p className="mb-1.5 text-[11px] text-gray-400 dark:text-gray-500">その他の選択済みスキル</p>
                        <div className="grid grid-cols-2 gap-2">
                          {extra.map((skill) => (
                            <label key={skill} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-500">
                              <input
                                type="checkbox"
                                checked
                                disabled={saving}
                                className="rounded border-gray-300 text-sky-500 focus:ring-sky-400 dark:border-gray-600"
                                onChange={() => handleSkillToggle(skill)}
                              />
                              {skill}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* 参画プロジェクト */}
            <div>
              <p className={labelClass}>参画プロジェクト</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {allProjects.map((project) => (
                  <label key={project} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <input
                      type="checkbox"
                      checked={(currentValues.projects ?? []).includes(project)}
                      disabled={saving}
                      className="rounded border-gray-300 text-sky-500 focus:ring-sky-400 dark:border-gray-600"
                      onChange={() => handleProjectToggle(project)}
                    />
                    {project}
                  </label>
                ))}
              </div>
            </div>

            {/* プロフィール */}
            <div>
              <label htmlFor="mp-profile" className={labelClass}>
                プロフィール
              </label>
              <textarea
                id="mp-profile"
                rows={4}
                value={currentValues.profile}
                disabled={saving}
                className={inputClass}
                onChange={(e) => setFormValues({ ...currentValues, profile: e.target.value })}
              />
            </div>

            <fieldset className="space-y-4">
              <legend className={labelClass}>詳細プロフィール</legend>
              <div className="grid gap-4">
                {PROFILE_FIELDS.map((field) => (
                  <div key={field.name}>
                    <label htmlFor={`mp-${field.name}`} className={labelClass}>
                      {field.label}
                    </label>
                    <textarea
                      id={`mp-${field.name}`}
                      rows={field.rows}
                      value={String(currentValues[field.name] ?? '')}
                      disabled={saving}
                      className={inputClass}
                      onChange={(e) => setFormValues({ ...currentValues, [field.name]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            {saveError && <p className="text-xs text-red-600">{saveError}</p>}
            {saveSuccess && <p className="text-xs text-sky-600">保存しました</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { validateEmployeeForm } from '../../utils/validateEmployeeForm';
import { uploadAvatar } from '../../api/avatarService';
import type { Employee, EmployeeFormValues } from '../../types/employee';

const PRESET_AVATARS = [
  {
    id: 'blue',
    label: 'ブルー',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=blue-employee&backgroundColor=b6e3f4',
  },
  {
    id: 'pink',
    label: 'ピンク',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=pink-employee&backgroundColor=ffd5dc',
  },
  {
    id: 'purple',
    label: 'パープル',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=purple-employee&backgroundColor=c0aede',
  },
  {
    id: 'green',
    label: 'グリーン',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=green-employee&backgroundColor=d1f7c4',
  },
  {
    id: 'amber',
    label: 'アンバー',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=amber-employee&backgroundColor=ffdfbf',
  },
] as const;

const DEPARTMENTS = [
  '開発部',
  '人事部',
  '営業部',
  '総務部',
  'マーケティング部',
  'カスタマーサポート部',
] as const;

const POSITION_CATEGORY_MAP: { keywords: string[]; category: string }[] = [
  {
    keywords: ['フロントエンド', 'frontend', 'front-end', 'ui', 'ux', 'デザイン', 'design', 'デザイナー', 'designer',
               'バックエンド', 'backend', 'back-end', 'インフラ', 'infra', 'sre', 'devops',
               'データ', 'data', 'ml', 'ai', '機械学習', 'エンジニア', 'engineer', '開発', 'developer',
               'cto', 'vp', 'テックリード', 'アーキテクト', 'リーダー', 'leader', 'マネージャ', 'manager'],
    category: 'エンジニア系',
  },
  {
    keywords: ['営業', 'sales', 'セールス', 'account', 'カスタマーサクセス'],
    category: '営業系',
  },
  {
    keywords: ['経営', '社長', 'ceo', 'cfo', '役員', '執行役', 'bizdev', '事業開発', '事業企画'],
    category: '経営・管理系',
  },
];

function getCategoryForPosition(position: string): string {
  if (!position) return '';
  const lower = position.toLowerCase();
  for (const { keywords, category } of POSITION_CATEGORY_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return '';
}

type EmployeeFormProps = {
  mode: 'create' | 'edit';
  employeeId?: string;
  initialValues?: Partial<EmployeeFormValues>;
  editingEmployee?: Employee;
  onSubmit: (values: EmployeeFormValues) => void;
  isLoading?: boolean;
};

const DEFAULT_VALUES: EmployeeFormValues = {
  name: '',
  email: '',
  department: '',
  position: '',
  employmentType: 'full-time',
  status: 'active',
  joinedAt: '',
  skills: [],
  projects: [],
  profile: '',
};

export function EmployeeForm({
  mode,
  employeeId,
  initialValues,
  editingEmployee,
  onSubmit,
  isLoading = false,
}: EmployeeFormProps) {
  const employees = useAppSelector((state) => state.employees.employees);
  const skillCategories = useAppSelector((state) => state.settings.skillCategories);
  const allProjects = useAppSelector((state) => state.settings.projects);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialValues?.avatarUrl ?? null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>(() =>
    getCategoryForPosition(initialValues?.position ?? ''),
  );

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
    mode: 'onBlur',
  });

  const positions = useMemo(() => {
    const set = new Set(employees.map((e) => e.position).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ja'));
  }, [employees]);

  const currentPosition = watch('position');
  const currentSkills = watch('skills') ?? [];

  useEffect(() => {
    setCategoryFilter(getCategoryForPosition(currentPosition ?? ''));
  }, [currentPosition]);

  const allFlatSkills = useMemo(
    () => skillCategories.flatMap((c) => c.skills),
    [skillCategories],
  );
  const filteredSkills = useMemo(() => {
    if (!categoryFilter) return allFlatSkills;
    return skillCategories.find((c) => c.category === categoryFilter)?.skills ?? allFlatSkills;
  }, [categoryFilter, skillCategories, allFlatSkills]);

  const extraSkills = currentSkills.filter((s) => !filteredSkills.includes(s));

  const handlePresetAvatarSelect = (url: string) => {
    setAvatarFile(null);
    setAvatarPreview(url);
    setAvatarError(null);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

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

  const onValid = async (values: EmployeeFormValues) => {
    const formErrors = validateEmployeeForm(values, employees, editingEmployee?.id);
    if (Object.keys(formErrors).length > 0) {
      (Object.entries(formErrors) as [keyof EmployeeFormValues, string][]).forEach(
        ([field, message]) => setError(field, { message }),
      );
      return;
    }
    let avatarUrl = initialValues?.avatarUrl;
    if (avatarFile && employeeId) {
      avatarUrl = await uploadAvatar(employeeId, avatarFile);
    } else if (avatarPreview) {
      avatarUrl = avatarPreview;
    }
    onSubmit({ ...values, avatarUrl });
  };

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900/30';
  const labelClass = 'block text-sm font-medium text-gray-600 dark:text-gray-400';

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5" data-testid="employee-form" noValidate>
      <div>
        <p className={labelClass}>顔写真</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900">
            {avatarPreview ? (
              <img src={avatarPreview} alt="プレビュー" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {PRESET_AVATARS.map((avatar) => {
              const isSelected = avatarPreview === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  title={avatar.label}
                  aria-label={`${avatar.label}の顔写真を選択`}
                  aria-pressed={isSelected}
                  disabled={isLoading}
                  onClick={() => handlePresetAvatarSelect(avatar.url)}
                  className={`h-11 w-11 overflow-hidden rounded-full ring-2 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
                    isSelected
                      ? 'ring-sky-500'
                      : 'ring-gray-200 dark:ring-gray-700'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <img src={avatar.url} alt="" className="h-full w-full object-cover" />
                </button>
              );
            })}
            <label className="cursor-pointer rounded-lg px-3 py-2 text-sm text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800">
              アップロード
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                disabled={isLoading}
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>
        {avatarError && <p className="mt-1 text-xs text-red-500">{avatarError}</p>}
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          氏名 <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          aria-required="true"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={!!errors.name}
          disabled={isLoading}
          data-testid="employee-form-name"
          className={inputClass}
          {...register('name', { required: '氏名を入力してください' })}
        />
        {errors.name && (
          <span id="name-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.name.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          メールアドレス <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          aria-required="true"
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
          disabled={isLoading}
          data-testid="employee-form-email"
          className={inputClass}
          {...register('email', {
            required: 'メールアドレスを入力してください',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: '有効なメールアドレスを入力してください',
            },
          })}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="department" className={labelClass}>
          部署 <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="department"
          aria-required="true"
          aria-describedby={errors.department ? 'department-error' : undefined}
          aria-invalid={!!errors.department}
          disabled={isLoading}
          data-testid="employee-form-department"
          className={inputClass}
          {...register('department', { required: '部署を選択してください' })}
        >
          <option value="">選択してください</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        {errors.department && (
          <span id="department-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.department.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="position" className={labelClass}>
          職種 <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="position"
          aria-required="true"
          aria-describedby={errors.position ? 'position-error' : undefined}
          aria-invalid={!!errors.position}
          disabled={isLoading}
          data-testid="employee-form-position"
          className={inputClass}
          {...register('position', { required: '職種を選択してください' })}
        >
          <option value="">選択してください</option>
          {currentPosition && !positions.includes(currentPosition) && (
            <option value={currentPosition}>{currentPosition}</option>
          )}
          {positions.map((pos) => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>
        {errors.position && (
          <span id="position-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.position.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="employmentType" className={labelClass}>
          雇用形態 <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="employmentType"
          aria-required="true"
          disabled={isLoading}
          data-testid="employee-form-employment-type"
          className={inputClass}
          {...register('employmentType')}
        >
          <option value="full-time">正社員</option>
          <option value="part-time">パート</option>
          <option value="contract">契約</option>
          <option value="intern">インターン</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          ステータス <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <select
          id="status"
          aria-required="true"
          disabled={isLoading}
          data-testid="employee-form-status"
          className={inputClass}
          {...register('status')}
        >
          <option value="active">稼働中</option>
          <option value="leave">休業中</option>
          <option value="retired">退職</option>
        </select>
      </div>

      <div>
        <label htmlFor="joinedAt" className={labelClass}>
          入社日 <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="joinedAt"
          type="date"
          aria-required="true"
          aria-describedby={errors.joinedAt ? 'joinedAt-error' : undefined}
          aria-invalid={!!errors.joinedAt}
          disabled={isLoading}
          data-testid="employee-form-joined-at"
          className={inputClass}
          {...register('joinedAt', { required: '入社日を入力してください' })}
        />
        {errors.joinedAt && (
          <span id="joinedAt-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.joinedAt.message}
          </span>
        )}
      </div>

      <fieldset>
        <div className="flex items-center gap-2">
          <legend className={labelClass}>スキル</legend>
          <select
            value={categoryFilter}
            disabled={isLoading}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="ml-auto rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-sky-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">すべて</option>
            {skillCategories.map((c) => (
              <option key={c.category} value={c.category}>{c.category}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {filteredSkills.map((skill) => (
            <label key={skill} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                value={skill}
                disabled={isLoading}
                data-testid={`employee-form-skill-${skill}`}
                className="rounded border-gray-300 text-sky-500 focus:ring-sky-400 dark:border-gray-600"
                {...register('skills')}
              />
              {skill}
            </label>
          ))}
        </div>
        {extraSkills.length > 0 && (
          <div className="mt-3 border-t border-gray-100 pt-2 dark:border-gray-700">
            <p className="mb-1.5 text-[11px] text-gray-400 dark:text-gray-500">その他の選択済みスキル</p>
            <div className="grid grid-cols-3 gap-2">
              {extraSkills.map((skill) => (
                <label key={skill} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-500">
                  <input
                    type="checkbox"
                    value={skill}
                    checked
                    disabled={isLoading}
                    className="rounded border-gray-300 text-sky-500 focus:ring-sky-400 dark:border-gray-600"
                    {...register('skills')}
                  />
                  {skill}
                </label>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className={labelClass}>参画プロジェクト</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {allProjects.map((project) => (
            <label key={project} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                value={project}
                disabled={isLoading}
                className="rounded border-gray-300 text-sky-500 focus:ring-sky-400 dark:border-gray-600"
                {...register('projects')}
              />
              {project}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="profile" className={labelClass}>
          プロフィール
        </label>
        <textarea
          id="profile"
          rows={4}
          disabled={isLoading}
          data-testid="employee-form-profile"
          className={inputClass}
          {...register('profile')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          data-testid="employee-form-submit"
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50"
        >
          {mode === 'create' ? '登録する' : '保存する'}
        </button>
        <button
          type="button"
          onClick={() => history.back()}
          data-testid="employee-form-cancel"
          className="rounded-lg px-4 py-2 text-sm text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

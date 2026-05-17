import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { validateEmployeeForm } from '../../utils/validateEmployeeForm';
import { uploadAvatar } from '../../api/avatarService';
import type { Employee, EmployeeFormValues } from '../../types/employee';

const DEPARTMENTS = [
  '開発部',
  '人事部',
  '営業部',
  '総務部',
  'マーケティング部',
  'カスタマーサポート部',
] as const;

const ALL_PROJECTS = [
  '管理画面リニューアル',
  'モバイルアプリ開発',
  'APIリファクタリング',
  'データ基盤整備',
  'デザインシステム構築',
  '社内ツール開発',
  '採用プロセス改善',
  'セキュリティ強化',
  'パフォーマンス改善',
  'AI機能開発',
] as const;

const ALL_SKILLS = [
  // エンジニア系
  'TypeScript', 'JavaScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Java', 'Go',
  'Firebase', 'AWS', 'GCP', 'Docker',
  'SQL', 'PostgreSQL', 'MySQL',
  'Git', 'Figma', 'Excel',
  // 営業系
  '提案営業', 'インサイドセールス', 'カスタマーサクセス',
  'CRM', 'SFA', 'Salesforce',
  'プレゼンテーション', '交渉', '顧客折衝',
  // 経営・管理系
  '経営戦略', 'M&A', 'ファイナンス',
  '財務分析', '予算管理', '組織マネジメント',
  'リスクマネジメント', '事業企画', 'BizDev',
] as const;

type Skill = typeof ALL_SKILLS[number];

const POSITION_SKILL_MAP: { keywords: string[]; skills: Skill[] }[] = [
  {
    keywords: ['フロントエンド', 'frontend', 'front-end', 'ui', 'ux'],
    skills: ['TypeScript', 'JavaScript', 'React', 'Vue.js', 'Angular', 'Figma', 'Git'],
  },
  {
    keywords: ['バックエンド', 'backend', 'back-end', 'サーバー', 'server'],
    skills: ['TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'Go', 'SQL', 'PostgreSQL', 'MySQL', 'Git', 'Docker'],
  },
  {
    keywords: ['インフラ', 'infra', 'sre', 'devops', 'クラウド', 'cloud'],
    skills: ['AWS', 'GCP', 'Docker', 'Firebase', 'Git', 'Python', 'SQL'],
  },
  {
    keywords: ['データ', 'data', 'ml', 'ai', '機械学習'],
    skills: ['Python', 'SQL', 'PostgreSQL', 'MySQL', 'AWS', 'GCP', 'Git'],
  },
  {
    keywords: ['デザイン', 'design', 'デザイナー', 'designer'],
    skills: ['Figma', 'JavaScript'],
  },
  {
    keywords: ['営業', 'sales', 'セールス', 'account'],
    skills: ['提案営業', 'インサイドセールス', 'カスタマーサクセス', 'CRM', 'SFA', 'Salesforce', 'プレゼンテーション', '交渉', '顧客折衝', 'Excel'],
  },
  {
    keywords: ['経営', '社長', 'ceo', 'cfo', '役員', '執行役', 'bizdev', '事業開発', '事業企画'],
    skills: ['経営戦略', 'M&A', 'ファイナンス', '財務分析', '予算管理', '組織マネジメント', 'リスクマネジメント', '事業企画', 'BizDev', 'Excel'],
  },
  {
    keywords: ['cto', 'vp', 'テックリード', 'tech lead', 'アーキテクト'],
    skills: ['TypeScript', 'JavaScript', 'React', 'Vue.js', 'Node.js', 'Python', 'Java', 'Go', 'Firebase', 'AWS', 'GCP', 'Docker', 'SQL', 'Git', 'Excel', '組織マネジメント', '事業企画'],
  },
  {
    keywords: ['リーダー', 'leader', 'マネージャ', 'manager', '主任', '部長', '課長'],
    skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'GCP', 'Docker', 'SQL', 'Git', 'Excel', '組織マネジメント'],
  },
  {
    keywords: ['エンジニア', 'engineer', '開発', 'developer'],
    skills: ['TypeScript', 'JavaScript', 'React', 'Vue.js', 'Node.js', 'Python', 'Java', 'Go', 'Firebase', 'AWS', 'GCP', 'Docker', 'SQL', 'PostgreSQL', 'MySQL', 'Git'],
  },
];

function getSkillsForPosition(position: string): Skill[] {
  if (!position) return [...ALL_SKILLS];
  const lower = position.toLowerCase();
  for (const { keywords, skills } of POSITION_SKILL_MAP) {
    if (keywords.some((kw) => lower.includes(kw))) return skills;
  }
  return [...ALL_SKILLS];
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialValues?.avatarUrl ?? null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [skillFilter, setSkillFilter] = useState<string>(initialValues?.position ?? '');

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
  const filteredSkills = getSkillsForPosition(skillFilter);
  const extraSkills = currentSkills.filter((s) => !filteredSkills.includes(s as Skill));

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
        <div className="mt-2 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900">
            {avatarPreview ? (
              <img src={avatarPreview} alt="プレビュー" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          <label className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800">
            写真を選択
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              disabled={isLoading}
              onChange={handleAvatarChange}
            />
          </label>
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
          {...register('position', { required: '職種を選択してください', onChange: (e) => setSkillFilter(e.target.value) })}
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
            value={skillFilter}
            disabled={isLoading}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="ml-auto rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 focus:border-sky-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">すべて</option>
            {positions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
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
          {ALL_PROJECTS.map((project) => (
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

import { useForm } from 'react-hook-form';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { validateEmployeeForm } from '../../utils/validateEmployeeForm';
import type { Employee, EmployeeFormValues } from '../../types/employee';

const DEPARTMENTS = [
  '開発部',
  '人事部',
  '営業部',
  '総務部',
  'マーケティング部',
  'カスタマーサポート部',
] as const;

const SKILLS = [
  'TypeScript', 'JavaScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Java', 'Go',
  'Firebase', 'AWS', 'GCP', 'Docker',
  'SQL', 'PostgreSQL', 'MySQL',
  'Git', 'Figma', 'Excel',
] as const;

type EmployeeFormProps = {
  mode: 'create' | 'edit';
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
  profile: '',
};

export function EmployeeForm({
  mode,
  initialValues,
  editingEmployee,
  onSubmit,
  isLoading = false,
}: EmployeeFormProps) {
  const employees = useAppSelector((state) => state.employees.employees);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
    mode: 'onBlur',
  });

  const onValid = (values: EmployeeFormValues) => {
    const formErrors = validateEmployeeForm(values, employees, editingEmployee?.id);
    if (Object.keys(formErrors).length > 0) {
      (Object.entries(formErrors) as [keyof EmployeeFormValues, string][]).forEach(
        ([field, message]) => setError(field, { message }),
      );
      return;
    }
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="space-y-5" data-testid="employee-form" noValidate>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          氏名 <span aria-hidden="true" className="text-red-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          aria-required="true"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={!!errors.name}
          disabled={isLoading}
          data-testid="employee-form-name"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          {...register('name', { required: '氏名を入力してください' })}
        />
        {errors.name && (
          <span id="name-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.name.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          メールアドレス <span aria-hidden="true" className="text-red-600">*</span>
        </label>
        <input
          id="email"
          type="email"
          aria-required="true"
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
          disabled={isLoading}
          data-testid="employee-form-email"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
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
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
          部署 <span aria-hidden="true" className="text-red-600">*</span>
        </label>
        <select
          id="department"
          aria-required="true"
          aria-describedby={errors.department ? 'department-error' : undefined}
          aria-invalid={!!errors.department}
          disabled={isLoading}
          data-testid="employee-form-department"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
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
        <label htmlFor="position" className="block text-sm font-medium text-gray-700">
          職種 <span aria-hidden="true" className="text-red-600">*</span>
        </label>
        <input
          id="position"
          type="text"
          aria-required="true"
          aria-describedby={errors.position ? 'position-error' : undefined}
          aria-invalid={!!errors.position}
          disabled={isLoading}
          data-testid="employee-form-position"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          {...register('position', { required: '職種を入力してください' })}
        />
        {errors.position && (
          <span id="position-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.position.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700">
          雇用形態 <span aria-hidden="true" className="text-red-600">*</span>
        </label>
        <select
          id="employmentType"
          aria-required="true"
          disabled={isLoading}
          data-testid="employee-form-employment-type"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          {...register('employmentType')}
        >
          <option value="full-time">正社員</option>
          <option value="part-time">パート</option>
          <option value="contract">契約</option>
          <option value="intern">インターン</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          ステータス <span aria-hidden="true" className="text-red-600">*</span>
        </label>
        <select
          id="status"
          aria-required="true"
          disabled={isLoading}
          data-testid="employee-form-status"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          {...register('status')}
        >
          <option value="active">稼働中</option>
          <option value="leave">休業中</option>
          <option value="retired">退職</option>
        </select>
      </div>

      <div>
        <label htmlFor="joinedAt" className="block text-sm font-medium text-gray-700">
          入社日 <span aria-hidden="true" className="text-red-600">*</span>
        </label>
        <input
          id="joinedAt"
          type="date"
          aria-required="true"
          aria-describedby={errors.joinedAt ? 'joinedAt-error' : undefined}
          aria-invalid={!!errors.joinedAt}
          disabled={isLoading}
          data-testid="employee-form-joined-at"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          {...register('joinedAt', { required: '入社日を入力してください' })}
        />
        {errors.joinedAt && (
          <span id="joinedAt-error" role="alert" className="mt-1 text-xs text-red-600">
            {errors.joinedAt.message}
          </span>
        )}
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-gray-700">スキル</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {SKILLS.map((skill) => (
            <label key={skill} className="flex items-center gap-1.5 text-sm text-gray-700">
              <input
                type="checkbox"
                value={skill}
                disabled={isLoading}
                data-testid={`employee-form-skill-${skill}`}
                className="rounded border-gray-300"
                {...register('skills')}
              />
              {skill}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="profile" className="block text-sm font-medium text-gray-700">
          プロフィール
        </label>
        <textarea
          id="profile"
          rows={4}
          disabled={isLoading}
          data-testid="employee-form-profile"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
          {...register('profile')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          data-testid="employee-form-submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mode === 'create' ? '登録する' : '保存する'}
        </button>
        <button
          type="button"
          onClick={() => history.back()}
          data-testid="employee-form-cancel"
          className="rounded-md px-4 py-2 text-sm text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}

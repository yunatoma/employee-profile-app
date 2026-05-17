import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchEmployees, updateEmployee } from '../features/employees/slices/employeeSlice';
import { uploadAvatar } from '../features/employees/api/avatarService';
import { EmployeeProfile } from '../features/employees/components/EmployeeProfile/EmployeeProfile';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { validateEmployeeForm } from '../features/employees/utils/validateEmployeeForm';
import type { Employee } from '../features/employees/types/employee';

const SKILLS = [
  'TypeScript', 'JavaScript', 'React', 'Vue.js', 'Angular',
  'Node.js', 'Python', 'Java', 'Go',
  'Firebase', 'AWS', 'GCP', 'Docker',
  'SQL', 'PostgreSQL', 'MySQL',
  'Git', 'Figma', 'Excel',
] as const;

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-sky-500 dark:focus:ring-sky-900/30';
const labelClass = 'block text-sm font-medium text-gray-600 dark:text-gray-400';

export function MyProfilePage() {
  const dispatch = useAppDispatch();
  const { employees, loading, error } = useAppSelector((state) => state.employees);
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

  useEffect(() => {
    if (employees.length === 0) {
      dispatch(fetchEmployees());
    }
  }, [dispatch, employees.length]);

  const myEmployee = employees.find((e) => e.email === authUser?.email) ?? null;

  useEffect(() => {
    if (myEmployee && !formValues) {
      setFormValues(myEmployee);
      setAvatarPreview(myEmployee.avatarUrl ?? null);
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
              <input
                id="mp-position"
                type="text"
                value={currentValues.position}
                disabled={saving}
                className={inputClass}
                onChange={(e) => setFormValues({ ...currentValues, position: e.target.value })}
              />
              {formErrors.position && <p className="mt-1 text-xs text-red-600">{formErrors.position}</p>}
            </div>

            {/* スキル */}
            <div>
              <p className={labelClass}>スキル</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SKILLS.map((skill) => (
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

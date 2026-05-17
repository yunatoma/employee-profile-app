import { StatusBadge } from '../../../../components/ui/StatusBadge';
import { SkillTag } from '../../../../components/ui/SkillTag';
import { EMPLOYMENT_TYPE_LABELS, formatJoinedAt } from '../../../../utils/employeeLabels';
import type { Employee } from '../../types/employee';

type EmployeeProfileProps = {
  employee: Employee;
};

function text(value: string | undefined): string {
  return value?.trim() ?? '';
}

function splitProfileTags(value: string): string[] {
  return value
    .split(/[、,\n/|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="border-l-2 border-gray-200 pl-3 dark:border-gray-700">
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

export function EmployeeProfile({ employee }: EmployeeProfileProps) {
  const selfIntroduction = text(employee.selfIntroduction);
  const strengths = text(employee.strengths);
  const growthSkills = text(employee.growthSkills);
  const interests = text(employee.interests);
  const hobbies = text(employee.hobbies);
  const personalMessage = text(employee.personalMessage);
  const workLocation = text(employee.workLocation);
  const availability = text(employee.availability);
  const careerHistory = text(employee.careerHistory);
  const certifications = text(employee.certifications);
  const certificationTags = splitProfileTags(certifications);
  const hasPersonalProfile = selfIntroduction || strengths || personalMessage;
  const hasWorkProfile = workLocation || availability || growthSkills || interests;
  const hasBackgroundProfile = careerHistory || certifications || hobbies;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {employee.avatarUrl ? (
          <img
            src={employee.avatarUrl}
            alt={`${employee.name}のアバター`}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-2xl dark:bg-sky-900">
            👤
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">部署</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{employee.department}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">職種</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{employee.position}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">雇用形態</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{EMPLOYMENT_TYPE_LABELS[employee.employmentType]}</dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">ステータス</dt>
          <dd className="mt-1">
            <StatusBadge status={employee.status} />
          </dd>
        </div>
        <div>
          <dt className="font-medium text-gray-500 dark:text-gray-400">入社日</dt>
          <dd className="mt-1 text-gray-900 dark:text-white">{formatJoinedAt(employee.joinedAt)}</dd>
        </div>
      </dl>

      {employee.skills.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">スキル</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {employee.skills.map((skill) => (
              <SkillTag key={skill} skill={skill} />
            ))}
          </div>
        </div>
      )}

      {employee.projects && employee.projects.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">参画プロジェクト</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {employee.projects.map((project) => (
              <span
                key={project}
                className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
              >
                {project}
              </span>
            ))}
          </div>
        </div>
      )}

      {employee.profile && (
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">プロフィール</p>
          <p className="mt-2 text-sm text-gray-900 whitespace-pre-wrap dark:text-white">{employee.profile}</p>
        </div>
      )}

      {(hasPersonalProfile || hasWorkProfile || hasBackgroundProfile) && (
        <section className="space-y-6 border-t border-gray-100 pt-6 dark:border-gray-800">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">詳細プロフィール</p>
          </div>

          {hasPersonalProfile && (
            <section className="space-y-4">
              {selfIntroduction && (
                <div className="border-l-4 border-sky-400 py-1 pl-4 dark:border-sky-500">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">自己紹介文</p>
                  <p className="mt-2 whitespace-pre-wrap text-base leading-7 text-gray-900 dark:text-white">
                    {selfIntroduction}
                  </p>
                </div>
              )}

              <dl className="grid gap-4 md:grid-cols-2">
                {strengths && <DetailItem label="強み" value={strengths} />}
                {personalMessage && <DetailItem label="一言メッセージ" value={personalMessage} />}
              </dl>
            </section>
          )}

          {hasWorkProfile && (
            <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">働き方・関心領域</p>
              <dl className="grid gap-4 md:grid-cols-2">
                {workLocation && <DetailItem label="勤務地・リモート可否" value={workLocation} />}
                {availability && <DetailItem label="稼働時間・勤務スタイル" value={availability} />}
                {growthSkills && <DetailItem label="今伸ばしたいスキル" value={growthSkills} />}
                {interests && <DetailItem label="興味のある分野" value={interests} />}
              </dl>
            </section>
          )}

          {hasBackgroundProfile && (
            <section className="space-y-4 border-t border-gray-100 pt-5 dark:border-gray-800">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">経験・バックグラウンド</p>
              {careerHistory && (
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">過去の経験・経歴</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-900 dark:text-white">
                    {careerHistory}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {certificationTags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">資格</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {certificationTags.map((certification) => (
                        <span
                          key={certification}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                        >
                          {certification}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {hobbies && (
                  <DetailItem label="趣味・好きなこと" value={hobbies} />
                )}
              </div>
            </section>
          )}
        </section>
      )}
    </div>
  );
}

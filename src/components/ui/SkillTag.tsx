type SkillTagProps = {
  skill: string;
};

export function SkillTag({ skill }: SkillTagProps) {
  return (
    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950 dark:text-sky-400 dark:ring-sky-900">
      {skill}
    </span>
  );
}

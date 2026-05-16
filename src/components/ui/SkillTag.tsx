type SkillTagProps = {
  skill: string;
};

export function SkillTag({ skill }: SkillTagProps) {
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
      {skill}
    </span>
  );
}

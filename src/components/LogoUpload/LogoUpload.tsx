import { useRef, useState } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type LogoUploadProps = {
  onFileSelect: (file: File, previewUrl: string) => void;
};

export function LogoUpload({ onFileSelect }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('ファイルサイズは 5MB 以下にしてください');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onFileSelect(file, url);
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {previewUrl && (
        <div
          className="h-20 w-20 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden"
          style={{ background: 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 0 0 / 12px 12px' }}
        >
          <img
            src={previewUrl}
            alt="ロゴプレビュー"
            className="h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-sm text-blue-600 dark:text-blue-400 underline"
      >
        {previewUrl ? 'ロゴを変更する' : 'ロゴをアップロード（任意）'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

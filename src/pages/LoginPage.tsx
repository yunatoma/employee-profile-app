import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { signInWithGoogle, signInWithAccessCode } from '../features/auth/slices/authSlice';
import { ErrorMessage } from '../components/ui/ErrorMessage';

type LocationState = { from?: { pathname: string } };

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const from = (location.state as LocationState)?.from?.pathname ?? '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const [accessCode, setAccessCode] = useState('');

  const handleLogin = () => {
    dispatch(signInWithGoogle());
  };

  const handleAccessCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      dispatch(signInWithAccessCode(accessCode.trim()));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500 text-white text-xl font-bold shadow-sm">
            HR
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">社員管理</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">続けるにはログインしてください</p>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          data-testid="login-google-button"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? 'ログイン中...' : 'Google でログイン'}
        </button>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs text-gray-400 dark:bg-gray-900 dark:text-gray-500">
              または
            </span>
          </div>
        </div>

        <form onSubmit={handleAccessCodeLogin} className="space-y-2">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">デモアカウントで試す</p>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            placeholder="アクセスコードを入力"
            disabled={loading}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-center text-sm tracking-widest text-gray-700 placeholder:tracking-normal placeholder:text-gray-400 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          <button
            type="submit"
            disabled={loading || !accessCode.trim()}
            className="w-full rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'ログイン中...' : 'デモで試す'}
          </button>
        </form>
      </div>
    </div>
  );
}

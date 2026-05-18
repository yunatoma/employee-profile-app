import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { sendMessage, addUserMessage, clearMessages, closeChat } from '../../slices/aiChatSlice';
import { AIChatMessage } from '../AIChatMessage/AIChatMessage';

export function AIChatPanel() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.aiChat.messages);
  const loading = useAppSelector((state) => state.aiChat.loading);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    dispatch(addUserMessage(trimmed));
    void dispatch(sendMessage(trimmed));
  };

  return (
    <div
      data-testid="ai-chat-panel"
      className="flex h-[500px] w-80 flex-col rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-sky-500 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
          <span className="text-sm font-semibold text-white">AI アシスタント</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid="ai-chat-clear"
            onClick={() => dispatch(clearMessages())}
            title="会話をリセット"
            className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-sky-600 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            type="button"
            data-testid="ai-chat-close"
            onClick={() => dispatch(closeChat())}
            title="閉じる"
            className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-sky-600 hover:text-white"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900">
              <svg className="h-6 w-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              社員について質問してみましょう
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              例: 「React が得意な人は？」
              <br />
              「今すぐアサインできる人を探して」
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <AIChatMessage key={msg.id} message={msg} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 dark:bg-gray-700">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s] dark:bg-gray-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s] dark:bg-gray-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-400" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-gray-200 p-3 dark:border-gray-700"
      >
        <input
          ref={inputRef}
          data-testid="ai-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="質問を入力..."
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
        />
        <button
          type="submit"
          data-testid="ai-chat-submit"
          disabled={!input.trim() || loading}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500 text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}

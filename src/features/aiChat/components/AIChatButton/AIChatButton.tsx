import { useAppDispatch } from '../../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../../hooks/useAppSelector';
import { toggleChat } from '../../slices/aiChatSlice';
import { AIChatPanel } from '../AIChatPanel/AIChatPanel';

export function AIChatButton() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.aiChat.isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && <AIChatPanel />}
      <button
        type="button"
        data-testid="ai-chat-toggle"
        onClick={() => dispatch(toggleChat())}
        title={isOpen ? 'チャットを閉じる' : 'AI アシスタントに質問する'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition-all hover:bg-sky-600 hover:shadow-xl active:scale-95"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

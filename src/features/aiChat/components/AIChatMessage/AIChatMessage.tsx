import type { ChatMessage } from '../../types/aiChat';
import { EmployeeSuggestionCard } from '../EmployeeSuggestionCard/EmployeeSuggestionCard';

type Props = {
  message: ChatMessage;
};

export function AIChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      data-testid={`chat-message-${message.role}`}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="mb-1 flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">AI アシスタント</span>
          </div>
        )}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm ${
            isUser
              ? 'rounded-tr-sm bg-sky-500 text-white'
              : message.isError
                ? 'rounded-tl-sm bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                : 'rounded-tl-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
          }`}
        >
          {message.content}
        </div>
        {!isUser && message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {message.suggestions.map((suggestion) => (
              <EmployeeSuggestionCard key={suggestion.employeeId} suggestion={suggestion} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

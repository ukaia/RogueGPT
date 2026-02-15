import React, { useState, useRef, useCallback, useEffect } from 'react';

interface InputBarProps {
  onSubmit: (input: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSubmit, disabled = false }: InputBarProps): React.ReactElement {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-focus the input whenever it becomes enabled again
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;

    onSubmit(trimmed);
    setValue('');
  }, [value, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="border-t border-gray-800 bg-gray-900/95 px-4 py-3">
      <div className="flex items-center gap-2 max-w-full">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'Session ended.' : 'Type a command or message...'}
            autoFocus
            className="
              w-full px-4 py-2.5 rounded-xl
              bg-gray-800 border border-gray-700
              text-gray-100 text-sm font-mono
              placeholder:text-gray-600
              focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-800
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors
            "
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="
            px-4 py-2.5 rounded-xl
            bg-emerald-700 hover:bg-emerald-600
            disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed
            text-white text-sm font-mono font-medium
            transition-colors flex-shrink-0
          "
        >
          Send
        </button>
      </div>
    </div>
  );
}

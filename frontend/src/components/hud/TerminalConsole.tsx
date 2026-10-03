import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Trash2 } from 'lucide-react';
import type { TerminalEntry } from '../../types';
import { sound } from '../../services/soundEffects';

interface TerminalConsoleProps {
  entries: TerminalEntry[];
  onExecute: (cmd: string) => void;
  onClear: () => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  entries,
  onExecute,
  onClear,
}) => {
  const [inputVal, setInputVal] = useState<string>('');
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const commandHistoryRef = useRef<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    sound.playClick();
    commandHistoryRef.current.push(cmd);
    setHistoryIndex(-1);
    onExecute(cmd);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const history = commandHistoryRef.current;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    }
  };

  const quickCommands = ['help', 'status', 'agents', 'calibrate', 'matrix', 'overclock'];

  return (
    <div className="flex flex-col h-full rounded-xl border border-synapse-border bg-synapse-card backdrop-blur-md overflow-hidden p-3 shadow-cyber">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-synapse-cyan" />
          <h3 className="text-xs font-mono font-bold text-synapse-cyan uppercase">
            NEURAL CLI SHELL // SYNAPSE TERMINAL
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {quickCommands.map((q) => (
            <button
              key={q}
              onClick={() => onExecute(q)}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-gray-400 hover:text-synapse-cyan hover:border-synapse-cyan/40 transition-colors"
            >
              {q}
            </button>
          ))}
          <button
            onClick={onClear}
            title="Clear terminal buffer"
            className="p-1 rounded text-gray-400 hover:text-synapse-cyan transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Logs View */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 font-mono text-xs text-gray-300 pr-1 max-h-[220px]"
      >
        {entries.map((entry) => (
          <div key={entry.id} className="leading-relaxed">
            {/* Input Command */}
            <div className="flex items-center gap-2 text-synapse-cyan">
              <span className="text-synapse-violet font-bold">synapse-os:~$</span>
              <span className="font-semibold">{entry.command}</span>
            </div>

            {/* Output */}
            {entry.output && (
              <pre
                className={`mt-1 pl-4 whitespace-pre-wrap font-mono text-[11px] ${
                  entry.status === 'ERROR'
                    ? 'text-synapse-danger'
                    : entry.status === 'WARN'
                    ? 'text-synapse-amber'
                    : 'text-gray-300'
                }`}
              >
                {entry.output}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Command Input Prompt */}
      <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
        <span className="text-synapse-cyan font-mono text-xs font-bold">&gt;</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command or type 'help'..."
          className="flex-1 bg-transparent font-mono text-xs text-white placeholder-gray-600 focus:outline-none"
        />
        <button
          type="submit"
          className="p-1.5 rounded bg-synapse-cyan/10 hover:bg-synapse-cyan/20 text-synapse-cyan transition-colors"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

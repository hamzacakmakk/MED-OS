import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { checkHealth } from '../lib/api';
import { cn } from '../utils/cn';

function useApiStatus() {
  const [online, setOnline] = useState(null);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const ok = await checkHealth();
      if (alive) setOnline(ok);
    };
    tick();
    const t = setInterval(tick, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);
  return online;
}

export default function TopBar({ theme, onToggleTheme }) {
  const online = useApiStatus();
  return (
    <header className="flex h-12 shrink-0 items-center gap-4 border-b border-line bg-panel px-4">
      <div className="flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-accent">
          <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" />
          <path d="M12 6.5v11M6.5 12h11" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
        <span className="text-[15px] font-semibold tracking-tight">MED-OS</span>
        <span className="hidden text-[13px] text-fg-3 sm:inline">Radiology workstation</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden rounded border border-line px-2 py-0.5 text-[11.5px] text-fg-2 md:inline">
          Research prototype, not for clinical use
        </span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-fg-2" role="status">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              online === null ? 'bg-fg-3' : online ? 'bg-ok' : 'bg-bad',
            )}
          />
          {online === null ? 'Checking API' : online ? 'API connected' : 'API offline'}
        </span>
        <button
          onClick={onToggleTheme}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-fg-2 hover:bg-panel-2 hover:text-fg"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}

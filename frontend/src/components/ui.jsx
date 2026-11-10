import { cn } from '../utils/cn';

export function Button({ variant = 'secondary', size = 'md', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' ? 'h-7 px-2.5 text-[12.5px]' : 'h-8 px-3 text-[13px]',
        variant === 'primary' && 'bg-accent text-white hover:bg-accent-hover',
        variant === 'secondary' && 'border border-line bg-panel text-fg hover:bg-panel-2',
        variant === 'ghost' && 'text-fg-2 hover:bg-panel-2 hover:text-fg',
        className,
      )}
      {...props}
    />
  );
}

export function IconButton({ label, active, className, children, ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        active ? 'bg-white/15 text-white' : 'text-neutral-400 hover:bg-white/10 hover:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SectionTitle({ children, aside }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <h3 className="text-[11.5px] font-semibold tracking-wide text-fg-3 uppercase">{children}</h3>
      {aside}
    </div>
  );
}

const tones = {
  neutral: 'bg-panel-2 text-fg-2',
  ok: 'bg-ok/12 text-ok',
  warn: 'bg-warn/12 text-warn',
  bad: 'bg-bad/12 text-bad',
  accent: 'bg-accent-soft text-accent',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span className={cn('inline-flex items-center rounded px-1.5 py-0.5 text-[11.5px] font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}

export function Spinner({ className }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-r-transparent', className)}
    />
  );
}

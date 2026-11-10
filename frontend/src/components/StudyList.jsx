import { useDropzone } from 'react-dropzone';
import { ImagePlus, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../utils/cn';
import { Badge, Spinner } from './ui';

const STATUS = {
  uploading: { label: 'Uploading', tone: 'neutral', busy: true },
  analyzing: { label: 'Analyzing', tone: 'accent', busy: true },
  complete: { label: 'Complete', tone: 'ok' },
  failed: { label: 'Failed', tone: 'bad' },
};

function timeAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function StudyRow({ study, selected, onSelect, onRemove }) {
  const st = STATUS[study.status];
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
        className={cn(
          'group flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left outline-none',
          selected ? 'bg-accent-soft' : 'hover:bg-panel-2',
          'focus-visible:ring-2 focus-visible:ring-accent',
        )}
      >
        <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-viewer">
          <img src={study.url} alt="" className="h-full w-full object-cover opacity-90" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium">{study.name}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <Badge tone={st.tone} className="gap-1">
              {st.busy && <Spinner className="h-2.5 w-2.5" />}
              {st.label}
            </Badge>
            {study.result && <span className="text-[12px] text-fg-2">{study.result.region}</span>}
            {study.sample && <span className="text-[12px] text-fg-3">Sample</span>}
          </div>
        </div>
        <span className="text-[11.5px] text-fg-3 tabular group-hover:hidden">{timeAgo(study.addedAt)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hidden h-6 w-6 items-center justify-center rounded text-fg-3 hover:bg-line hover:text-fg group-hover:inline-flex"
          aria-label={`Remove ${study.name}`}
        >
          <X size={14} />
        </button>
      </div>
    </li>
  );
}

export default function StudyList() {
  const { studies, selectedId, select, remove, addFiles, loadSample } = useStore();
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (files) => addFiles(files),
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    noClick: true,
    noKeyboard: true,
  });

  return (
    <aside
      {...getRootProps()}
      className={cn(
        'relative flex w-[300px] shrink-0 flex-col border-r border-line bg-panel',
        isDragActive && 'ring-2 ring-accent ring-inset',
      )}
    >
      <input {...getInputProps()} />
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div>
          <h2 className="text-[13px] font-semibold">Studies</h2>
          <p className="text-[12px] text-fg-3">{studies.length ? `${studies.length} in this session` : 'No studies yet'}</p>
        </div>
      </div>

      <div className="px-3">
        <button
          onClick={open}
          className="flex w-full items-center gap-3 rounded-md border border-dashed border-line px-3 py-3 text-left hover:border-fg-3 hover:bg-panel-2"
        >
          <ImagePlus size={18} className="shrink-0 text-fg-2" />
          <span>
            <span className="block text-[13px] font-medium">Add X-ray images</span>
            <span className="block text-[12px] text-fg-3">Drop files or browse. JPG or PNG.</span>
          </span>
        </button>
      </div>

      <ul className="scroll-thin mt-3 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {studies.map((s) => (
          <StudyRow
            key={s.id}
            study={s}
            selected={s.id === selectedId}
            onSelect={() => select(s.id)}
            onRemove={() => remove(s.id)}
          />
        ))}
      </ul>

      {!studies.some((s) => s.sample) && (
        <div className="border-t border-line px-4 py-3">
          <button onClick={loadSample} className="text-[12.5px] text-fg-2 underline-offset-2 hover:text-fg hover:underline">
            Open the sample study
          </button>
          <p className="mt-0.5 text-[12px] text-fg-3">A full-spine radiograph with saved model output.</p>
        </div>
      )}

      {isDragActive && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-panel/90 text-[13px] font-medium text-accent">
          Drop to analyze
        </div>
      )}
    </aside>
  );
}

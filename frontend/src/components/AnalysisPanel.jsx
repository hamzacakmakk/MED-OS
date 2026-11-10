import { AlertTriangle } from 'lucide-react';
import { pct } from '../lib/findings';
import { cn } from '../utils/cn';
import { Badge, SectionTitle, Spinner } from './ui';
import ReportPanel from './ReportPanel';

function RegionBlock({ result }) {
  return (
    <section className="border-b border-line px-5 py-4">
      <SectionTitle aside={<span className="text-[12px] text-fg-3">Classifier</span>}>Body region</SectionTitle>
      <div className="flex items-baseline gap-2">
        <span className="text-[20px] font-semibold tracking-tight">{result.region}</span>
        <span className="text-[13px] text-fg-2 tabular">{pct(result.regionConfidence)}</span>
      </div>
      {result.top5.length > 1 && (
        <ul className="mt-3 space-y-1.5">
          {result.top5.map((p) => (
            <li key={p.name} className="grid grid-cols-[64px_1fr_40px] items-center gap-2 text-[12px]">
              <span className="truncate text-fg-2">{p.name}</span>
              <span className="h-1 rounded-full bg-panel-2">
                <span
                  className={cn('block h-1 rounded-full', p.name === result.region ? 'bg-accent' : 'bg-fg-3/50')}
                  style={{ width: `${Math.max(1, p.confidence * 100)}%` }}
                />
              </span>
              <span className="text-right text-fg-3 tabular">{pct(p.confidence)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Findings({ result, highlight, onHighlight }) {
  if (result.kind === 'spine') {
    const s = result.spine;
    return (
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-semibold tracking-tight tabular">{s.angle}°</span>
          <span className="text-[13px] text-fg-2">approx. Cobb angle</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Badge tone={s.grade.tone}>{s.grade.label}</Badge>
          <span className="text-[12.5px] text-fg-2">{s.count} vertebrae detected</span>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-fg-3">
          Estimated from the centroids of the top, apical and bottom vertebrae. Endplate-based measurement by a
          radiologist is the reference.
        </p>
      </div>
    );
  }
  if (result.kind === 'knee') {
    return (
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-semibold tracking-tight">Grade {result.knee.label}</span>
        </div>
        <p className="mt-1 text-[12.5px] text-fg-2">Osteoarthritis grade, {pct(result.knee.confidence)} confidence</p>
      </div>
    );
  }
  if (result.kind === 'detections') {
    if (!result.detections.length) return <p className="text-[13px] text-fg-2">The model found no abnormality in this image.</p>;
    return (
      <ul className="-mx-2">
        {result.detections.map((d) => (
          <li key={d.id}>
            <button
              onMouseEnter={() => onHighlight(d.id)}
              onMouseLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(d.id)}
              onBlur={() => onHighlight(null)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px]',
                highlight === d.id ? 'bg-panel-2' : 'hover:bg-panel-2',
              )}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-sm bg-annot" />
                {d.label}
              </span>
              <span className="text-fg-2 tabular">{pct(d.confidence)}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-[13px] leading-relaxed text-fg-2">{result.summary || 'No structured output for this region yet.'}</p>;
}

export default function AnalysisPanel({ study, highlight, onHighlight }) {
  let body;
  if (!study) {
    body = <p className="px-5 py-6 text-[13px] text-fg-3">Select a study to see the model output.</p>;
  } else if (study.status === 'uploading' || study.status === 'analyzing') {
    body = (
      <div className="flex items-center gap-2.5 px-5 py-6 text-[13px] text-fg-2">
        <Spinner />
        {study.status === 'uploading' ? 'Uploading image' : 'Classifying region and running the detection model'}
      </div>
    );
  } else if (study.status === 'failed') {
    body = (
      <div className="px-5 py-5">
        <div className="flex gap-2.5 rounded-md border border-bad/30 bg-bad/8 p-3 text-[13px]">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-bad" />
          <div>
            <p className="font-medium">Analysis failed</p>
            <p className="mt-0.5 text-fg-2">{study.error}</p>
            <p className="mt-2 text-[12px] text-fg-3">Check that the API, Redis and the Celery worker are running.</p>
          </div>
        </div>
      </div>
    );
  } else {
    body = (
      <>
        <RegionBlock result={study.result} />
        <section className="border-b border-line px-5 py-4">
          <SectionTitle aside={<span className="text-[12px] text-fg-3">{study.result.region} model</span>}>Findings</SectionTitle>
          <Findings result={study.result} highlight={highlight} onHighlight={onHighlight} />
        </section>
        <ReportPanel study={study} />
      </>
    );
  }

  return (
    <aside className="scroll-thin flex w-[360px] shrink-0 flex-col overflow-y-auto border-l border-line bg-panel">
      <div className="flex h-11 shrink-0 items-center border-b border-line px-5">
        <h2 className="text-[13px] font-semibold">Analysis</h2>
      </div>
      {body}
    </aside>
  );
}

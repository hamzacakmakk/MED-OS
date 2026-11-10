import { useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { useStore } from '../lib/store';
import { findingsForReport } from '../lib/findings';
import { Button, SectionTitle, Spinner } from './ui';

const field =
  'w-full rounded-md border border-line bg-bg px-2.5 py-2 text-[13px] placeholder:text-fg-3 focus:border-accent focus:outline-none';

export default function ReportPanel({ study }) {
  const { patchReport, draftReport } = useStore();
  const [copied, setCopied] = useState(false);
  const r = study.report;
  const findings = findingsForReport(study.result);

  const copy = async () => {
    await navigator.clipboard.writeText(r.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const download = () => {
    const blob = new Blob([r.text], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${study.name.replace(/\.[^.]+$/, '')}-report.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <section className="px-5 py-4">
      <SectionTitle aside={<span className="text-[12px] text-fg-3">Gemini 2.5 Flash</span>}>Draft report</SectionTitle>

      <details className="group mb-3 rounded-md border border-line">
        <summary className="cursor-pointer list-none px-3 py-2 text-[12.5px] text-fg-2 select-none hover:text-fg">
          Findings sent to the model ({findings.length})
        </summary>
        <ul className="space-y-1 border-t border-line px-3 py-2 font-mono text-[11.5px] leading-5 text-fg-2">
          {findings.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </details>

      <label className="mb-1 block text-[12px] font-medium text-fg-2" htmlFor="pinfo">
        Clinical context <span className="font-normal text-fg-3">(optional)</span>
      </label>
      <textarea
        id="pinfo"
        rows={2}
        value={r.patientInfo}
        onChange={(e) => patchReport(study.id, { patientInfo: e.target.value })}
        placeholder="Age, sex, complaint. Leave empty and the report says Bilinmiyor."
        className={field}
      />
      <label className="mt-3 mb-1 block text-[12px] font-medium text-fg-2" htmlFor="labs">
        Lab anomalies <span className="font-normal text-fg-3">(one per line)</span>
      </label>
      <textarea
        id="labs"
        rows={2}
        value={r.labs}
        onChange={(e) => patchReport(study.id, { labs: e.target.value })}
        placeholder="CRP 48 mg/L"
        className={field}
      />

      <Button
        variant="primary"
        className="mt-3 w-full"
        onClick={() => draftReport(study.id)}
        disabled={r.status === 'loading'}
      >
        {r.status === 'loading' ? (
          <>
            <Spinner /> Drafting report
          </>
        ) : r.status === 'ready' ? (
          'Draft again'
        ) : (
          'Draft report'
        )}
      </Button>

      {r.status === 'error' && <p className="mt-2 text-[12.5px] text-bad">Could not draft the report: {r.error}</p>}

      {r.status === 'ready' && (
        <div className="mt-4">
          <textarea
            value={r.text}
            onChange={(e) => patchReport(study.id, { text: e.target.value })}
            rows={14}
            className={`${field} font-mono text-[12px] leading-5`}
            aria-label="Report text"
          />
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={copy}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button size="sm" onClick={download}>
              <Download size={14} /> Download .txt
            </Button>
          </div>
        </div>
      )}

      <p className="mt-4 text-[11.5px] leading-relaxed text-fg-3">
        The draft is generated from model output only and must be reviewed and signed by a physician.
      </p>
    </section>
  );
}

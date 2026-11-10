import { create } from 'zustand';
import { submitImage, getTask, generateReport } from './api';
import { normalize, findingsForReport } from './findings';

const POLL_MS = 1500;
const TIMEOUT_MS = 3 * 60 * 1000;
let seq = 0;
let sampleLoading = false;

const emptyReport = { status: 'idle', text: '', error: '', patientInfo: '', labs: '' };

export const useStore = create((set, get) => ({
  studies: [],
  selectedId: null,

  select: (id) => set({ selectedId: id }),

  patch: (id, fields) =>
    set((s) => ({ studies: s.studies.map((st) => (st.id === id ? { ...st, ...fields } : st)) })),

  patchReport: (id, fields) =>
    set((s) => ({
      studies: s.studies.map((st) => (st.id === id ? { ...st, report: { ...st.report, ...fields } } : st)),
    })),

  remove: (id) =>
    set((s) => {
      const studies = s.studies.filter((st) => st.id !== id);
      const gone = s.studies.find((st) => st.id === id);
      if (gone?.url?.startsWith('blob:')) URL.revokeObjectURL(gone.url);
      return { studies, selectedId: s.selectedId === id ? studies[0]?.id ?? null : s.selectedId };
    }),

  addFiles: (files) => {
    const images = [...files].filter((f) => /^image\/(png|jpe?g)$/.test(f.type));
    images.forEach((file) => {
      const id = `s${++seq}`;
      set((s) => ({
        studies: [
          { id, name: file.name, url: URL.createObjectURL(file), status: 'uploading', addedAt: Date.now(), result: null, error: '', report: { ...emptyReport } },
          ...s.studies,
        ],
        selectedId: id,
      }));
      get().run(id, file);
    });
    return images.length;
  },

  run: async (id, file) => {
    const { patch } = get();
    try {
      const taskId = await submitImage(file);
      patch(id, { status: 'analyzing', taskId });
      const started = Date.now();
      for (;;) {
        await new Promise((r) => setTimeout(r, POLL_MS));
        if (!get().studies.some((s) => s.id === id)) return; // removed meanwhile
        const { state, result } = await getTask(taskId);
        if (state === 'SUCCESS') {
          const findings = normalize(result);
          patch(id, { status: 'complete', result: findings });
          return;
        }
        if (state === 'FAILURE' || state === 'REVOKED') throw new Error('The analysis worker reported a failure.');
        if (Date.now() - started > TIMEOUT_MS) throw new Error('Timed out waiting for the analysis worker.');
      }
    } catch (err) {
      patch(id, { status: 'failed', error: err.message || String(err) });
    }
  },

  loadSample: async () => {
    const existing = get().studies.find((s) => s.sample);
    if (existing) return set({ selectedId: existing.id });
    if (sampleLoading) return;
    sampleLoading = true;
    const raw = await fetch('/samples/spine-sample.json')
      .then((r) => r.json())
      .finally(() => {
        sampleLoading = false;
      });
    const id = `s${++seq}`;
    set((s) => ({
      studies: [
        {
          id,
          name: 'spine-sample.jpg',
          url: '/samples/spine-sample.jpg',
          status: 'complete',
          sample: true,
          addedAt: Date.now(),
          result: normalize(raw),
          error: '',
          report: { ...emptyReport },
        },
        ...s.studies,
      ],
      selectedId: id,
    }));
  },

  draftReport: async (id) => {
    const study = get().studies.find((s) => s.id === id);
    if (!study?.result) return;
    const { patchReport } = get();
    patchReport(id, { status: 'loading', error: '' });
    try {
      const text = await generateReport({
        findings: findingsForReport(study.result),
        labAnomalies: study.report.labs.split('\n').map((l) => l.trim()).filter(Boolean),
        patientInfo: study.report.patientInfo,
      });
      patchReport(id, { status: 'ready', text });
    } catch (err) {
      patchReport(id, { status: 'error', error: err.message || String(err) });
    }
  },
}));

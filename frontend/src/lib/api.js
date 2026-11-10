// All requests go through the Vite dev proxy: /api/* -> http://127.0.0.1:8000/*
const BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    } catch {
      // A non-JSON 5xx comes from the dev proxy when nothing listens on the API port.
      if (res.status >= 500) detail = 'The API is not responding. Is uvicorn running on port 8000?';
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function checkHealth() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${BASE}/`, { signal: controller.signal });
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

/** Upload one image. Resolves to the Celery task id. */
export async function submitImage(file) {
  const form = new FormData();
  form.append('files', file);
  const data = await request('/yolo/detect/', { method: 'POST', body: form });
  const task = data?.tasks?.[0];
  if (!task?.task_id) throw new Error('The server did not return a task id.');
  return task.task_id;
}

/** One poll of a Celery task. Returns { state, result }. */
export async function getTask(taskId) {
  const data = await request(`/yolo/task/${encodeURIComponent(taskId)}`);
  return { state: data.status ?? data.ststus ?? 'PENDING', result: data.result };
}

export async function generateReport({ findings, labAnomalies, patientInfo }) {
  const data = await request('/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      yolo_findings: findings,
      blood_test_anomalies: labAnomalies,
      patient_info: patientInfo?.trim() || 'Bilinmiyor',
    }),
  });
  return data.report_text;
}

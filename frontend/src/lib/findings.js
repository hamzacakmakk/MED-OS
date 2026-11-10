// Turns the raw Celery task result into one shape the UI can render.
//
// Raw result: { file, result: { top1, top5_predictions: [...] }, analysis: {...} }
// The analysis object differs per body region (see backend/full_api/app/yolo_choser.py).

const pct = (v) => {
  if (v > 0 && v < 0.01) return '<1%';
  if (v > 0.99 && v < 1) return `${(Math.floor(v * 1000) / 10).toFixed(1)}%`;
  return `${Math.round(v * 100)}%`;
};

export function regionLabel(name) {
  if (!name) return 'Unknown';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function scoliosisGrade(angle) {
  if (angle < 10) return { label: 'Within normal limits', tone: 'ok' };
  if (angle < 20) return { label: 'Mild scoliosis', tone: 'warn' };
  if (angle < 40) return { label: 'Moderate scoliosis', tone: 'warn' };
  return { label: 'Severe scoliosis', tone: 'bad' };
}

export function normalize(raw) {
  if (!raw) return null;
  const chooser = raw.result || raw.chooser_result || {};
  const analysis = raw.analysis || {};
  const top5 = (chooser.top5_predictions || []).map((p) => ({
    name: regionLabel(p['class name'] ?? p.class_name ?? String(p.class_id)),
    confidence: Number(p.confidence) || 0,
  }));
  const region = regionLabel(chooser.top1 || top5[0]?.name);
  const regionConfidence = top5.find((p) => p.name === region)?.confidence ?? top5[0]?.confidence ?? 0;

  const out = {
    region,
    regionConfidence,
    top5,
    kind: 'text',
    summary: analysis.analysis || analysis.analysis_result || '',
    detections: [],
    spine: null,
    knee: null,
  };

  const dets = analysis.detected_disase || analysis.detected_disases || analysis.detections;
  if (Array.isArray(dets)) {
    out.kind = 'detections';
    out.detections = dets
      .map((d, i) => ({
        id: i,
        label: d.disase_name ?? d.label ?? 'finding',
        confidence: Number(d.confidence) || 0,
        box: d.cordinates ?? d.box ?? null,
      }))
      .sort((a, b) => b.confidence - a.confidence);
  } else if (typeof analysis.cobb_angle_degree === 'number') {
    out.kind = 'spine';
    const d = analysis.details || {};
    out.spine = {
      angle: analysis.cobb_angle_degree,
      count: analysis.detected_vertebrae_count ?? 0,
      points: [d.top_point, d.apex_point, d.bottom_point].filter(Boolean),
      vertebrae: analysis.vertebrae || [],
      grade: scoliosisGrade(analysis.cobb_angle_degree),
    };
  } else if (analysis.kl_grade !== undefined) {
    out.kind = 'knee';
    out.knee = {
      grade: analysis.kl_grade,
      label: analysis.grade_label ?? String(analysis.kl_grade),
      confidence: Number(analysis.confidence) || 0,
    };
  } else if (/no findings|bulunamadı/i.test(out.summary)) {
    out.kind = 'detections';
  }
  return out;
}

/** Plain-language findings list sent to the report endpoint. */
export function findingsForReport(f) {
  if (!f) return [];
  const lines = [`Görüntülenen bölge: ${f.region} (sınıflandırma güveni ${pct(f.regionConfidence)})`];
  if (f.kind === 'detections') {
    if (f.detections.length === 0) lines.push('Modelin tespit ettiği patolojik bulgu yok');
    f.detections.forEach((d) => lines.push(`${d.label} (güven ${pct(d.confidence)})`));
  } else if (f.kind === 'spine') {
    lines.push(`Yaklaşık Cobb açısı ${f.spine.angle}°, ${f.spine.count} omur tespit edildi`);
    if (f.summary) lines.push(f.summary);
  } else if (f.kind === 'knee') {
    lines.push(`Diz osteoartriti derecesi ${f.knee.label} (güven ${pct(f.knee.confidence)})`);
  } else if (f.summary) {
    lines.push(f.summary);
  }
  return lines;
}

export { pct };

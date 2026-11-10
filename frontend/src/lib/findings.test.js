import { describe, expect, it } from 'vitest';
import sample from '../../public/samples/spine-sample.json';
import { findingsForReport, normalize, pct, regionLabel, scoliosisGrade } from './findings';

const chooser = (top1) => ({
  top1,
  top5_predictions: [
    { class_id: 0, 'class name': top1, confidence: 0.93 },
    { class_id: 1, 'class name': 'Knee', confidence: 0.05 },
  ],
});

describe('pct', () => {
  it('rounds, keeps one decimal near 100% and marks tiny values', () => {
    expect(pct(0.5)).toBe('50%');
    expect(pct(0.9985)).toBe('99.8%');
    expect(pct(1)).toBe('100%');
    expect(pct(0.004)).toBe('<1%');
    expect(pct(0)).toBe('0%');
  });
});

describe('regionLabel', () => {
  it('normalizes class names', () => {
    expect(regionLabel('CHEST')).toBe('Chest');
    expect(regionLabel('spine')).toBe('Spine');
    expect(regionLabel('')).toBe('Unknown');
  });
});

describe('scoliosisGrade', () => {
  it.each([
    [5, 'Within normal limits', 'ok'],
    [10, 'Mild scoliosis', 'warn'],
    [25, 'Moderate scoliosis', 'warn'],
    [40, 'Severe scoliosis', 'bad'],
  ])('%s degrees -> %s', (angle, label, tone) => {
    expect(scoliosisGrade(angle)).toEqual({ label, tone });
  });
});

describe('normalize', () => {
  it('returns null for a missing result', () => {
    expect(normalize(null)).toBeNull();
  });

  it('reads the saved spine sample', () => {
    const f = normalize(sample);
    expect(f.kind).toBe('spine');
    expect(f.region).toBe('Spine');
    expect(f.regionConfidence).toBeGreaterThan(0.99);
    expect(f.spine.angle).toBe(18.5);
    expect(f.spine.count).toBe(17);
    expect(f.spine.points).toHaveLength(3);
    expect(f.spine.vertebrae).toHaveLength(17);
    expect(f.spine.grade.label).toBe('Mild scoliosis');
  });

  it('sorts chest detections by confidence and keeps boxes', () => {
    const f = normalize({
      result: chooser('Chest'),
      analysis: {
        analysis: 'toplam 2 hastalık tespit edildi',
        detected_disase: [
          { disase_name: 'Nodule', confidence: 0.41, cordinates: [1, 2, 3, 4] },
          { disase_name: 'Effusion', confidence: 0.87, cordinates: [5, 6, 7, 8] },
        ],
      },
    });
    expect(f.kind).toBe('detections');
    expect(f.detections.map((d) => d.label)).toEqual(['Effusion', 'Nodule']);
    expect(f.detections[0].box).toEqual([5, 6, 7, 8]);
  });

  it('reads skull detections, which use a different key', () => {
    const f = normalize({
      result: chooser('Skull'),
      analysis: { detected_disases: [{ disase_name: 'Fracture', confidence: 0.7, cordinates: [0, 0, 1, 1] }] },
    });
    expect(f.detections).toHaveLength(1);
  });

  it('treats a "nothing found" message as an empty detection list', () => {
    const f = normalize({ result: chooser('Chest'), analysis: { analysis: 'göğüs grafisinde herhangi bir hastalık bulunamadı' } });
    expect(f.kind).toBe('detections');
    expect(f.detections).toEqual([]);
  });

  it('reads the structured knee grade', () => {
    const f = normalize({ result: chooser('Knee'), analysis: { kl_grade: 2, grade_label: '2', confidence: 0.8 } });
    expect(f.kind).toBe('knee');
    expect(f.knee).toEqual({ grade: 2, label: '2', confidence: 0.8 });
  });

  it('falls back to the text summary for regions without a model', () => {
    const f = normalize({ result: chooser('Elbow'), analysis: { analysis: 'Bu bölge için henüz bir analiz modeli bulunmamaktadır' } });
    expect(f.kind).toBe('text');
    expect(f.summary).toMatch(/henüz/);
  });
});

describe('findingsForReport', () => {
  it('describes the spine sample in Turkish for the report prompt', () => {
    const lines = findingsForReport(normalize(sample));
    expect(lines[0]).toMatch(/^Görüntülenen bölge: Spine/);
    expect(lines.some((l) => l.includes('18.5°') && l.includes('17 omur'))).toBe(true);
  });

  it('says so when no pathology was detected', () => {
    const lines = findingsForReport(normalize({ result: chooser('Chest'), analysis: { detected_disase: [] } }));
    expect(lines).toContain('Modelin tespit ettiği patolojik bulgu yok');
  });

  it('returns nothing without findings', () => {
    expect(findingsForReport(null)).toEqual([]);
  });
});

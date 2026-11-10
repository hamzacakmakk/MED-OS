import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Contrast, Layers, Maximize, Minus, Plus, SunMedium } from 'lucide-react';
import { IconButton } from './ui';

function Overlay({ result, size, scale, highlight }) {
  if (!result || !size.w) return null;
  const sw = 2; // stroke width in screen px (non-scaling)
  const font = 13 / scale;
  const pad = 4 / scale;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${size.w} ${size.h}`}
      preserveAspectRatio="none"
      overflow="visible"
    >
      {result.kind === 'detections' &&
        result.detections.map((d) => {
          if (!d.box) return null;
          const [x1, y1, x2, y2] = d.box;
          const dim = highlight != null && highlight !== d.id;
          const label = `${d.label} ${Math.round(d.confidence * 100)}%`;
          return (
            <g key={d.id} opacity={dim ? 0.35 : 1}>
              <rect
                x={x1}
                y={y1}
                width={x2 - x1}
                height={y2 - y1}
                fill="none"
                stroke="var(--annot)"
                strokeWidth={highlight === d.id ? sw + 1 : sw}
                vectorEffect="non-scaling-stroke"
              />
              <rect x={x1} y={y1 - font - pad * 2} width={label.length * font * 0.58 + pad * 2} height={font + pad * 2} fill="var(--annot)" />
              <text x={x1 + pad} y={y1 - pad * 1.6} fontSize={font} fill="#111" fontFamily="Inter Variable, sans-serif" fontWeight="600">
                {label}
              </text>
            </g>
          );
        })}

      {result.kind === 'spine' && (
        <g>
          {result.spine.vertebrae.map(([x1, y1, x2, y2], i) => (
            <rect
              key={i}
              x={x1}
              y={y1}
              width={x2 - x1}
              height={y2 - y1}
              fill="none"
              stroke="var(--annot)"
              strokeOpacity="0.55"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {result.spine.points.length === 3 && (
            <>
              <polyline
                points={result.spine.points.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="var(--annot)"
                strokeWidth={sw}
                vectorEffect="non-scaling-stroke"
              />
              {result.spine.points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={5 / scale} fill="var(--annot)" />
              ))}
              {(() => {
                const a = result.spine.points[1];
                const text = `Cobb ≈ ${result.spine.angle}°`;
                const w = text.length * font * 0.6 + pad * 2;
                const x = a.x + 14 / scale;
                const y = a.y - font / 2 - pad;
                return (
                  <g>
                    <rect x={x} y={y} width={w} height={font + pad * 2} rx={2 / scale} fill="var(--annot)" />
                    <text x={x + pad} y={y + font + pad * 0.4} fontSize={font} fill="#111" fontFamily="Inter Variable, sans-serif" fontWeight="600">
                      {text}
                    </text>
                  </g>
                );
              })()}
            </>
          )}
        </g>
      )}
    </svg>
  );
}

export default function Viewer({ study, highlight }) {
  const boxRef = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [img, setImg] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [invert, setInvert] = useState(false);
  const [overlay, setOverlay] = useState(true);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const drag = useRef(null);
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const fit = img.w && box.w ? Math.min((box.w - 48) / img.w, (box.h - 48) / img.h) : 1;
  const scale = fit * zoom;
  const w = img.w * scale;
  const h = img.h * scale;
  const left = (box.w - w) / 2 + pan.x;
  const top = (box.h - h) / 2 + pan.y;

  const zoomBy = (f) => setZoom((z) => Math.min(8, Math.max(0.5, z * f)));

  const onWheel = (e) => {
    if (!img.w) return;
    zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12);
  };
  const onPointerDown = (e) => {
    drag.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    setPan({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y });
  };
  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input, textarea')) return;
      if (e.key === '+' || e.key === '=') zoomBy(1.2);
      else if (e.key === '-') zoomBy(1 / 1.2);
      else if (e.key === '0') reset();
      else if (e.key === 'i') setInvert((v) => !v);
      else if (e.key === 'o') setOverlay((v) => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reset]);

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-viewer">
      <div className="flex h-11 shrink-0 items-center gap-1 border-b border-white/10 px-3 text-neutral-300">
        <IconButton label="Zoom out (-)" onClick={() => zoomBy(1 / 1.2)} disabled={!study}>
          <Minus size={16} />
        </IconButton>
        <span className="w-12 text-center text-[12px] tabular text-neutral-400">{Math.round(zoom * 100)}%</span>
        <IconButton label="Zoom in (+)" onClick={() => zoomBy(1.2)} disabled={!study}>
          <Plus size={16} />
        </IconButton>
        <IconButton label="Fit to screen (0)" onClick={reset} disabled={!study}>
          <Maximize size={15} />
        </IconButton>
        <span className="mx-2 h-5 w-px bg-white/10" />
        <IconButton label="Invert (I)" active={invert} onClick={() => setInvert((v) => !v)} disabled={!study}>
          <Contrast size={16} />
        </IconButton>
        <IconButton label="Show model overlay (O)" active={overlay} onClick={() => setOverlay((v) => !v)} disabled={!study}>
          <Layers size={16} />
        </IconButton>
        <span className="mx-2 h-5 w-px bg-white/10" />
        <label className="flex items-center gap-2 text-[12px] text-neutral-400" title="Brightness">
          <SunMedium size={15} />
          <input
            type="range"
            min="50"
            max="160"
            value={brightness}
            onChange={(e) => setBrightness(+e.target.value)}
            className="w-20 accent-neutral-300"
            aria-label="Brightness"
          />
        </label>
        <label className="ml-3 flex items-center gap-2 text-[12px] text-neutral-400" title="Contrast">
          <span className="text-[11px] font-semibold">C</span>
          <input
            type="range"
            min="50"
            max="200"
            value={contrast}
            onChange={(e) => setContrast(+e.target.value)}
            className="w-20 accent-neutral-300"
            aria-label="Contrast"
          />
        </label>
        {study && (
          <span className="ml-auto truncate pl-4 text-[12px] text-neutral-500">
            {study.name}
            {img.w ? ` · ${img.w} × ${img.h}` : ''}
          </span>
        )}
      </div>

      <div
        ref={boxRef}
        className="relative flex-1 touch-none overflow-hidden select-none"
        onWheel={onWheel}
        onPointerDown={study ? onPointerDown : undefined}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={reset}
        style={{ cursor: study ? (dragging ? 'grabbing' : 'grab') : 'default' }}
      >
        {study ? (
          <div className="absolute" style={{ left, top, width: w || undefined, height: h || undefined }}>
            <img
              src={study.url}
              alt={study.name}
              draggable={false}
              onLoad={(e) => setImg({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
              className="block h-full w-full"
              style={{
                visibility: img.w ? 'visible' : 'hidden',
                filter: `${invert ? 'invert(1) ' : ''}brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            />
            {overlay && study.result && <Overlay result={study.result} size={img} scale={scale} highlight={highlight} />}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-xs text-center">
              <p className="text-[14px] font-medium text-neutral-300">No study open</p>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                Add an X-ray from the left panel. The image is classified by body region and read by the matching model.
              </p>
            </div>
          </div>
        )}
        {study && img.w > 0 && (
          <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[11px] leading-5 text-neutral-500">
            <div>Zoom {Math.round(scale * 100)}%</div>
            <div>
              B {brightness} · C {contrast}
              {invert ? ' · Inverted' : ''}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

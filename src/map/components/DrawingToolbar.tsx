import { useMapContext } from '../core/useMapContext';
import type { DrawMode } from '../drawing/DrawController';

const MODES: { mode: DrawMode; label: string }[] = [
  { mode: 'select', label: 'Select / Edit' },
  { mode: 'linestring', label: 'Line' },
  { mode: 'polygon', label: 'Polygon' },
  { mode: 'point', label: 'Point' },
];

export function DrawingToolbar() {
  const { drawControllerRef, isReady } = useMapContext();

  if (!isReady) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        display: 'flex',
        gap: 8,
        background: 'white',
        padding: 8,
        borderRadius: 6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {MODES.map(({ mode, label }) => (
        <button key={mode} onClick={() => drawControllerRef.current?.setMode(mode)}>
          {label}
        </button>
      ))}
      <button onClick={() => drawControllerRef.current?.clear()}>Clear</button>
    </div>
  );
}

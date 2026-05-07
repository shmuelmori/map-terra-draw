import { useMapContext } from '../core/useMapContext';
import type { DrawMode } from '../drawing/DrawController';

const LABELS: Record<DrawMode, string> = {
  select: 'Select / Edit',
  linestring: 'Line',
  polygon: 'Polygon',
  point: 'Point',
  static: 'Static',
};

interface Props {
  modes?: DrawMode[];
}

export function DrawingToolbar({ modes = ['select', 'linestring'] }: Props) {
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
      {modes.map((mode) => (
        <button key={mode} onClick={() => drawControllerRef.current?.setMode(mode)}>
          {LABELS[mode]}
        </button>
      ))}
      <button onClick={() => drawControllerRef.current?.clear()}>Clear</button>
    </div>
  );
}

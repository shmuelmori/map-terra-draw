import { MapProvider } from '../../map/core/MapProvider';
import { MapCanvas } from '../../map/components/MapCanvas';
import { DrawingToolbar } from '../../map/components/DrawingToolbar';

export function MapEditorPage() {
  return (
    <MapProvider>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MapCanvas />
        <DrawingToolbar />
      </div>
    </MapProvider>
  );
}

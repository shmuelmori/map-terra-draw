import { MapProvider } from '../../map/core/MapProvider';
import { MapCanvas } from '../../map/components/MapCanvas';

export function MapViewerPage() {
  return (
    <MapProvider>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MapCanvas />
      </div>
    </MapProvider>
  );
}

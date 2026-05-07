import { useEffect, useRef } from 'react';
import type { Feature } from 'geojson';
import { MapProvider } from '../../map/core/MapProvider';
import { useMapContext } from '../../map/core/useMapContext';
import { MapCanvas } from '../../map/components/MapCanvas';
import { DrawingToolbar } from '../../map/components/DrawingToolbar';
import { useAppSelector } from '../../app/store';
import type { RootState } from '../../app/store';

function selectAllFeatures(state: RootState): Feature[] {
  const { byId, allIds } = state.mapData;
  return allIds.map((id) => byId[id]);
}

function InitialFeatureLoader() {
  const { drawControllerRef, isReady } = useMapContext();
  const features = useAppSelector(selectAllFeatures);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!isReady) return;
    if (loadedRef.current) return;
    const controller = drawControllerRef.current;
    if (!controller) return;
    if (features.length > 0) {
      controller.addFeatures(features);
    }
    loadedRef.current = true;
    // We deliberately load once, on first ready. Later mutations live in Terra Draw
    // until the debounced syncer pushes them back to Redux.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  return null;
}

export function MapEditorPage() {
  return (
    <MapProvider>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MapCanvas enableDrawing />
        <DrawingToolbar />
        <InitialFeatureLoader />
      </div>
    </MapProvider>
  );
}

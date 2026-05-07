import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapContext } from '../core/useMapContext';
import { DrawController, type DrawControllerTools } from '../drawing/DrawController';
import { useAppDispatch } from '../../app/store';
import { createDrawSyncer } from '../sync/createDrawSyncer';

interface Props {
  enableDrawing?: boolean;
  drawTools?: DrawControllerTools;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export function MapCanvas({
  enableDrawing = false,
  drawTools,
  initialCenter = [34.78, 32.08],
  initialZoom = 10,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { mapRef, drawControllerRef, setReady } = useMapContext();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: initialCenter,
      zoom: initialZoom,
    });

    mapRef.current = map;

    map.on('load', () => {
      if (enableDrawing) {
        const syncer = createDrawSyncer(dispatch);
        const controller = new DrawController({
          map,
          tools: drawTools,
          onChange: (features) => syncer(features),
        });
        drawControllerRef.current = controller;
      }
      setReady(true);
    });

    return () => {
      drawControllerRef.current?.destroy();
      drawControllerRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // Intentionally only on mount/unmount - the map should not rebuild on prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

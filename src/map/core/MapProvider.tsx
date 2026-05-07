import { createContext, useRef, useState, type ReactNode, type MutableRefObject } from 'react';
import type maplibregl from 'maplibre-gl';
import type { DrawController } from '../drawing/DrawController';

export interface MapContextValue {
  mapRef: MutableRefObject<maplibregl.Map | null>;
  drawControllerRef: MutableRefObject<DrawController | null>;
  isReady: boolean;
  setReady: (ready: boolean) => void;
}

export const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const drawControllerRef = useRef<DrawController | null>(null);
  const [isReady, setReady] = useState(false);

  return (
    <MapContext.Provider value={{ mapRef, drawControllerRef, isReady, setReady }}>
      {children}
    </MapContext.Provider>
  );
}

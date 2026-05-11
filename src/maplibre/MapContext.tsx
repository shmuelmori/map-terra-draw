import { createContext, type MutableRefObject } from "react";
import type { Map } from "maplibre-gl";
import type { GeoJSONStoreFeatures, TerraDraw } from "terra-draw";

export interface MapContextValue {
  mapRef: MutableRefObject<Map | null>;
  containerEl: HTMLDivElement | null;
  drawRef: MutableRefObject<TerraDraw | null>;
  activeMode: string;
  setMode: (mode: string) => void;
  getSnapshot: () => GeoJSONStoreFeatures[];
  clearAll: () => void;
}

export const MapContext = createContext<MapContextValue>({
  mapRef: { current: null },
  containerEl: null,
  drawRef: { current: null },
  activeMode: "",
  setMode: () => {},
  getSnapshot: () => [],
  clearAll: () => {},
});

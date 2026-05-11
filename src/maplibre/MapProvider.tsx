import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Map } from "maplibre-gl";
import { TerraDraw } from "terra-draw";
import { TerraDrawMapLibreGLAdapter } from "terra-draw-maplibre-gl-adapter";
import { MapContext } from "./MapContext";
import { SUPPORTED_MODES, createMode } from "./drawModes";

const STYLE_URL =
  "https://api.maptiler.com/maps/hybrid-v4/style.json?key=kDiVSzuDbecb3fEkA28s";
const CENTER: [number, number] = [34.7, 32];
const ZOOM = 10;

function createContainerEl() {
  const el = document.createElement("div");
  el.style.width = "100%";
  el.style.height = "100%";
  return el;
}

export function MapProvider({ children }: { children: ReactNode }) {
  const mapRef = useRef<Map | null>(null);
  const drawRef = useRef<TerraDraw | null>(null);
  const containerElRef = useRef<HTMLDivElement | null>(null);
  const [activeMode, setActiveMode] = useState("");

  if (!containerElRef.current) {
    containerElRef.current = createContainerEl();
  }

  useEffect(() => {
    const m = new Map({
      container: containerElRef.current!,
      style: STYLE_URL,
      center: CENTER,
      zoom: ZOOM,
    });
    
    mapRef.current = m;

    m.on("load", () => {
      const draw = new TerraDraw({
        adapter: new TerraDrawMapLibreGLAdapter({ map: m }),
        modes: SUPPORTED_MODES.map(createMode),
      });
      draw.start();

      // MapLibre GL v5 renders line-dasharray:[] as invisible (zero-length dashes).
      // The adapter sets this expression for v5.8+ as a fallback; nulling it restores solid lines.
      m.setPaintProperty("td-linestring", "line-dasharray", null);

      drawRef.current = draw;
      draw.setMode(SUPPORTED_MODES[0]);
      setActiveMode(SUPPORTED_MODES[0]);
    });

    return () => {
      drawRef.current?.stop();
      drawRef.current = null;
      m.remove();
      mapRef.current = null;
      setActiveMode("");
    };
  }, []);

  const setMode = useCallback((mode: string) => {
    drawRef.current?.setMode(mode);
    setActiveMode(mode);
  }, []);

  const getSnapshot = useCallback(
    () => drawRef.current?.getSnapshot() ?? [],
    []
  );

  const clearAll = useCallback(() => {
    drawRef.current?.clear();
  }, []);

  const value = useMemo(
    () => ({
      mapRef,
      drawRef,
      containerEl: containerElRef.current,
      activeMode,
      setMode,
      getSnapshot,
      clearAll,
    }),
    [activeMode, setMode, getSnapshot, clearAll]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

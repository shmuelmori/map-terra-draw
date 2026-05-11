import { useEffect, useRef } from "react";
import { useMap } from "./useMap";
import Toolbar from "./Toolbar";

function MapCanvas() {
  const { mapRef, containerEl } = useMap();
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current || !containerEl) return;
    hostRef.current.appendChild(containerEl);
    mapRef.current?.resize();

    return () => {
      containerEl.parentNode?.removeChild(containerEl);
    };
  }, [containerEl, mapRef]);

  return (
    <>
      <Toolbar />
      <div ref={hostRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}

export default MapCanvas;

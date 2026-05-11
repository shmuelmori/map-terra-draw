import { useMap } from "./useMap";
import { SUPPORTED_MODES, type DrawMode } from "./drawModes";

const MODE_LABELS: Record<DrawMode, string> = {
  linestring: "Draw Line",
  select: "Select / Edit",
  point: "Point",
};

const MODE_HINTS: Record<DrawMode, string> = {
  linestring: "Click to add points — double-click to finish",
  select: "Click a feature to select — drag midpoint to reshape",
  point: "Click on the map to drop a point",
};

function Toolbar() {
  const { activeMode, setMode, getSnapshot, clearAll } = useMap();

  const handleExport = () => {
    const features = getSnapshot();

    console.log(
      "GeoJSON snapshot:",
      JSON.stringify(
        { type: "FeatureCollection", features },
        null,
        2
      )
    );
  };

  const hint = (MODE_HINTS as Record<string, string>)[activeMode];

  return (
    <>
      <div className="absolute left-3 top-3 z-10 flex gap-2">
        {SUPPORTED_MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`
              cursor-pointer rounded-md border px-4 py-1.5 font-semibold
              ${
                activeMode === mode
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-900"
              }
            `}
          >
            {MODE_LABELS[mode]}
          </button>
        ))}

        <button
          onClick={() => {
            clearAll();
            setMode(SUPPORTED_MODES[0]);
          }}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-1.5 font-semibold text-red-600"
        >
          Clear
        </button>

        <button
          onClick={handleExport}
          className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-1.5 font-semibold text-green-600"
        >
          Export
        </button>
      </div>

      {hint && (
        <div className="absolute bottom-3 left-3 z-10 rounded-md bg-white/90 px-3 py-1.5 text-sm text-gray-700">
          {hint}
        </div>
      )}
    </>
  );
}

export default Toolbar;

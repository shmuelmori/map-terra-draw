import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MapProvider } from "../maplibre/MapProvider";
import MapCanvas from "../maplibre/MapCanvas";

function App() {
  return (
    <MapProvider>
      <Router>
        <Routes>
          <Route path="/map-one" element={<MapCanvas />} />          
          <Route path="/map-two" element={<MapCanvas />} />
          <Route path="/" element={<Navigate to="/map-one" />} />
        </Routes>
      </Router>
    </MapProvider>
  );
}

export default App;

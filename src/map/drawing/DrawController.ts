import {
  TerraDraw,
  TerraDrawSelectMode,
  TerraDrawLineStringMode,
  TerraDrawPolygonMode,
  TerraDrawPointMode,
  type GeoJSONStoreFeatures,
} from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import type maplibregl from 'maplibre-gl';
import type { Feature } from 'geojson';

export type DrawMode = 'select' | 'linestring' | 'polygon' | 'point' | 'static';

export interface DrawControllerTools {
  line?: boolean;
  polygon?: boolean;
  point?: boolean;
}

export interface DrawControllerOptions {
  map: maplibregl.Map;
  tools?: DrawControllerTools;
  onChange?: (features: Feature[]) => void;
  onSelect?: (id: string) => void;
}

export class DrawController {
  private draw: TerraDraw;

  constructor(options: DrawControllerOptions) {
    const tools: DrawControllerTools = options.tools ?? { line: true };

    const selectFlags: Record<string, unknown> = {};
    if (tools.line) {
      selectFlags.linestring = {
        feature: {
          draggable: true,
          coordinates: { midpoints: { draggable: true }, draggable: true, deletable: true },
        },
      };
    }
    if (tools.polygon) {
      selectFlags.polygon = {
        feature: {
          draggable: true,
          coordinates: { midpoints: { draggable: true }, draggable: true, deletable: true },
        },
      };
    }
    if (tools.point) {
      selectFlags.point = { feature: { draggable: true } };
    }

    const selectMode = new TerraDrawSelectMode({ flags: selectFlags as never });
    const modes: ConstructorParameters<typeof TerraDraw>[0]['modes'] = [selectMode];
    if (tools.line) {
      modes.push(new TerraDrawLineStringMode({ snapping: { toCoordinate: true, toLine: true } }));
    }
    if (tools.polygon) {
      modes.push(new TerraDrawPolygonMode());
    }
    if (tools.point) {
      modes.push(new TerraDrawPointMode());
    }

    this.draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({
        map: options.map,
        coordinatePrecision: 9,
      }),
      modes,
    });

    this.draw.on('change', () => {
      const snapshot = this.draw.getSnapshot();
      options.onChange?.(snapshot);
    });

    this.draw.on('select', (id) => {
      options.onSelect?.(String(id));
    });

    this.draw.start();
  }

  setMode(mode: DrawMode): void {
    this.draw.setMode(mode);
  }

  addFeatures(features: Feature[]): void {
    // Cast at the terra-draw boundary: TerraDraw narrows geometry to
    // Polygon | LineString | Point and requires non-null properties. Callers of
    // the controller should not have to import terra-draw types.
    this.draw.addFeatures(features as unknown as GeoJSONStoreFeatures[]);
  }

  removeFeatures(ids: string[]): void {
    this.draw.removeFeatures(ids);
  }

  getSnapshot(): Feature[] {
    return this.draw.getSnapshot();
  }

  clear(): void {
    this.draw.clear();
  }

  destroy(): void {
    this.draw.stop();
  }
}

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

export interface DrawControllerOptions {
  map: maplibregl.Map;
  onChange?: (features: Feature[]) => void;
  onSelect?: (id: string) => void;
}

export class DrawController {
  private draw: TerraDraw;

  constructor(options: DrawControllerOptions) {
    this.draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({
        map: options.map,
        coordinatePrecision: 9,
      }),
      modes: [
        new TerraDrawSelectMode({
          flags: {
            linestring: {
              feature: {
                draggable: true,
                coordinates: { midpoints: { draggable: true }, draggable: true, deletable: true },
              },
            },
            polygon: {
              feature: {
                draggable: true,
                coordinates: { midpoints: { draggable: true }, draggable: true, deletable: true },
              },
            },
            point: {
              feature: { draggable: true },
            },
          },
        }),
        new TerraDrawLineStringMode({
          snapping: { toCoordinate: true, toLine: true },
        }),
        new TerraDrawPolygonMode(),
        new TerraDrawPointMode(),
      ],
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

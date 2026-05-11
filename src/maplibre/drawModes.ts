import {
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawSelectMode,
} from "terra-draw";

export type DrawMode = "linestring" | "select" | "point";

export const SUPPORTED_MODES: DrawMode[] = ["linestring", "select", "point"];

export function createMode(mode: DrawMode) {
  switch (mode) {
    case "linestring":
      return new TerraDrawLineStringMode();
    case "point":
      return new TerraDrawPointMode();
    case "select":
      return new TerraDrawSelectMode({
        flags: {
          linestring: {
            feature: {
              draggable: true,
              coordinates: {
                midpoints: { draggable: true },
                draggable: true,
                deletable: true,
              },
            },
          },
          point: {
            feature: { draggable: true },
          },
        },
      });
  }
}

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Feature } from 'geojson';

export interface MapDataState {
  byId: Record<string, Feature>;
  allIds: string[];
}

const initialState: MapDataState = {
  byId: {},
  allIds: [],
};

const featureId = (feature: Feature): string | null => {
  if (feature.id === undefined || feature.id === null) return null;
  return String(feature.id);
};

const mapDataSlice = createSlice({
  name: 'mapData',
  initialState,
  reducers: {
    upsertFeatures: (state, action: PayloadAction<Feature[]>) => {
      for (const feature of action.payload) {
        const id = featureId(feature);
        if (id === null) continue;
        if (!(id in state.byId)) {
          state.allIds.push(id);
        }
        state.byId[id] = feature;
      }
    },
    removeFeature: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (id in state.byId) {
        delete state.byId[id];
        state.allIds = state.allIds.filter((existing) => existing !== id);
      }
    },
    clearAll: (state) => {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const { upsertFeatures, removeFeature, clearAll } = mapDataSlice.actions;
export default mapDataSlice.reducer;

import { debounce } from 'lodash-es';
import type { Feature } from 'geojson';
import type { AppDispatch } from '../../app/store';
import { upsertFeatures } from '../../store/slices/mapDataSlice';

export type DrawSyncer = (features: Feature[]) => void;

export function createDrawSyncer(dispatch: AppDispatch): DrawSyncer {
  return debounce((features: Feature[]) => {
    dispatch(upsertFeatures(features));
  }, 150);
}

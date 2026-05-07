import { useContext } from 'react';
import { MapContext, type MapContextValue } from './MapProvider';

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
}

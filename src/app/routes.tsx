import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layout/AppLayout';
import { MapViewerPage } from '../features/map-viewer/MapViewerPage';
import { MapEditorPage } from '../features/map-editor/MapEditorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <MapViewerPage /> },
      { path: 'editor', element: <MapEditorPage /> },
    ],
  },
]);

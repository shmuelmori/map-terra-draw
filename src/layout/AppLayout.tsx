import { Outlet } from 'react-router-dom';
import { SideNav } from './SideNav';

export function AppLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <main style={{ flex: 1, position: 'relative', minWidth: 0 }}>
        <Outlet />
      </main>
      <SideNav />
    </div>
  );
}

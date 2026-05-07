import { NavLink } from 'react-router-dom';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  width: 240,
  flexShrink: 0,
  height: '100%',
  borderLeft: '1px solid #e5e7eb',
  background: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 16px',
  boxSizing: 'border-box',
};

const titleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  marginBottom: 24,
  color: '#111827',
};

const linkBaseStyle: CSSProperties = {
  display: 'block',
  padding: '10px 12px',
  borderRadius: 6,
  textDecoration: 'none',
  color: '#374151',
  fontSize: 14,
  marginBottom: 4,
};

const linkActiveStyle: CSSProperties = {
  background: '#eef2ff',
  color: '#3730a3',
  fontWeight: 600,
};

export function SideNav() {
  return (
    <nav style={containerStyle} aria-label="Primary">
      <div style={titleStyle}>MapLibre Drawing</div>
      <NavLink
        to="/"
        end
        style={({ isActive }) => ({
          ...linkBaseStyle,
          ...(isActive ? linkActiveStyle : null),
        })}
      >
        Map Viewer
      </NavLink>
      <NavLink
        to="/editor"
        style={({ isActive }) => ({
          ...linkBaseStyle,
          ...(isActive ? linkActiveStyle : null),
        })}
      >
        Map Editor
      </NavLink>
    </nav>
  );
}

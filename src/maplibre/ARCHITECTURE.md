# MapLibre + Terra-Draw Architecture

## המטרה

לשמור על **instance יחיד** של maplibre `Map` שחי כל זמן ה-`MapProvider`, גם כש-`MapCanvas` נכנס ויוצא מה-DOM (למשל ניווט בין routes). ככה:

- אין יצירה מחדש של Map בכל ניווט (חוסך network, WebGL contexts, memory).
- ה-state של המפה (zoom, center, drawings) נשמר בין navigations.
- ניתן להציב את `<MapCanvas />` בכמה מקומות (כמו ב-`/map-one` ו-`/map-two`) — שניהם משתפים את אותו ה-Map.

## הבעיה שפתרנו

ב-implementation נאיבי, הקוד הזה רץ בכל mount של MapCanvas:

```tsx
useEffect(() => {
  mapRef.current = new Map({ container: containerRef.current, ... });
  // ... terra-draw init
  return () => mapRef.current?.remove();
}, []);
```

תוצאה: כל mount = Map חדש. עם router שמ-mount/unmount את הקומפוננטה — ה-Map נהרס ונבנה מחדש בכל ניווט.

## הפתרון: Detached Container Pattern

`MapProvider` מחזיק `HTMLDivElement` שנוצר עם `document.createElement('div')` ולא מחובר ל-DOM. עליו בונים את ה-Map. `MapCanvas` הוא "host" שב-mount קורא `appendChild(containerEl)` כדי להכניס את ה-div ל-DOM שלו, וב-unmount קורא `removeChild` (אבל ה-Map עצמו ממשיך לחיות ב-Provider).

```
┌─────────────────────────────────────────────────┐
│ MapProvider (lifecycle של כל האפליקציה)         │
│                                                 │
│   ┌────────────────────────────────┐            │
│   │ containerEl (detached div)     │            │
│   │   └─ maplibre Map instance     │            │
│   │   └─ TerraDraw instance        │            │
│   └────────────────────────────────┘            │
│                  ▲                              │
│                  │ appendChild / removeChild    │
│   ┌──────────────┴──────────────┐               │
│   │ MapCanvas (mount/unmount)   │               │
│   │   <Toolbar />               │               │
│   │   <div ref={hostRef} />     │  ←─ ה-div שמ-host את containerEl │
│   └─────────────────────────────┘               │
└─────────────────────────────────────────────────┘
```

## מבנה הקבצים

| קובץ | תפקיד |
|------|-------|
| [drawModes.ts](drawModes.ts) | `DrawMode` type, `SUPPORTED_MODES` קבוע, `createMode()` factory |
| [MapContext.tsx](MapContext.tsx) | הגדרת `MapContextValue` (mapRef, drawRef, containerEl, actions) |
| [MapProvider.tsx](MapProvider.tsx) | יוצר את ה-Map + terra-draw, מנהל lifecycle, חושף את הכל ב-context |
| [MapCanvas.tsx](MapCanvas.tsx) | Host קל-משקל שמ-append/remove את ה-container |
| [useMap.ts](useMap.ts) | Hook לגישה ל-context (`const { mapRef, ... } = useMap()`) |
| [Toolbar.tsx](Toolbar.tsx) | UI: כפתורי modes, Clear, Export — קורא `SUPPORTED_MODES` |

## Lifecycle Flow

### Initial mount

ה-effects של children רצים **לפני** ה-effects של parents ב-React. אז הסדר הוא:

1. `MapProvider` renders → `containerElRef.current` נוצר (detached div).
2. `MapCanvas` renders → `<div ref={hostRef}>` יצא ל-DOM, אבל ריק.
3. **MapCanvas's useEffect**: `hostRef.current.appendChild(containerEl)` — ה-containerEl נכנס ל-DOM כעת בגודל המלא של ה-host.
4. **MapProvider's useEffect**: `new Map({ container: containerEl.current, ... })` — הMap נוצר ישירות עם container בגודל הנכון (אין צורך ב-resize ראשוני).
5. **`m.on('load')` fires** (asynchronous): TerraDraw מאותחל, `setActiveMode(SUPPORTED_MODES[0])` → re-render → ה-Toolbar מציג את ה-mode הראשון כפעיל.

### Navigation (mount/unmount)

נגיד שמשתמש עובר מ-`/map-one` ל-`/map-two`:

1. `MapCanvas` של `/map-one` unmount:
   - Cleanup של ה-useEffect: `containerEl.parentNode?.removeChild(containerEl)` — ה-Map ממשיך לחיות ב-Provider, רק ה-div הוצא מה-DOM.
2. `MapCanvas` של `/map-two` mount:
   - useEffect: `hostRef.current.appendChild(containerEl)` — אותו containerEl, אותו Map, אותו ה-state.
   - `mapRef.current?.resize()` — חשוב! גודל ה-host החדש אולי שונה מהקודם, צריך לתת ל-maplibre לדעת.

ה-zoom, center, drawings, וכל ה-state של ה-Map נשמרים.

### Unmount של ה-Provider

קורה רק כשהאפליקציה כולה נסגרת או ה-Provider מוסר. אז:
- `drawRef.current?.stop()` — terra-draw נעצר.
- `m.remove()` — ה-Map נהרס (WebGL context, event listeners וכו').

## למה `useRef` למפה ולא `useState`?

ה-Map הוא mutable instance של library חיצונית. הוא לא משנה את הוא עצמו ע"י re-creation אלא דרך methods שלו (`m.setCenter()`, `m.setZoom()`, ...). אין סיבה לטריגר re-render כשהוא משתנה — קומפוננטות שצריכות גישה אליו קוראות `mapRef.current` ב-handlers/effects.

ה-init של terra-draw קורה בתוך `m.on('load', ...)` בתוך ה-`useEffect` של ה-Provider — אין צורך ב-`useState` למפה כי ה-closure של ה-effect שומר ב-`m` ישירות.

ה-**state** היחיד שכן צריכים:
- `activeMode` — מצב UI שצריך לטריגר re-render של ה-Toolbar.

## Context API

```ts
interface MapContextValue {
  mapRef: MutableRefObject<Map | null>;            // ל-handlers/effects (markers, layers, popups)
  drawRef: MutableRefObject<TerraDraw | null>;     // לפעולות drawing מתקדמות
  containerEl: HTMLDivElement | null;              // ה-div שה-MapCanvas מאמץ
  activeMode: string;                              // UI state, מטריגר re-render
  setMode: (mode: string) => void;                 // החלפת mode
  getSnapshot: () => GeoJSONStoreFeatures[];       // ייצוא GeoJSON
  clearAll: () => void;                            // ניקוי כל הציורים
}
```

## הוספת mode חדש

1. הוסף את ה-mode ל-`DrawMode` type ב-[drawModes.ts](drawModes.ts).
2. הוסף אותו ל-`SUPPORTED_MODES`.
3. הוסף `case` ב-`createMode()` שמחזיר instance של terra-draw mode.
4. אם זה mode שניתן לבחור/לערוך, הוסף flags גם ל-`TerraDrawSelectMode` (כמו `midpoints.draggable` ל-linestring).
5. הוסף label + hint ב-[Toolbar.tsx](Toolbar.tsx).

ה-Toolbar והProvider ידעו אוטומטית — `SUPPORTED_MODES` הוא single source of truth.

## דוגמאות שימוש בקומפוננטה חיצונית

### הוספת marker

```tsx
import { Marker } from "maplibre-gl";
import { useEffect } from "react";
import { useMap } from "./maplibre/useMap";

function MyMarker({ lng, lat }: { lng: number; lat: number }) {
  const { mapRef } = useMap();

  useEffect(() => {
    if (!mapRef.current) return;
    const marker = new Marker().setLngLat([lng, lat]).addTo(mapRef.current);
    return () => { marker.remove(); };
  }, [mapRef, lng, lat]);

  return null;
}
```

### קריאת features של terra-draw

```tsx
function ExportButton() {
  const { getSnapshot } = useMap();
  return <button onClick={() => console.log(getSnapshot())}>Export</button>;
}
```

## הערות חשובות

- **ה-Map חי כל זמן ה-Provider** — אם ה-Provider עצמו unmount, ה-Map ייהרס.
- **רק MapCanvas אחד בו-זמנית יכול להציג את הcontainer** — DOM element יכול להיות רק במקום אחד. עם 2 routes (`/map-one`, `/map-two`) רק אחד מהם פעיל בכל רגע, אז זה עובד מצוין.
- **אם רוצים 2 maps במקביל** (split-view) — זה דורש שינוי ארכיטקטוני: כמה Map instances ב-Provider עם registry/id, או 2 Providers מקוננים.
- **`m.resize()`** — נחוץ אחרי append כי גודל ה-host החדש עשוי להיות שונה. maplibre cache-ה את הגודל ולא יוצא מעצמו.

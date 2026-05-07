# MapLibre Drawing App

אפליקציית React + TypeScript + Vite לעריכת מפות אינטראקטיביות בעזרת **MapLibre GL JS** ו-**Terra Draw**. המטרה היא ארכיטקטורה נקייה ומופרדת יותר מאשר אוסף פונקציות.

## התקנה

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## תלותיות

- **React 18**: ספריית ממשק משתמש.
- **TypeScript**: טיפוסיות ל-JavaScript.
- **Vite**: כלי בנייה ושרת פיתוח מהיר.
- **Redux Toolkit**: ניהול מצבי יישום לשמירה ושיתוף של נתוני המפה.
- **React Router DOM**: ניווט בין דפים בצד הלקוח.
- **MapLibre GL JS**: ספריית רינדור מפות פתוחה.
- **Terra Draw**: ספריית ציור עבור GeoJSON על גבי מפות.
- **Terra Draw MapLibre GL Adapter**: חיבור בין Terra Draw ל-MapLibre.
- **Lodash-es**: פונקציות עזר, בעיקר `debounce`.

## מבנה ארכיטקטוני

האפליקציה מחולקת לשלוש שכבות ברורות:

1. **אובייקט המפה ו-Terra Draw**: נשמרים ב-`useRef` בתוך `MapProvider`. לא בריאקט סטייט, לא ברדוקס.
2. **נתונים יציבים לשיתוף**: מאוחסנים ב-Redux (`mapDataSlice`).
3. **מצב עריכה חי**: מתנהל בתוך Terra Draw בזמן אמת.

### עקרונות מרכזיים

- Terra Draw הוא מקור האמת הזמני בזמן עריכה. Redux נטען לתוך Terra Draw פעם אחת בעת mount.
- שינויים ב-Terra Draw נדחפים ל-Redux רק באמצעות סינכרון מדוד ומדורג, לא בהזרמה דו-כיוונית בזמן אמת.
- `DrawController` עוטף את Terra Draw. שאר הקוד לא מייבא Terra Draw ישירות.
- כל דף (Viewer / Editor) מרכיב `MapProvider` משלו. ניווט מרענן את המפה ומבטל מצבים ישנים.

### מבנה התיקיות

```
src/
├── app/
│   ├── App.tsx           # רכיב שורש עם RouterProvider
│   ├── routes.tsx        # הגדרת נתיבים
│   └── store.ts          # הגדרת חנות Redux
├── features/
│   ├── map-editor/
│   │   └── MapEditorPage.tsx  # דף עריכה עם כלי ציור
│   └── map-viewer/
│       └── MapViewerPage.tsx  # דף צפייה בלבד
├── layout/
│   ├── AppLayout.tsx     # פריסת תצוגה עיקרית
│   └── SideNav.tsx       # תפריט ניווט צדדי
├── map/
│   ├── components/
│   │   ├── DrawingToolbar.tsx  # סרגל כלים למצב ציור
│   │   └── MapCanvas.tsx       # רכיב מכולת מפה
│   ├── core/
│   │   ├── MapProvider.tsx     # ספק קונטקסט של מפה
│   │   └── useMapContext.ts    # hook לגישה לקונטקסט
│   ├── drawing/
│   │   ├── DrawController.ts   # עטיפה מעל Terra Draw
│   │   └── modes/
│   │       └── index.ts        # קובץ placeholder למודים מותאמים
│   └── sync/
│       └── createDrawSyncer.ts # סינכרון נדנדתי ל-Redux
└── store/
    └── slices/
        └── mapDataSlice.ts     # סlice של נתוני מפה
```

## הסבר מפורט לפי קבצים

### `src/main.tsx`

כאן האפליקציה נבנית ומוצמדת ל-root ב-DOM. `Provider` של Redux עוטף את האפליקציה.

### `src/app/App.tsx`

רק המנהל של הראוטר. הוא מחזיר `RouterProvider` עם הנתיב שהוגדר ב-`routes.tsx`.

### `src/app/routes.tsx`

מגדיר את הנתיבים:
- `/` מוביל ל-`MapViewerPage`
- `/editor` מוביל ל-`MapEditorPage`

שניהם נמצאים בתוך `AppLayout`.

### `src/app/store.ts`

מגדיר את חנות ה-Redux עם `mapData` כמקטע מרכזי.
הוא גם מייצא hooks מקושטים (`useAppDispatch`, `useAppSelector`) כדי להשתמש בחנות בטייפסקריפט.

### `src/layout/AppLayout.tsx`

מעצב את התצוגה העיקרית ברוחב מלא, עם אזור מרכזי ל-`Outlet` וחלק צדדי לניווט.

### `src/layout/SideNav.tsx`

תפריט ניווט פשוט לכניסה ל-Viewer או ל-Editor.

### `src/features/map-viewer/MapViewerPage.tsx`

דף צפייה בלבד. ממקם את `MapCanvas` בתוך `MapProvider` בלי יכולות ציור.

### `src/features/map-editor/MapEditorPage.tsx`

דף העריכה שמכיל:
- `MapCanvas` עם `enableDrawing` פעיל
- `DrawingToolbar` כדי לשנות מצבי ציור
- `InitialFeatureLoader` שמטעין את נתוני ה-Redux לתוך Terra Draw פעם אחת בלבד

#### `InitialFeatureLoader`

- בוחר את כל הפיצ'רים מה-Redux
- מחכה ש-MAP יהיה מוכן (`isReady`)
- מטעין אותם ל-`DrawController` על mount
- מוודא שהטעינה מתבצעת רק פעם אחת עם `loadedRef`

### `src/map/core/MapProvider.tsx`

יוצר קונטקסט שמכיל:
- `mapRef`: הפניה ל-instance של MapLibre
- `drawControllerRef`: הפניה ל-`DrawController`
- `isReady`: האם המפה טעונה ומוכנה
- `setReady`: setter למצב מוכן

### `src/map/core/useMapContext.ts`

hook שמחזיר את הקונטקסט. זורק שגיאה אם משתמשים בו מחוץ ל-`MapProvider`.

### `src/map/components/MapCanvas.tsx`

רכיב המפה העיקרי. עושה את הפעולות הבאות:
- יוצר מופע MapLibre במרווח `container`
- טוען style מ-MapLibre demo
- מגדיר `initialCenter` ו-`initialZoom`
- אם `enableDrawing` פעיל, יוצר `DrawController` ושולח לו `onChange`
- בונה סינכרון נדנדתי ל-Redux באמצעות `createDrawSyncer`
- מנקה את המפה והבקר בסיום

### `src/map/components/DrawingToolbar.tsx`

סרגל כלים צף שמציע:
- מצב בחירה / עריכה
- ציור קו
- ציור פוליגון
- ציור נקודה
- כפתור `Clear`

הוא פונה ל-`drawControllerRef.current` כדי לשנות מצב ציור או לנקות.

### `src/map/drawing/DrawController.ts`

עטיפה ממוקדת סביב Terra Draw:
- בונה מופע `TerraDraw` עם ה-adapter של MapLibre
- רושם מצבים מבנה מיוחדים:
  - `TerraDrawSelectMode`
  - `TerraDrawLineStringMode`
  - `TerraDrawPolygonMode`
  - `TerraDrawPointMode`
- מאזין לאירוע `change` ושולח snapshot של פיצ'רים החוצה
- מאזין לאירוע `select` ומעביר מזהה אם צריך

שיטות עיקריות:
- `setMode(mode)`
- `addFeatures(features)`
- `removeFeatures(ids)`
- `getSnapshot()`
- `clear()`
- `destroy()`

`DrawMode` הוא הטאיפשל `select | linestring | polygon | point | static`.

### `src/map/drawing/modes/index.ts`

זהו קובץ placeholder ריק שמיועד לייצא מודים מותאמים אישית בעתיד.
כרגע אין בו לוגיקה ממשית, והקובץ קיים רק כדי לשמור על מקום לגדילה.

### `src/map/sync/createDrawSyncer.ts`

פונקציה שמחזירה `DrawSyncer` נדנדה:
- היא מקבלת `dispatch` של Redux
- מחזירה פונקציה שמדחיקה את `upsertFeatures` ב-150ms
- המטרה היא למנוע עדכונים תכופים מדי ל-Redux בזמן ציור מהיר

### `src/store/slices/mapDataSlice.ts`

slice של Redux לניהול הפיצ'רים במפה.
מבנה המדינה:
- `byId`: מילון פיצ'רים לפי מזהה
- `allIds`: רשימת המזהים בסדר הוספה

פעולות:
- `upsertFeatures(features[])`: מעדכן או מוסיף פיצ'רים
- `removeFeature(id)`: מוחק פיצ'ר לפי מזהה
- `clearAll()`: מנקה את כל המדינה

## נתיב הנתונים

1. האפליקציה עולה, חנות ה-Redux נטענת.
2. בדף Editor:
   - `MapProvider` נוצר
   - `MapCanvas` מטעין מופע MapLibre
   - בטעינת המפה, `DrawController` נוצר ונתוני `mapData` יכולים להתחיל להתעדכן
   - `InitialFeatureLoader` טוען את הפיצ'רים מה-Redux ל-Terra Draw פעם אחת
3. בזמן ציור:
   - Terra Draw שומר את המצב החי
   - על כל שינוי מופעל ה-synchronizer הנדנדה ומעדכן את Redux
4. ניווט ל-Viewer:
   - המפה מושמדת יחד עם הבקר
   - נוצר דף חדש ללא יכולות ציור
5. חזרה ל-Editor:
   - תהליך הטעינה מתחיל מחדש על מופע נקי

## נקודות חיבור מרכזיות

- **Redux ↔ Terra Draw**: חד-כיווני, על ידי טעינה ראשונית ו-syncher נדנדה.
- **MapLibre ↔ Terra Draw**: דרך `TerraDrawMapLibreGLAdapter`.
- **React ↔ Map**: ההפניות (`refs`) בקונטקסט מונעות רינדורים מיותרים.
- **ניווט ↔ מפה**: כל נתיב מקבל מופע מפה נפרד.

## מה ניתן לקצר ולמחוק

### קבצים שיש להם מעט תוכן וניתן לשקול לפשט

- `src/map/drawing/modes/index.ts`: זהו קובץ placeholder ריק. אם אין כוונה להוסיף מודים מותאמים, אפשר פשוט למחוק את התיקיה `modes` ואת הקובץ הזה.
- `src/app/App.tsx`: רכיב קטן מאוד. אפשר למזג אותו ל-`main.tsx` אם רוצים פחות קבצים, אבל זה מוריד את הניקיון המבני של הפרויקט.
- `src/layout/AppLayout.tsx` ו-`src/layout/SideNav.tsx`: קבצים אלה קטנים, אך הם נותנים הפרדה ברורה בין פריסת UI לבין דפי התוכן. לא ממליץ למחוק אותם אם רוצים לשמור על קוד קריא.

### קבצים שכדאי להשאיר

- `src/map/core/useMapContext.ts`: אמנם קצר, אבל עוזר לוודא שימוש נכון בקונטקסט ומגן על טעויות.
- `src/store/slices/mapDataSlice.ts`: ליבת ניהול הנתונים, לא למחוק.
- `src/map/components/MapCanvas.tsx`: הליבה של יצירת המפה.
- `src/features/map-editor/MapEditorPage.tsx`: אחראי על טעינת הנתונים מה-Redux למצב ציור.

## תפקיד `src/map/drawing/modes/index.ts`

- זהו קובץ שמיועד לייצא ולהרכיב מודים מותאמים אישית ל-Terra Draw.
- כיום הוא לא מכיל כל לוגיקה ולכן הוא כמעט ריק.
- ניתן למחוק אותו אם אין תוכניות להשתמש במודים מותאמים.
- אם רוצים לשמור על מקום להרחבה עתידית, אפשר להשאיר אותו כמסגרת.

## הרחבות נוספות

- אם רוצים מודולים מותאמים: כתבו את המודלים בתיקיה `src/map/drawing/modes/` וייצאו אותם מ-`index.ts`.
- אם רוצים לפשט עוד יותר: אפשר לאחד חלקים של ה-`layout` או את `App.tsx` אך לרוב עדיף להשאיר את ההיררכיה ברורה.

## כללי חשובים

- לא לשים את מופע המפה או את `DrawController` ב-Redux או ב-React state.
- סינכרון Terra Draw ל-Redux חייב להיות מדורג/נדנדה.
- טעינת נתונים מ-Redux ל-Terra Draw צריכה להתבצע פעם אחת לכל mount.
- לשמור על TypeScript נקי בלי `any` או `@ts-ignore`.


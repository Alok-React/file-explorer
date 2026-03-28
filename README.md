# 📁 React File Explorer

A full-featured, themeable file manager built with React — supporting grid, list, and graph views, inline file previews, drag-and-drop, and a fully persisted mock API backed by `localStorage`.

---

## Table of Contents

- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Component Reference](#component-reference)
- [Mock API](#mock-api)
- [Theming](#theming)
- [Testing](#testing)
- [Tradeoffs & Design Decisions](#tradeoffs--design-decisions)
- [Known Limitations](#known-limitations)

---

## Features

- **Folder tree sidebar** with recursive expand/collapse
- **Three view modes** — Grid, List, and Graph (SVG node/edge tree)
- **Breadcrumb navigation** — click any segment to jump to that folder
- **Inline file preview** — video (with controls), image (full-size), PDF (embedded), others (metadata + download)
- **Drag-and-drop** — move files and folders between directories
- **Rename / Delete** — via right-click context menu or toolbar
- **Upload** — single or multiple files, type auto-detected from MIME
- **Debounced search** — instant filtering across the current folder tree
- **Sort** — by name, size, or date (ascending/descending)
- **Light / Dark mode** toggle with CSS variable theming
- **Export JSON** — download the folder structure at any level
- **Optimistic updates** — UI reflects changes before the mock API confirms
- **localStorage persistence** — file tree survives page refreshes

---

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm 9+

### 1. Clone and install

```bash
git clone https://github.com//Alok-React/file-explorer.git
cd file-explorer
npm install
```

### 2. Install additional dependencies

```bash
npm install uuid lucide-react
```

### 3. Add the Google Font

In `public/index.html`, add inside `<head>`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

### 4. Start the development server

```bash
npm start
```

The app opens at `http://localhost:3000`.

### 5. Run tests

```bash
npm test
```

### 6. Build for production

```bash
npm run build
```

---

## Project Structure

```
src/
├── data/
│   └── fileSystem.js          # Mock API + localStorage persistence
├── hooks/
│   ├── useFileSystem.js       # Core state + all CRUD operations
│   └── useDebounce.js         # Debounce hook for search input
├── components/
│   ├── Sidebar/
│   │   └── FolderTree.jsx     # Recursive folder tree
│   ├── Breadcrumb/
│   │   └── Breadcrumb.jsx     # Path navigation bar
│   ├── Toolbar/
│   │   └── Toolbar.jsx        # Search, sort, view, upload, theme
│   ├── FileGrid/
│   │   └── FileGrid.jsx       # Card grid with drag-and-drop
│   ├── FileList/
│   │   └── FileList.jsx       # Table/list view
│   ├── GraphView/
│   │   └── GraphView.jsx      # SVG node-edge tree diagram
│   ├── Preview/
│   │   └── FilePreview.jsx    # Modal preview for all file types
│   └── ContextMenu/
│       └── ContextMenu.jsx    # Right-click actions
├── utils/
│   └── fileUtils.js           # Format, sort, search, icon helpers
├── theme.js                   # CSS variable maps for dark/light
├── App.js                     # Root — wires all components together
└── App.css                    # All styles (CSS variable based)
```

---

## Architecture

### Overview

The app follows a **unidirectional data flow** pattern:

```
localStorage  ←→  fileSystem.js (Mock API)
                        ↕
               useFileSystem (Hook)
                        ↕
                    App.js
               ↙    ↓    ↓    ↘
          Sidebar  Toolbar  Views  Overlays
```

### State Management

All shared state lives in `App.js` and is passed down as props. There is no Redux or Zustand — the app is small enough that React's built-in `useState` and a custom hook handle everything cleanly.

| State | Lives In | Purpose |
|---|---|---|
| `tree` | `useFileSystem` | Full file system tree from mock API |
| `currentFolderId` | `App.js` | Which folder is open |
| `folderPath` | `App.js` | Breadcrumb trail |
| `view` | `App.js` | `grid` / `list` / `graph` |
| `search` | `App.js` | Raw search text |
| `preview` | `App.js` | File node currently being previewed |
| `ctxMenu` | `App.js` | Context menu position + target node |
| `modal` | `App.js` | Active modal (rename / new folder) |

### Data Flow for an Operation (e.g. Rename)

1. User right-clicks a file → `ContextMenu` renders
2. User clicks **Rename** → `App.js` opens a `Modal` with the current name
3. User types a new name and confirms → `App.js` calls `fs.rename(id, newName)`
4. `useFileSystem` calls `api.rename(id, newName)` (simulated async delay)
5. `api.rename` updates the tree in `localStorage` and resolves
6. `useFileSystem` calls `refresh()`, re-fetches the full tree, updates `tree` state
7. React re-renders the sidebar and the active view

---

## Data Model

The entire file system is a nested JSON array stored in `localStorage` under the key `file_explorer_fs`.

```json
[
  {
    "id": "unique-uuid",
    "name": "Projects",
    "type": "folder",
    "createdAt": "2024-01-15",
    "children": [
      {
        "id": "another-uuid",
        "name": "Demo.mp4",
        "type": "file",
        "fileType": "video",
        "url": "/files/Demo.mp4",
        "size": 1048576,
        "createdAt": "2024-02-01",
        "mimeType": "video/mp4"
      }
    ]
  }
]
```

### Node Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string (UUID) | Yes | Unique identifier |
| `name` | string | Yes | Display name |
| `type` | `"folder"` \| `"file"` | Yes | Node type |
| `fileType` | `"image"` \| `"video"` \| `"pdf"` \| `"other"` | Files only | Drives preview and icon |
| `url` | string | Files only | Source URL for preview/download |
| `size` | number | Files only | File size in bytes |
| `createdAt` | string (ISO date) | No | Creation date for sorting/display |
| `mimeType` | string | No | MIME type from upload |
| `children` | Node[] | Folders only | Nested contents |

---

## Component Reference

### `Sidebar / FolderTree`

- Renders only `type: "folder"` nodes recursively
- `depth` prop drives `padding-left` for visual indentation
- Chevron rotates on open/close via CSS class
- Emits `onSelect(node)` to App on click

### `Toolbar`

- Search input is uncontrolled at the keystroke level but passes value up to App for debouncing
- Sort state is a `sortBy + sortDir` pair encoded as a `<select>` value string (`"name-asc"`, `"size-desc"`, etc.)
- Upload uses a hidden `<input type="file" multiple>` triggered by a label

### `FileGrid`

- Uses HTML5 Drag and Drop API (`draggable`, `onDragStart`, `onDrop`, `onDragOver`)
- Drop is only accepted when the target is a folder
- Cards show a hover-state "more" button that triggers the context menu

### `FileList`

- Renders a sticky header row + body rows using CSS Grid (`grid-template-columns`)
- Responsive: type and date columns collapse on narrow screens

### `GraphView`

- Pure SVG — no third-party graph library
- `buildGraph()` recursively computes (x, y) positions for each node using sibling count and level
- Nodes are clickable: folders navigate, files open preview
- Horizontal spacing is fixed at 180px; vertical at 90px per level

### `FilePreview`

- Renders inside a backdrop overlay (`preview-overlay`)
- Clicking outside the panel closes it
- `<video>` uses native browser controls — no custom player
- `<iframe>` embeds PDFs using the browser's built-in viewer
- Unsupported types show metadata and a download anchor

### `ContextMenu`

- Positioned at `(e.clientX, e.clientY)` using `position: fixed`
- Listens for `mousedown` outside its ref to auto-close
- Conditionally renders "Export JSON" only for folders, "Download" only for files

---

## Mock API

`src/data/fileSystem.js` simulates a REST-like backend entirely in memory + `localStorage`.

All operations are async and include a `delay()` call (default 300ms) to mimic real network latency. This allows loading/error state testing without a server.

| Method | Signature | Behaviour |
|---|---|---|
| `getAll()` | `→ Node[]` | Returns full tree from localStorage |
| `createFolder(parentId, name)` | `→ Node` | Adds folder to parent or root |
| `uploadFile(parentId, File)` | `→ Node` | Creates a blob URL, detects fileType from extension |
| `rename(id, newName)` | `→ string` | Walks tree, patches name in-place |
| `delete(id)` | `→ void` | Filters the node out recursively |
| `move(nodeId, targetFolderId)` | `→ void` | Removes from source, appends to target's `children` |
| `exportJSON(nodes)` | `→ string` | Serialises to formatted JSON, triggers browser download |

### Optimistic Updates

The `move` operation in `useFileSystem` could be extended to apply an optimistic tree mutation before the async call resolves. Currently the refresh happens after the API resolves (300ms delay). To make it fully optimistic, apply the state change immediately and roll back on error.

---

## Theming

CSS variables are defined in `src/theme.js` and applied to `:root` via `document.documentElement.style.setProperty`. Switching themes is instant — no page reload.

```js
applyTheme('dark');  // or 'light'
```

All component styles use `var(--bg-primary)`, `var(--accent)`, etc. Adding a third theme (e.g. `solarized`) requires only a new entry in `theme.js`.

---

## Testing

Tests live in `src/__tests__/`. Run with:

```bash
npm test -- --coverage
```

### Recommended test targets to hit 60%+ coverage

| File | What to test |
|---|---|
| `utils/fileUtils.js` | `formatSize`, `sortNodes`, `flattenSearch`, `getFileColor` |
| `hooks/useDebounce.js` | Delay behaviour, value update timing |
| `hooks/useFileSystem.js` | CRUD operations, error state, loading flag |
| `components/Breadcrumb` | Renders path segments, calls `onNavigate` on click |
| `components/FileGrid` | Renders items, fires `onOpen` on double-click, fires `onContextMenu` on right-click |
| `components/ContextMenu` | Renders correct actions for file vs folder, closes on outside click |
| `data/fileSystem.js` | `api.rename`, `api.delete`, `api.move` mutate localStorage correctly |

### Example test (fileUtils)

```js
import { formatSize, sortNodes } from '../utils/fileUtils';

test('formatSize formats bytes correctly', () => {
  expect(formatSize(0)).toBe('—');
  expect(formatSize(1024)).toBe('1.0 KB');
  expect(formatSize(1048576)).toBe('1.0 MB');
});

test('sortNodes puts folders before files', () => {
  const nodes = [
    { id: '1', name: 'b.txt', type: 'file' },
    { id: '2', name: 'Alpha', type: 'folder', children: [] },
  ];
  const sorted = sortNodes(nodes, 'name', 'asc');
  expect(sorted[0].type).toBe('folder');
});
```

---

## Tradeoffs & Design Decisions

### 1. localStorage vs IndexedDB

**Chose `localStorage`** for simplicity — JSON serialisation is trivial, the API is synchronous-in-spirit, and it works without any additional libraries. The tradeoff is a 5–10 MB storage cap and no support for storing actual file binary data (only blob URLs, which are session-scoped).

For production: IndexedDB would allow storing file blobs directly, enabling true offline access.

### 2. No global state library (no Redux / Zustand)

**Chose React state + a single custom hook** because the app has one primary data source (the file tree) and all mutations flow through `useFileSystem`. Adding a state library would introduce boilerplate without meaningful benefit at this scale.

For production: If the app grew to include collaborative editing, notifications, or multi-tab sync, a library like Zustand would simplify cross-component subscriptions.

### 3. Full tree refresh vs. surgical updates

After every mutation, `useFileSystem` calls `refresh()` which re-fetches the entire tree. This is simple and always correct — no risk of stale branches.

The tradeoff is unnecessary work for large trees. A production system would apply surgical updates: on rename, only patch the affected node in state; on delete, only filter it out; on move, update source and target in one pass.

### 4. SVG-based Graph View (no library)

**Chose hand-written SVG** rather than D3, Cytoscape, or React Flow. This keeps the bundle small (~0 extra KB) and the layout logic is simple enough to compute manually.

The tradeoff is that the layout algorithm is a simple recursive x/y placement — it doesn't handle edge crossings or deeply unbalanced trees gracefully. For trees with many siblings at one level, nodes can overlap. A force-directed layout (D3-force) would handle this better.

### 5. Blob URLs for uploaded files

When a user uploads a file, `URL.createObjectURL()` creates a blob URL tied to the browser session. This means uploaded files **are not persisted across page refreshes** — only their metadata (name, size, type) survives in localStorage.

This is intentional for a mock API. A real backend would POST the binary to a server and store a permanent URL.

### 6. CSS variables for theming (no CSS-in-JS)

**Chose native CSS variables** over styled-components or Emotion. This avoids a runtime dependency, works in plain `.css` files, and theme switching is a single `setProperty` loop — no re-renders required.

The tradeoff is that variables can't be computed at render time based on props (e.g. `color: ${props => props.primary}`). For component-level dynamic styles, inline `style` props are used instead.

### 7. Debounce in a hook vs. library

`useDebounce` is implemented from scratch (11 lines). It covers the single use-case needed (search input) without pulling in lodash or a dedicated hooks library.

### 8. No virtual scrolling

The file list renders every item in the DOM. For folders with hundreds of files, this is fine. For folders with thousands of files, a virtualised list (`react-window` or `react-virtual`) would be needed to maintain render performance.

---

## Known Limitations

- Uploaded file previews (blob URLs) are lost on page refresh
- Graph view layout breaks for very wide trees (6+ siblings at one level)
- Drag-and-drop does not support moving multiple selected items at once
- No multi-select (shift/cmd-click)
- No undo/redo for destructive operations
- PDF preview depends on the browser's built-in PDF viewer (not available in some environments)
- localStorage cap means the app is unsuitable for large file metadata sets (>~1000 files)

---

## License

Alok

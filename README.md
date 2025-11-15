# Maestro Graph Editor & Pathfinding Visualizer

This project implements a full **graph editor**, **BFS/Dijkstra pathfinding
visualizer**, and **search/highlight**.

## How to Run the Project

- First clone the repo


### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Open the app

go to:

    http://localhost:5173

## Project Overview

-   Add / remove nodes
-   Add / remove edges (duplicate prevention)
-   Rename nodes
-   Search nodes by substring
-   Run BFS or Dijkstra shortest path
-   Highlight search matches + path results
-   Load predefined example graphs
-   Undo / redo
-   Light/dark theme toggle
-   Performance metrics
-   Hover edges to see labels

## Architecture

-   **TopControls** - Creation UI, undo/redo, theme toggle
-   **Sidebar** - Lists, search, pathfinding, examples
-   **GraphCanvas** - ReactFlow rendering & highlighting
-   **Redux Toolkit** manages graph state with full history

## Design Decisions & Trade-offs

### Redux Toolkit as Source of Truth

Pros: predictable state, easy undo/redo
Trade-off: slightly more boilerplate.

### ReactFlow for Rendering

Pros: interactive, stable, performant
Trade-off: requires mapping from Redux → ReactFlow format.

### Memoization

Pros: performance optimization
Trade-off: more complexity.

### Custom BFS & Dijkstra

Pros: full control, educational
Trade-off: not optimized for very large graphs.

### History Model

Pros: simple snapshot push/pop
Trade-off: memory-intensive for large graphs.

## Known Limitations

-   No edge-weight editing UI
-   No auto-layout
-   Not optimized for huge graphs
-   Only one path highlighted
-   No save/load persistence

## Future Improvements

-   Weighted edge editor
-   Graph import/export
-   BFS/Dijkstra animations
-   Auto-layout algorithms
-   Performance panel
-   Keyboard shortcuts
-   Context menu for nodes/edges

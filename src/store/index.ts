// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import graphReducer, { type GraphState } from "./graphSlice";
import themeReducer, { THEME_STORAGE_KEY } from "./themeSlice";
import { graphPersistenceMiddleware } from "./graphPersistenceMiddleware";
import { loadGraphFromStorage } from "../utils/graphPersistence";

type RootPreloadedState = {
    graph: GraphState;
};

function loadGraphState(): RootPreloadedState | undefined {
    const saved = loadGraphFromStorage();
    if (!saved) return undefined;

    const graph: GraphState = {
        nodes: saved.nodes,
        edges: saved.edges,
        past: [],
        future: [],
        savedSnapshots: [],
    };

    return { graph };
}

export const store = configureStore({
    reducer: {
        graph: graphReducer,
        theme: themeReducer,
    },
    preloadedState: loadGraphState(),
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(graphPersistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persist theme on every change (graph is handled in middleware)
if (typeof window !== "undefined") {
    store.subscribe(() => {
        try {
            const state = store.getState();
            const theme = state.theme.theme;
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // safely continue if an error occurs
        }
    });
}

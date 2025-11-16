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
        nodes: saved.nodes as GraphState["nodes"],
        edges: saved.edges as GraphState["edges"],
        past: [],
        future: [],
        savedSnapshots: saved.savedSnapshots ?? [],
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

// Persist theme on every change (graph handled by middleware)
if (typeof window !== "undefined") {
    store.subscribe(() => {
        try {
            const state = store.getState();
            const theme = state.theme.theme;
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // ignore
        }
    });
}

import { configureStore } from "@reduxjs/toolkit";
import graphReducer, {
    type GraphState,
    type GraphSnapshot,
} from "./graphSlice";
import themeReducer, { THEME_STORAGE_KEY } from "./themeSlice";

const GRAPH_STORAGE_KEY = "graph-state-v1";

type RootPreloadedState = {
    graph: GraphState;
};

function loadGraphState(): RootPreloadedState | undefined {
    if (typeof window === "undefined") return undefined;

    try {
        const raw = localStorage.getItem(GRAPH_STORAGE_KEY);
        if (!raw) return undefined;

        const parsed = JSON.parse(raw) as GraphSnapshot;

        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            return undefined;
        }

        const graph: GraphState = {
            nodes: parsed.nodes,
            edges: parsed.edges,
            past: [],
            future: [],
        };

        return { graph };
    } catch {
        return undefined;
    }
}

export const store = configureStore({
    reducer: {
        graph: graphReducer,
        theme: themeReducer,
    },
    preloadedState: loadGraphState(),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persist graph on every change
if (typeof window !== "undefined") {
    store.subscribe(() => {
        try {
            const state = store.getState();
            const graph = state.graph as GraphState;
            const snapshot: GraphSnapshot = {
                nodes: graph.nodes,
                edges: graph.edges,
            };
            localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(snapshot));
            const theme = state.theme.theme;
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // safely continue if an error occurs
        }
    });
}

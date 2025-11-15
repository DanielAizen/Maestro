import { configureStore } from "@reduxjs/toolkit";
import graphReducer, { type GraphState } from "./graphSlice";

const GRAPH_STORAGE_KEY = "graph-state-v1";

type RootPreloadedState = {
    graph: GraphState;
};

function loadGraphState(): RootPreloadedState | undefined {
    if (typeof window === "undefined") return undefined;

    try {
        const raw = localStorage.getItem(GRAPH_STORAGE_KEY);
        if (!raw) return undefined;

        const parsed = JSON.parse(raw) as GraphState;

        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            return undefined;
        }

        return { graph: parsed };
    } catch {
        return undefined;
    }
}

export const store = configureStore({
    reducer: {
        graph: graphReducer,
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
            localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(graph));
        } catch {
            /* safely continue if an error occurs */
        }
    });
}

import type { GraphSnapshot } from "../store/graphSlice";

export const GRAPH_STORAGE_KEY = "graph-state-v1";

export function saveGraphToStorage(snapshot: GraphSnapshot) {
    try {
        localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(snapshot));
    } catch (err) {
        console.error("Failed to save graph to storage", err);
    }
}

export function loadGraphFromStorage(): GraphSnapshot | undefined {
    if (typeof window === "undefined") return undefined;

    try {
        const raw = localStorage.getItem(GRAPH_STORAGE_KEY);
        if (!raw) return undefined;

        const parsed = JSON.parse(raw) as GraphSnapshot;
        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            return undefined;
        }

        return parsed;
    } catch (err) {
        console.error("Failed to load graph from storage", err);
        return undefined;
    }
}

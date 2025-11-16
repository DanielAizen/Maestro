import type { NamedGraphSnapshot } from "../store/graphSlice";

export const GRAPH_STORAGE_KEY = "graph-state-v2";

export interface PersistedGraph {
    nodes: unknown[];
    edges: unknown[];
    savedSnapshots: NamedGraphSnapshot[];
}

export function saveGraphToStorage(graph: PersistedGraph) {
    try {
        localStorage.setItem(GRAPH_STORAGE_KEY, JSON.stringify(graph));
    } catch (err) {
        console.error("Failed to save graph to storage", err);
    }
}

export function loadGraphFromStorage(): PersistedGraph | undefined {
    if (typeof window === "undefined") return undefined;

    try {
        const raw = localStorage.getItem(GRAPH_STORAGE_KEY);
        if (!raw) return undefined;

        const parsed = JSON.parse(raw) as Partial<PersistedGraph>;

        if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            return undefined;
        }

        return {
            nodes: parsed.nodes,
            edges: parsed.edges,
            savedSnapshots: Array.isArray(parsed.savedSnapshots)
                ? parsed.savedSnapshots
                : [],
        };
    } catch (err) {
        console.error("Failed to load graph from storage", err);
        return undefined;
    }
}

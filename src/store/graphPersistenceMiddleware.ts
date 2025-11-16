import type { Middleware } from "@reduxjs/toolkit";
import type { GraphState } from "./graphSlice";
import { saveGraphToStorage } from "../utils/graphPersistence";

export const graphPersistenceMiddleware: Middleware =
    (store) => (next) => (action) => {
        const result = next(action);

        const state = store.getState() as { graph: GraphState };
        const { nodes, edges, savedSnapshots } = state.graph;

        // Persist current graph plus snapshots after every action
        saveGraphToStorage({
            nodes,
            edges,
            savedSnapshots,
        });

        return result;
    };

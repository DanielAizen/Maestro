import type { Middleware } from "@reduxjs/toolkit";
import type { GraphState, GraphSnapshot } from "./graphSlice";
import { saveGraphToStorage } from "../utils/graphPersistence";

export const graphPersistenceMiddleware: Middleware =
    (store) => (next) => (action) => {
        const result = next(action);

        const state = store.getState() as { graph: GraphState };
        const { nodes, edges } = state.graph;

        const snapshot: GraphSnapshot = { nodes, edges };

        // Persist current graph after every action
        saveGraphToStorage(snapshot);

        return result;
    };

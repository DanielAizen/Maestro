import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
    applyEdgeChanges,
    applyNodeChanges,
    type Edge,
    type Node,
    type EdgeChange,
    type NodeChange,
} from "@xyflow/react";

export interface GraphSnapshot {
    nodes: Node[];
    edges: Edge[];
}

export interface NamedGraphSnapshot extends GraphSnapshot {
    id: string;
    name: string;
    createdAt: number;
}

export interface GraphState extends GraphSnapshot {
    past: GraphSnapshot[];
    future: GraphSnapshot[];
    savedSnapshots: NamedGraphSnapshot[];
}

const initialState: GraphState = {
    nodes: [],
    edges: [],
    past: [],
    future: [],
    savedSnapshots: [],
};

const cloneSnapshot = (snap: GraphSnapshot): GraphSnapshot => ({
    nodes: snap.nodes.map((n) => ({ ...n })),
    edges: snap.edges.map((e) => ({ ...e })),
});

const pushHistory = (state: GraphState) => {
    state.past.push(cloneSnapshot(state));
    state.future = [];
};

export const graphSlice = createSlice({
    name: "graph",
    initialState,
    reducers: {
        addNode(state, action: PayloadAction<{ label: string }>) {
            const { label } = action.payload;
            pushHistory(state);
            const newNode: Node = {
                id: crypto.randomUUID(),
                data: { label },
                position: {
                    x: Math.random() * 200,
                    y: Math.random() * 200,
                },
                type: "default",
                style: {
                    borderRadius: "60px",
                    width: "60px",
                    height: "60px",
                    textAlign: "center",
                },
            };

            state.nodes.push(newNode);
        },

        deleteNode(state, action: PayloadAction<{ nodeId: string }>) {
            pushHistory(state);
            const { nodeId } = action.payload;

            state.nodes = state.nodes.filter((node) => node.id !== nodeId);
            state.edges = state.edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId
            );
        },

        renameNode(
            state,
            action: PayloadAction<{ nodeId: string; label: string }>
        ) {
            pushHistory(state);
            const { nodeId, label } = action.payload;
            const node = state.nodes.find((n) => n.id === nodeId);
            if (!node) return;

            const data = (node.data as Record<string, unknown>) ?? {};
            node.data = { ...data, label };
        },

        addEdge(
            state,
            action: PayloadAction<{
                sourceId: string;
                targetId: string;
                weight?: number;
            }>
        ) {
            const { sourceId, targetId, weight = 1 } = action.payload;

            // avoid duplicate edges
            const alreadyExists = state.edges.some(
                (e) => e.source === sourceId && e.target === targetId
            );
            if (alreadyExists) {
                return;
            }
            pushHistory(state);

            const getNodeLabel = (node: Node | undefined): string => {
                if (!node) return "";
                const data = node.data as
                    | Record<string, unknown>
                    | null
                    | undefined;
                const label = data?.label;
                return typeof label === "string" ? label : node.id;
            };

            const sourceNode = state.nodes.find((n) => n.id === sourceId);
            const targetNode = state.nodes.find((n) => n.id === targetId);

            const edgeLabel = `${getNodeLabel(sourceNode)} → ${getNodeLabel(
                targetNode
            )}`;

            const newEdge: Edge = {
                id: crypto.randomUUID(),
                source: sourceId,
                target: targetId,
                data: {
                    weight,
                    label: edgeLabel,
                },
            };

            state.edges.push(newEdge);
        },

        deleteEdge(state, action: PayloadAction<{ edgeId: string }>) {
            pushHistory(state);

            const { edgeId } = action.payload;
            state.edges = state.edges.filter((edge) => edge.id !== edgeId);
        },

        setGraph(
            state,
            action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>
        ) {
            pushHistory(state);
            state.nodes = action.payload.nodes;
            state.edges = action.payload.edges;
        },

        applyNodesChange(state, action: PayloadAction<NodeChange[]>) {
            state.nodes = applyNodeChanges(action.payload, state.nodes);
        },

        applyEdgesChange(state, action: PayloadAction<EdgeChange[]>) {
            state.edges = applyEdgeChanges(action.payload, state.edges);
        },

        undo(state) {
            const previous = state.past.pop();
            if (!previous) return;

            const current = cloneSnapshot(state);
            state.future.push(current);

            state.nodes = previous.nodes.map((n) => ({ ...n }));
            state.edges = previous.edges.map((e) => ({ ...e }));
        },

        redo(state) {
            const next = state.future.pop();
            if (!next) return;

            const current = cloneSnapshot(state);
            state.past.push(current);

            state.nodes = next.nodes.map((n) => ({ ...n }));
            state.edges = next.edges.map((e) => ({ ...e }));
        },

        saveSnapshot(state, action: PayloadAction<{ name?: string }>) {
            const { name } = action.payload;
            const snapshotName =
                name && name.trim().length > 0
                    ? name.trim()
                    : `Snapshot ${state.savedSnapshots.length + 1}`;

            const snapshot: NamedGraphSnapshot = {
                id: crypto.randomUUID(),
                name: snapshotName,
                createdAt: Date.now(),
                nodes: state.nodes.map((n) => ({ ...n })),
                edges: state.edges.map((e) => ({ ...e })),
            };

            state.savedSnapshots.push(snapshot);
        },

        loadSnapshot(state, action: PayloadAction<{ id: string }>) {
            const { id } = action.payload;
            const snapshot = state.savedSnapshots.find((s) => s.id === id);
            if (!snapshot) return;

            // loading a snapshot should be undoable
            pushHistory(state);

            state.nodes = snapshot.nodes.map((n) => ({ ...n }));
            state.edges = snapshot.edges.map((e) => ({ ...e }));
        },

        deleteSnapshot(state, action: PayloadAction<{ id: string }>) {
            const { id } = action.payload;
            state.savedSnapshots = state.savedSnapshots.filter(
                (s) => s.id !== id
            );
        },
    },
});

export const {
    addNode,
    deleteNode,
    addEdge,
    deleteEdge,
    renameNode,
    setGraph,
    applyNodesChange,
    applyEdgesChange,
    undo,
    redo,
    saveSnapshot,
    loadSnapshot,
    deleteSnapshot,
} = graphSlice.actions;

export default graphSlice.reducer;

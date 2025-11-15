import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
    applyEdgeChanges,
    applyNodeChanges,
    type Edge,
    type Node,
    type EdgeChange,
    type NodeChange,
} from "@xyflow/react";

export interface GraphState {
    nodes: Node[];
    edges: Edge[];
}

const initialState: GraphState = {
    nodes: [
        {
            id: "n1",
            position: { x: 0, y: 0 },
            data: { label: "Node 1" },
            type: "default",
            style: { borderRadius: "60px", width: "60px", height: "60px" },
        },
    ],
    edges: [],
};

export const graphSlice = createSlice({
    name: "graph",
    initialState,
    reducers: {
        addNode(state, action: PayloadAction<{ label: string }>) {
            const { label } = action.payload;

            const newNode: Node = {
                id: crypto.randomUUID(),
                data: { label },
                position: {
                    x: Math.random() * 200,
                    y: Math.random() * 200,
                },
                type: "default",
                style: { borderRadius: "60px", width: "60px", height: "60px" },
            };

            state.nodes.push(newNode);
        },

        deleteNode(state, action: PayloadAction<{ nodeId: string }>) {
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
            const { nodeId, label } = action.payload;
            const node = state.nodes.find((n) => n.id === nodeId);
            if (!node) return;

            const data = (node.data as Record<string, unknown>) ?? {};
            node.data = { ...data, label };
        },

        addEdge(
            state,
            action: PayloadAction<{ sourceId: string; targetId: string }>
        ) {
            const { sourceId, targetId } = action.payload;

            // don't add duplicate edges
            const alreadyExists = state.edges.some(
                (e) => e.source === sourceId && e.target === targetId
            );
            if (alreadyExists) {
                return;
            }

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
                label: edgeLabel,
            };

            state.edges.push(newEdge);
        },

        deleteEdge(state, action: PayloadAction<{ edgeId: string }>) {
            const { edgeId } = action.payload;
            state.edges = state.edges.filter((edge) => edge.id !== edgeId);
        },

        setGraph(
            state,
            action: PayloadAction<{ nodes: Node[]; edges: Edge[] }>
        ) {
            state.nodes = action.payload.nodes;
            state.edges = action.payload.edges;
        },

        applyNodesChange(state, action: PayloadAction<NodeChange[]>) {
            state.nodes = applyNodeChanges(action.payload, state.nodes);
        },

        applyEdgesChange(state, action: PayloadAction<EdgeChange[]>) {
            state.edges = applyEdgeChanges(action.payload, state.edges);
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
} = graphSlice.actions;

export default graphSlice.reducer;

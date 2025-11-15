import {
    ReactFlow,
    Background,
    Controls,
    type Connection,
    type NodeChange,
    type EdgeChange,
    type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import {
    applyEdgesChange,
    applyNodesChange,
    addEdge as addGraphEdge,
} from "../store/graphSlice";
import { useState } from "react";

interface GraphCanvasProps {
    highlightedNodeId: string | null;
}

export function GraphCanvas({ highlightedNodeId }: GraphCanvasProps) {
    const dispatch = useDispatch();
    const nodes = useSelector((state: RootState) => state.graph.nodes);
    const edges = useSelector((state: RootState) => state.graph.edges);

    const theme = useSelector((state: RootState) => state.theme.theme)

    const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);


    const onNodesChange = (changes: NodeChange[]) =>
        dispatch(applyNodesChange(changes));

    const onEdgesChange = (changes: EdgeChange[]) =>
        dispatch(applyEdgesChange(changes));

    const onConnect = (connection: Connection) => {
        if (connection.source && connection.target) {
            dispatch(
                addGraphEdge({
                    sourceId: connection.source,
                    targetId: connection.target,
                })
            );
        }
    };

    const flowNodes = nodes.map((n) => {
        const baseStyle = {
            ...(n.style || {}),
            backgroundColor: theme === "dark" ? "#ffffff" : "#2b2b2b",
            color: theme === "dark" ? "#111111" : "#ffffff",
            border: `2px solid ${theme === "dark" ? "#ffffff" : "#000000"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // optional: make text look nicer in small circles
            fontSize: "12px",
            fontWeight: 400,
        };
        if (n.id !== highlightedNodeId) {
            return {
                ...n,
                style: baseStyle,
            };
        }

        return {
            ...n,
            style: {
                ...baseStyle,
                borderColor: "#ffcc00",
                boxShadow: "0 0 0 4px rgba(255, 204, 0, 0.4)",
            },
        };
    });

    const flowEdges: Edge[] = edges.map((e) => {
        const data = (e.data as Record<string, unknown> | null | undefined) ?? {};

        let storedLabel = "";
        if (data && typeof data.label === "string") {
            storedLabel = data.label;
        } else if (typeof e.label === "string") {
            storedLabel = e.label;
        }

        if (e.id !== hoveredEdgeId) {
            return {
                ...e,
                label: undefined,
            };
        }

        return {
            ...e,
            label: storedLabel,
        };
    });

    const onEdgeMouseEnter = (_evt: React.MouseEvent, edge: Edge) => {
        setHoveredEdgeId(edge.id);
    };

    const onEdgeMouseLeave = () => {
        setHoveredEdgeId(null);
    };

    return (
        <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{ width: "100%", height: "100%" }}>
                <ReactFlow
                    nodes={flowNodes}
                    edges={flowEdges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeMouseEnter={onEdgeMouseEnter}
                    onEdgeMouseLeave={onEdgeMouseLeave}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}

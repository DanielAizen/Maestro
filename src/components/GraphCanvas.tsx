import {
    ReactFlow,
    Background,
    Controls,
    type Connection,
    type NodeChange,
    type EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import {
    applyEdgesChange,
    applyNodesChange,
    addEdge as addGraphEdge,
} from "../store/graphSlice";

interface GraphCanvasProps {
    highlightedNodeId: string | null;
}

export function GraphCanvas({ highlightedNodeId }: GraphCanvasProps) {
    const dispatch = useDispatch();
    const nodes = useSelector((state: RootState) => state.graph.nodes);
    const edges = useSelector((state: RootState) => state.graph.edges);

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
        if (n.id !== highlightedNodeId) return n;

        return {
            ...n,
            style: {
                ...(n.style || {}),
                border: "2px solid #ffcc00",
                boxShadow: "0 0 0 4px rgba(255, 204, 0, 0.4)",
            },
        };
    });

    return (
        <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{ width: "100%", height: "100%" }}>
                <ReactFlow
                    nodes={flowNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}

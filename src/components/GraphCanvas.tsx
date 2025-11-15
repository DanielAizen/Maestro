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

export function GraphCanvas() {
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

    return (
        <div style={{ flex: 1 }}>
            <ReactFlow
                nodes={nodes}
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
    );
}

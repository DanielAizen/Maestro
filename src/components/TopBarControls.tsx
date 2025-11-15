// src/components/TopBarControls.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addNode, addEdge, undo, redo } from "../store/graphSlice";
import type { Node } from "@xyflow/react";
import { getNodeLabel } from "../utils/NodeUtils";

export function TopBarControls() {
    const dispatch = useDispatch();
    const nodes = useSelector((state: RootState) => state.graph.nodes);
    const canUndo = useSelector(
        (state: RootState) => state.graph.past.length > 0
    );
    const canRedo = useSelector(
        (state: RootState) => state.graph.future.length > 0
    );

    const [nodeLabel, setNodeLabel] = useState("");
    const [edgeSource, setEdgeSource] = useState("");
    const [edgeTarget, setEdgeTarget] = useState("");

    const handleAddNode = () => {
        const trimmed = nodeLabel.trim();
        if (!trimmed) return;

        dispatch(addNode({ label: trimmed }));
        setNodeLabel("");
    };

    const handleAddEdge = () => {
        if (!edgeSource || !edgeTarget || edgeSource === edgeTarget) return;

        dispatch(
            addEdge({
                sourceId: edgeSource,
                targetId: edgeTarget,
            })
        );
    };

    return (
        <div
            style={{
                padding: "20px 24px",
                borderBottom: "1px solid #ffffff",
                display: "flex",
                gap: "100px",
                alignItems: "center",
            }}
        >
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Node label"
                    value={nodeLabel}
                    onChange={(e) => setNodeLabel(e.target.value)}
                    style={{ padding: "4px 8px" }}
                />
                <button onClick={handleAddNode}>Add node</button>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <select
                    value={edgeSource}
                    onChange={(e) => setEdgeSource(e.target.value)}
                >
                    <option value="">Source</option>
                    {nodes.map((n: Node) => (
                        <option key={n.id} value={n.id}>
                            {getNodeLabel(n)}
                        </option>
                    ))}
                </select>

                <select
                    value={edgeTarget}
                    onChange={(e) => setEdgeTarget(e.target.value)}
                >
                    <option value="">Target</option>
                    {nodes.map((n: Node) => (
                        <option key={n.id} value={n.id}>
                            {getNodeLabel(n)}
                        </option>
                    ))}
                </select>

                <button onClick={handleAddEdge}>Add edge</button>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                <button onClick={() => dispatch(undo())} disabled={!canUndo}>
                    Undo
                </button>
                <button onClick={() => dispatch(redo())} disabled={!canRedo}>
                    Redo
                </button>
            </div>
        </div>
    );
}

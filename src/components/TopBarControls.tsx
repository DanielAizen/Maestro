// src/components/TopBarControls.tsx
import { memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { addNode, addEdge, undo, redo } from "../store/graphSlice";
import type { Node } from "@xyflow/react";
import { getNodeLabel } from "../utils/NodeUtils";
import { toggleTheme } from "../store/themeSlice";

function TopBarControlsInner() {
    const dispatch = useDispatch();
    const nodes = useSelector((state: RootState) => state.graph.nodes);
    const canUndo = useSelector(
        (state: RootState) => state.graph.past.length > 0
    );
    const canRedo = useSelector(
        (state: RootState) => state.graph.future.length > 0
    );

    const theme = useSelector((state: RootState) => state.theme.theme)

    const [nodeLabel, setNodeLabel] = useState("");
    const [edgeSource, setEdgeSource] = useState("");
    const [edgeTarget, setEdgeTarget] = useState("");
    const [edgeWeight, setEdgeWeight] = useState("1"); // string for input


    const handleAddNode = () => {
        const trimmed = nodeLabel.trim();
        if (!trimmed) return;

        dispatch(addNode({ label: trimmed }));
        setNodeLabel("");
    };

    const handleAddEdge = () => {
        if (!edgeSource || !edgeTarget || edgeSource === edgeTarget) return;

        const parsedWeight = Number(edgeWeight);
        const weight = Number.isFinite(parsedWeight) && parsedWeight > 0 ? parsedWeight : 1;

        dispatch(
            addEdge({
                sourceId: edgeSource,
                targetId: edgeTarget,
                weight
            })
        );
    };

    return (
        <div
            style={{
                padding: "10px 12px",
                borderBottom: `1px solid ${theme === "dark" ? "#ffffff" : "#000000"}`,
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

                <input
                    type="number"
                    min={1}
                    step={1}
                    value={edgeWeight}
                    onChange={(e) => setEdgeWeight(e.target.value)}
                    style={{ width: "60px", padding: "2px 4px" }}
                />

                <button onClick={handleAddEdge}>Add edge</button>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                <button onClick={() => dispatch(undo())} disabled={!canUndo}>
                    Undo
                </button>
                <button onClick={() => dispatch(redo())} disabled={!canRedo}>
                    Redo
                </button>
                <button onClick={() => dispatch(toggleTheme())}>
                    {theme === "dark" ? "Light mode" : "Dark mode"}
                </button>
            </div>
        </div>
    );
}

export const TopBarControls = memo(TopBarControlsInner)

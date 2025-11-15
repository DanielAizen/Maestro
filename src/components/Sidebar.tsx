import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { deleteNode, deleteEdge } from "../store/graphSlice";
import type { Node } from "@xyflow/react";
import { getNodeLabel } from "../utils/NodeUtils";
import { useState } from "react";

interface SidebarProps {
    onHighlightNode: (nodeId: string | null) => void;
}

export function Sidebar({ onHighlightNode }: SidebarProps) {
    const dispatch = useDispatch();
    const nodes = useSelector((state: RootState) => state.graph.nodes);
    const edges = useSelector((state: RootState) => state.graph.edges);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchError, setSearchError] = useState<string | null>(null);

    const getNodeLabelById = (id: string): string => {
        const node = nodes.find((n) => n.id === id);
        return node ? getNodeLabel(node as Node) : id;
    };

    const handleSearch = () => {
        const trimmed = searchTerm.trim();

        if (!trimmed) {
            onHighlightNode(null);
            setSearchError(null);
            return;
        }

        const lower = trimmed.toLowerCase();

        const match = nodes.find((n) =>
            getNodeLabel(n as Node).toLowerCase().includes(lower)
        );

        if (match) {
            onHighlightNode(match.id);
            setSearchError(null);
        } else {
            onHighlightNode(null);
            setSearchError("Node not found");
        }
    };

    return (
        <div
            style={{
                width: "260px",
                borderRight: "1px solid #ffffff22",
                padding: "12px",
                fontSize: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
            }}
        >
            <div>
                <h3 style={{ margin: "0 0 8px", color: "white" }}>Nodes</h3>

                <div
                    style={{
                        marginBottom: "8px",
                        display: "flex",
                        gap: "4px",
                        alignItems: "center",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search by label"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1, padding: "2px 6px" }}
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>
                {searchError && (
                    <div
                        style={{
                            color: "#ffaaaa",
                            fontSize: "12px",
                            marginBottom: "4px",
                        }}
                    >
                        {searchError}
                    </div>
                )}

                {nodes.length === 0 && (
                    <div style={{ opacity: 0.7, color: "white" }}>No nodes yet</div>
                )}
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        color: "white",
                    }}
                >
                    {nodes.map((n: Node) => (
                        <li
                            key={n.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "4px",
                            }}
                        >
                            <span>{getNodeLabel(n)}</span>
                            <button
                                style={{ marginLeft: "8px" }}
                                onClick={() => dispatch(deleteNode({ nodeId: n.id }))}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h3 style={{ margin: "12px 0 8px", color: "white" }}>Edges</h3>
                {edges.length === 0 && (
                    <div style={{ opacity: 0.7, color: "white" }}>No edges yet</div>
                )}
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        color: "white",
                    }}
                >
                    {edges.map((e) => (
                        <li
                            key={e.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "4px",
                            }}
                        >
                            <span>
                                {getNodeLabelById(e.source)} → {getNodeLabelById(e.target)}
                            </span>
                            <button
                                style={{ marginLeft: "8px" }}
                                onClick={() => dispatch(deleteEdge({ edgeId: e.id }))}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

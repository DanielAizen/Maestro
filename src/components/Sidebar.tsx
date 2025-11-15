import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { deleteNode, deleteEdge, renameNode } from "../store/graphSlice";
import type { Edge, Node } from "@xyflow/react";
import { getNodeLabel } from "../utils/NodeUtils";
import { memo, useMemo, useState } from "react";
import { bfsShortestPath, buildAdjacencyList, dijkstraShortestPath } from "../utils/graphAlgorithms";
// import exampleGraph from "../examples/exampleGraph.json";
// import type { ExampleGraph } from "../examples/types";
import { exampleGraphs } from "../examples/graphs";
import { setGraph } from "../store/graphSlice";


interface SidebarProps {
    onHighlightNode: (nodeId: string[]) => void;
    onHighlightPath: (path: { nodeIds: string[]; edgeIds: string[] } | null) => void;
}

function SidebarInner({ onHighlightNode, onHighlightPath }: SidebarProps) {
    const dispatch = useDispatch();
    const nodes = useSelector((state: RootState) => state.graph.nodes);
    const edges = useSelector((state: RootState) => state.graph.edges);

    const theme = useSelector((state: RootState) => state.theme.theme)

    const [searchTerm, setSearchTerm] = useState("");
    const [searchError, setSearchError] = useState<string | null>(null);

    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
    const [editingLabel, setEditingLabel] = useState("")

    const [algo, setAlgo] = useState<"bfs" | "dijkstra">("bfs");
    const [pathError, setPathError] = useState<string | null>(null);
    const [startNode, setStartNode] = useState("");
    const [endNode, setEndNode] = useState("");
    const [lastMetrics, setLastMetrics] = useState<{
        algorithm: "bfs" | "dijkstra";
        durationMs: number;
        nodes: number;
        edges: number;
    } | null>(null);

    const [selectedExampleId, setSelectedExampleId] = useState<string>("");

    const getNodeLabelById = (id: string): string => {
        const node = nodes.find((n) => n.id === id);
        return node ? getNodeLabel(node as Node) : id;
    };

    const handleSearch = () => {
        const trimmed = searchTerm.trim();

        if (!trimmed) {
            onHighlightNode([]);
            setSearchError(null);
            return;
        }

        const lower = trimmed.toLowerCase();

        const matches = nodes.filter((n) =>
            getNodeLabel(n as Node).toLowerCase().includes(lower)
        );

        if (matches.length > 0) {
            onHighlightNode(matches.map((n) => n.id));
            setSearchError(null);
        } else {
            onHighlightNode([]);
            setSearchError("Node not found");
        }
    };



    const handleClearSearch = () => {
        setSearchTerm("");
        setSearchError(null);
        onHighlightNode([]);
    };

    const startEditing = (node: Node) => {
        setEditingNodeId(node.id);
        setEditingLabel(getNodeLabel(node));
    };

    const cancelEditing = () => {
        setEditingNodeId(null);
        setEditingLabel("");
    };

    const saveEditing = () => {
        if (!editingNodeId) return;
        const trimmed = editingLabel.trim();
        if (!trimmed) return;

        dispatch(renameNode({ nodeId: editingNodeId, label: trimmed }));
        cancelEditing();
    };

    const adjacency = useMemo(
        () => buildAdjacencyList(nodes as Node[], edges),
        [nodes, edges]
    );

    const loadExampleGraph = () => {
        const ex = exampleGraphs.find((g) => g.id === selectedExampleId);
        if (!ex) return;

        const nodes: Node[] = ex.nodes.map((n) => ({
            id: n.id,
            data: { label: n.label },
            position: { x: n.x, y: n.y },
            type: "default",
            style: {
                borderRadius: "60px",
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 500
            }
        }));

        const edges: Edge[] = ex.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: `${e.source} → ${e.target}`,
            data: {
                label: `${e.source} → ${e.target}`,
                weight: e.weight
            }
        }));

        onHighlightNode([]);
        onHighlightPath(null);

        dispatch(setGraph({ nodes, edges }));
    };


    const runPathfinding = () => {
        setPathError(null);

        if (!startNode || !endNode) {
            setPathError("Please select start and end nodes");
            onHighlightPath(null);
            return;
        }

        const t0 = performance.now();
        const result =
            algo === "bfs"
                ? bfsShortestPath(adjacency, startNode, endNode)
                : dijkstraShortestPath(adjacency, startNode, endNode);
        const t1 = performance.now();

        setLastMetrics({
            algorithm: algo,
            durationMs: t1 - t0,
            nodes: nodes.length,
            edges: edges.length,
        });

        if (!result) {
            setPathError("No path found");
            onHighlightPath(null);
            return;
        }

        onHighlightPath({
            nodeIds: result.nodeIds,
            edgeIds: result.edgeIds,
        });
    };


    const clearPath = () => {
        onHighlightPath(null);
        setPathError(null);
        setLastMetrics(null);
    };

    return (
        <div
            style={{
                width: "260px",
                height: "100%",
                borderRight: `1px solid ${theme === "dark" ? "#ffffff" : "#000000"}`,
                padding: "12px",
                fontSize: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                boxSizing: "border-box",
            }}
        >
            <div>
                <h3 style={{ margin: "0 0 8px", color: `${theme === 'dark' ? "white" : "black"}` }}>Nodes</h3>

                <div
                    style={{
                        marginBottom: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        alignItems: "stretch",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search by label"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ flex: 1, padding: "2px 6px" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-around", paddingBottom: "10px" }}>
                        <button
                            style={{ backgroundColor: `${theme === 'dark' ? "white" : "black"}`, color: `${theme === 'dark' ? "black" : "white"}` }}
                            onClick={handleSearch}>
                            Search
                        </button>
                        <button
                            style={{ backgroundColor: `${theme === 'dark' ? "white" : "black"}`, color: `${theme === 'dark' ? "black" : "white"}` }}
                            onClick={handleClearSearch}>
                            Clear
                        </button>

                    </div>

                </div>
                {searchError && (
                    <div
                        style={{
                            color: "#ff0000",
                            fontSize: "12px",
                            marginBottom: "4px",
                        }}
                    >
                        {searchError}
                    </div>
                )}

                {nodes.length === 0 && (
                    <div style={{ opacity: 0.7, color: `${theme === 'dark' ? "white" : "black"}` }}>No nodes yet</div>
                )}
                <div
                    style={{
                        maxHeight: "220px",
                        overflowY: "auto",
                        paddingRight: "4px",
                    }}>
                    <ul
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            color: `${theme === 'dark' ? "white" : "black"}`,
                            rowGap: "6px"
                        }}
                    >
                        {nodes.map((n: Node) => {
                            const isEdit = editingNodeId === n.id
                            return (
                                <li
                                    key={n.id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "4px",
                                        gap: "4px",
                                    }}
                                >
                                    {isEdit ? (
                                        <>
                                            <input
                                                value={editingLabel}
                                                onChange={(e) => setEditingLabel(e.target.value)}
                                                style={{
                                                    minWidth: "80px",
                                                    width: "auto",
                                                    padding: "2px 4px"
                                                }}
                                            />
                                            <button onClick={saveEditing}>Save</button>
                                            <button onClick={cancelEditing}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ fontWeight: "bold" }}>{getNodeLabel(n)}</span>
                                            <div style={{ display: "flex", gap: "4px" }}>
                                                <button
                                                    style={{ backgroundColor: `${theme === 'dark' ? "white" : "black"}`, color: `${theme === 'dark' ? "black" : "white"}` }}
                                                    onClick={() => startEditing(n)}>
                                                    Rename
                                                </button>
                                                <button
                                                    style={{ backgroundColor: `${theme === 'dark' ? "white" : "black"}`, color: `${theme === 'dark' ? "black" : "white"}` }}
                                                    onClick={() =>
                                                        dispatch(deleteNode({ nodeId: n.id }))
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>

            <div>
                <h3 style={{ margin: "12px 0 8px", color: `${theme === 'dark' ? "white" : "black"}` }}>Edges</h3>
                {edges.length === 0 && (
                    <div style={{ opacity: 0.7, color: `${theme === 'dark' ? "white" : "black"}` }}>No edges yet</div>
                )}
                <div
                    style={{
                        maxHeight: "180px",
                        overflowY: "auto",
                        paddingRight: "4px",
                    }}>

                    <ul
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            color: `${theme === 'dark' ? "white" : "black"}`,
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
                                    style={{ marginLeft: "8px", backgroundColor: `${theme === 'dark' ? "white" : "black"}`, color: `${theme === 'dark' ? "black" : "white"}` }}
                                    onClick={() => dispatch(deleteEdge({ edgeId: e.id }))}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
            <div style={{ marginTop: "16px", paddingTop: "8px", borderTop: `1px solid ${theme === "dark" ? "#ffffff" : "#000000"}` }}>
                <h3 style={{ margin: "0 0 8px", color: `${theme === "dark" ? "#ffffff" : "#000000"}` }}>Pathfinding</h3>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "13px",
                    }}
                >
                    <div style={{ display: "flex", gap: "4px" }}>
                        <select
                            value={startNode}
                            onChange={(e) => setStartNode(e.target.value)}
                            style={{ flex: 1 }}
                        >
                            <option value="">Start node</option>
                            {nodes.map((n: Node) => (
                                <option key={n.id} value={n.id}>
                                    {getNodeLabel(n)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={endNode}
                            onChange={(e) => setEndNode(e.target.value)}
                            style={{ flex: 1 }}
                        >
                            <option value="">End node</option>
                            {nodes.map((n: Node) => (
                                <option key={n.id} value={n.id}>
                                    {getNodeLabel(n)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <label style={{ display: "flex", gap: "4px", alignItems: "center", color: `${theme === "dark" ? "#ffffff" : "#000000"}` }}>
                            <input
                                type="radio"
                                value="bfs"
                                checked={algo === "bfs"}
                                onChange={() => setAlgo("bfs")}
                            />
                            BFS
                        </label>
                        <label style={{ display: "flex", gap: "4px", alignItems: "center", color: `${theme === "dark" ? "#ffffff" : "#000000"}` }}>
                            <input
                                type="radio"
                                value="dijkstra"
                                checked={algo === "dijkstra"}
                                onChange={() => setAlgo("dijkstra")}
                            />
                            Dijkstra
                        </label>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            onClick={runPathfinding}
                            style={{ flex: 1, color: `${theme === "dark" ? "#000000" : "#ffffff"}`, backgroundColor: `${theme === "dark" ? "#ffffff" : "#000000"}` }}>
                            Run
                        </button>
                        <button
                            onClick={clearPath}
                            style={{ color: `${theme === "dark" ? "#000000" : "#ffffff"}`, backgroundColor: `${theme === "dark" ? "#ffffff" : "#000000"}` }}>
                            Clear path
                        </button>
                    </div>

                    {pathError && (
                        <div style={{ color: "#ff0202", fontSize: "12px" }}>{pathError}</div>
                    )}

                    {lastMetrics && (
                        <div style={{ fontSize: "11px", color: "#fc08088e" }}>
                            {lastMetrics.algorithm.toUpperCase()} ·{" "}
                            {lastMetrics.durationMs.toFixed(3)} ms · {lastMetrics.nodes} nodes ·{" "}
                            {lastMetrics.edges} edges
                        </div>
                    )}
                </div>
                <div
                    style={{
                        marginTop: "16px",
                        paddingTop: "8px",
                        borderTop: `1px solid ${theme === "dark" ? "#ffffff" : "#000000"}`,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px"
                    }}
                >
                    <h3 style={{ margin: "0 0 6px", color: `${theme === "dark" ? "#ffffff" : "#000000"}` }}>Example graphs</h3>

                    <select
                        value={selectedExampleId}
                        onChange={(e) => setSelectedExampleId(e.target.value)}
                    >
                        <option value="">Select example…</option>
                        {exampleGraphs.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={loadExampleGraph}
                        disabled={!selectedExampleId}
                        style={{
                            marginTop: "4px",
                            color: `${theme === "dark" ? "#000000" : "#ffffff"}`,
                            backgroundColor: `${theme === "dark" ? "#ffffff" : "#000000"}`
                        }}
                    >
                        Load example
                    </button>
                </div>
                {/* <button
                    onClick={() => {
                        const g = exampleGraph as ExampleGraph;

                        // transform example nodes → React Flow nodes
                        const nodes = g.nodes.map((n) => ({
                            id: n.id,
                            data: { label: n.label },
                            position: { x: n.x, y: n.y },
                            type: "default",
                            style: {
                                borderRadius: "60px",
                                width: "60px",
                                height: "60px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 400,

                            }
                        }));

                        // transform example edges → React Flow edges
                        const edges = g.edges.map((e) => ({
                            id: e.id,
                            source: e.source,
                            target: e.target,
                            label: `${e.source} → ${e.target}`,
                            data: {
                                label: `${e.source} → ${e.target}`,
                                weight: e.weight
                            }
                        }));

                        // clear any highlighted path
                        onHighlightPath(null);

                        // clear search highlight
                        onHighlightNode(null);

                        // reset graph
                        dispatch(setGraph({ nodes, edges }));
                    }}
                    style={{
                        width: "100%",
                        marginTop: "16px",
                        color: `${theme === "dark" ? "#000000" : "#ffffff"}`,
                        backgroundColor: `${theme === "dark" ? "#ffffff" : "#000000"}`
                    }}
                >
                    Load Example Graph
                </button> */}

            </div>
        </div>
    );
}

export const Sidebar = memo(SidebarInner)

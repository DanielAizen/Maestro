import { memo, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import {
    saveSnapshot,
    loadSnapshot,
    deleteSnapshot,
    type NamedGraphSnapshot,
} from "../store/graphSlice";

const formatDateTime = (timestamp: number) => {
    try {
        return new Date(timestamp).toLocaleString();
    } catch {
        return "";
    }
};

export const SavedGraphsSidebar = memo(function SavedGraphsSidebar() {
    const dispatch = useDispatch<AppDispatch>();
    const snapshots = useSelector(
        (state: RootState) => state.graph.savedSnapshots
    );

    const theme = useSelector((state: RootState) => state.theme.theme)

    const [isOpen, setIsOpen] = useState(true);
    const [nameInput, setNameInput] = useState("");

    const sortedSnapshots = useMemo<NamedGraphSnapshot[]>(
        () =>
            [...snapshots].sort(
                (a, b) => b.createdAt - a.createdAt
            ),
        [snapshots]
    );

    const handleSave = () => {
        dispatch(saveSnapshot({ name: nameInput }));
        setNameInput("");
    };

    return (
        <aside
            style={{
                width: isOpen ? 260 : 40,
                transition: "width 0.2s ease",
                borderLeft: `1px solid ${theme === "dark" ? "#fff" : "#000"}`,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                style={{
                    padding: "8px",
                    fontSize: "24px",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    color: `${theme === "dark" ? "#fff" : "#000"}`,
                    textAlign: "left",
                }}
            >
                {isOpen ? "Snapshots >" : "<"}
            </button>

            {isOpen && (
                <div
                    style={{
                        padding: "8px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        height: "100%",
                    }}
                >
                    <div style={{ display: "flex", gap: "4px" }}>
                        <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            placeholder="Snapshot name"
                            style={{
                                flex: 1,
                                padding: "4px 6px",
                                fontSize: "12px",
                                borderRadius: 4,
                                border: "1px solid #ffffff",
                                background: "transparent",
                                color: `${theme === "dark" ? "#fff" : "#000"}`,

                            }}
                        />
                        <button
                            onClick={handleSave}
                            style={{
                                padding: "4px 8px",
                                fontSize: "12px",
                                cursor: "pointer",
                                color: `${theme === "dark" ? "#fff" : "#000"}`,
                                backgroundColor: `${theme === "dark" ? "#000" : "#fff"}`
                            }}
                        >
                            Save
                        </button>
                    </div>

                    <div
                        style={{
                            fontSize: "12px",
                            opacity: 0.8,
                            marginBottom: 4,
                            color: `${theme === "dark" ? "#fff" : "#000"}`,
                        }}
                    >
                        Saved graphs
                    </div>

                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            color: `${theme === "dark" ? "#fff" : "#000"}`,

                        }}
                    >
                        {sortedSnapshots.length === 0 && (
                            <div
                                style={{
                                    fontSize: "12px",
                                    opacity: 0.6,
                                }}
                            >
                                No snapshots yet. Save the current graph to
                                reuse it later.
                            </div>
                        )}

                        {sortedSnapshots.map((snap) => (
                            <div
                                key={snap.id}
                                style={{
                                    borderRadius: 4,
                                    border:
                                        "1px solid rgba(255,255,255,0.1)",
                                    padding: "6px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "4px",

                                }}
                            >
                                <div
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        color: `${theme === "dark" ? "#fff" : "#000"}`,
                                    }}
                                >
                                    {snap.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: "10px",
                                        opacity: 0.7,
                                    }}
                                >
                                    {formatDateTime(snap.createdAt)}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "4px",
                                        marginTop: "4px",
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            dispatch(
                                                loadSnapshot({ id: snap.id })
                                            )
                                        }
                                        style={{
                                            flex: 1,
                                            padding: "3px 0",
                                            fontSize: "11px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Load
                                    </button>
                                    <button
                                        onClick={() =>
                                            dispatch(
                                                deleteSnapshot({ id: snap.id })
                                            )
                                        }
                                        style={{
                                            flex: 1,
                                            padding: "3px 0",
                                            fontSize: "11px",
                                            cursor: "pointer",
                                            opacity: 0.8,
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
});

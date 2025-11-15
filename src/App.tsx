import { TopBarControls } from "./components/TopBarControls";
import { Sidebar } from "./components/Sidebar";
import { GraphCanvas } from "./components/GraphCanvas";

export default function App() {
  
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBarControls />
      <div style={{ flex: 1, display: "flex" }}>
        <Sidebar />
        <GraphCanvas />
      </div>
    </div>
  );
}

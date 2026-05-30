import SudokuBoard from "./components/Field";

function App() {
  return (
    <div className="app-shell">
      <div className="app-glow app-glow-top" />
      <div className="app-glow app-glow-bottom" />
      <div className="app-content">
        <SudokuBoard />
      </div>
    </div>
  );
}

export default App;

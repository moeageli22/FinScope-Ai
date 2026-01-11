import React from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PracticeMode from "./pages/PracticeMode";

function App() {
  return (
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>FinScope AI</h1>

        {/* Temporary navigation (no routing yet) */}
        <Login />
        <hr />
        <Dashboard />
        <hr />
        <PracticeMode />
      </div>
  );
}

export default App;

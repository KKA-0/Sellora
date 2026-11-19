import { useState } from "react";
import { AuthGateway } from "./components/AuthGateway";
import { Dashboard } from "./components/Dashboard";
import { WorkspaceSession } from "./types";
import "./App.css";

function App() {
  const [session, setSession] = useState<WorkspaceSession | null>(() => {
    try {
      const saved = localStorage.getItem("sellora_session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleStartSession = (newSession: WorkspaceSession) => {
    setSession(newSession);
    try {
      localStorage.setItem("sellora_session", JSON.stringify(newSession));
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  };

  const handleExitSession = () => {
    setSession(null);
    try {
      localStorage.removeItem("sellora_session");
    } catch (e) {
      console.error("Failed to remove session:", e);
    }
  };

  if (!session) {
    return <AuthGateway onStartSession={handleStartSession} />;
  }

  return <Dashboard session={session} onExitSession={handleExitSession} />;
}

export default App;

import React, { useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import InputMeals from "./components/InputMeals";
import Motivation from "./components/Motivation";
import TimeConverter from "./components/TimeConverter";
import SetGoals from "./components/SetGoals";
import Reminders from "./components/Reminders";

import "./App.css";

export type User = {
  user_id: number;
  username: string;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState("dashboard");

  function logout() {
    setUser(null);
    setPage("login");
  }

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  return (
    <div>
      <nav className="navbar">
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("meals")}>Meals</button>
        <button onClick={() => setPage("motivation")}>Motivation</button>
        <button onClick={() => setPage("convert")}>Time Converter</button>
        <button onClick={() => setPage("goals")}>Goals</button>
        <button onClick={() => setPage("reminders")}>Reminders</button>

        <div className="nav-right">
          <span>
            Logged in as: <strong>{user.username}</strong>
          </span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="content">
        {page === "dashboard" && <Dashboard user={user} />}
        {page === "meals" && <InputMeals userId={user.user_id} />}
        {page === "motivation" && <Motivation />}
        {page === "convert" && <TimeConverter />}
        {page === "goals" && <SetGoals userId={user.user_id} />}
        {page === "reminders" && <Reminders userId={user.user_id} />}
      </div>
    </div>
  );
}

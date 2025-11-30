import React, { useEffect, useState } from "react";

export default function SetGoals({ userId }: { userId: number }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [timeframe, setTimeframe] = useState("");
  const [cal, setCal] = useState("");
  const [goals, setGoals] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadGoals() {
    const res = await fetch(`http://localhost:3001/api/data/${userId}`);
    const data = await res.json();
    setGoals(data.filter((x: any) => x.type === "goal"));
  }

  useEffect(() => {
    loadGoals();
  }, []);

  async function saveGoal() {
    if (!name || !desc || !timeframe || !cal) return;

    const goalObject = {
      type: "goal",
      name,
      description: desc,
      timeframe,
      calories: parseInt(cal)
    };

    const res = await fetch("http://localhost:3001/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, data: goalObject })
    });

    const text = await res.text();
    setMsg(text);

    setName("");
    setDesc("");
    setTimeframe("");
    setCal("");

    loadGoals();

    setTimeout(() => setMsg(null), 1200);
  }

  return (
    <div className="page-card">
      <h2>Create a Goal</h2>

      <input
        placeholder="Goal Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <input
        placeholder="Timeframe (e.g., 4 weeks)"
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
      />

      <input
        placeholder="Calories"
        type="number"
        value={cal}
        onChange={(e) => setCal(e.target.value)}
      />

      <button onClick={saveGoal}>Save Goal</button>

      {msg && <p className="success-message">{msg}</p>}

      <h3>Saved Goals</h3>
      {goals.length === 0 ? (
        <p className="empty-state">No goals saved yet.</p>
      ) : (
        <ul>
          {goals.map((g, i) => (
            <li key={i}>
              <strong>{g.name}</strong>
              <em>{g.description}</em>
              <em>{g.timeframe} — {g.calories} calories</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

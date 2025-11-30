import React, { useEffect, useState } from "react";
import { User } from "../App";

export default function Dashboard({ user }: { user: User }) {
  const [data, setData] = useState<any[]>([]);

  async function loadAll() {
    const res = await fetch(`http://localhost:3001/api/data/${user.user_id}`);
    const items = await res.json();
    setData(items);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const meals = data.filter(item => item.type === "meal");
  const goals = data.filter(item => item.type === "goal");
  const reminders = data.filter(item => item.type === "REMINDER");

  return (
    <div className="page-card">
      <h2>Welcome, {user.username}!</h2>

      <h3>Your Meals</h3>
      {meals.length === 0 ? (
        <p className="empty-state">No meals saved.</p>
      ) : (
        <ul>
          {meals.map((m, i) => (
            <li key={i}>
              <strong>{m.name}</strong>
              <em>{m.calories} calories</em>
              <em>{m.description}</em>
            </li>
          ))}
        </ul>
      )}

      <h3>Your Goals</h3>
      {goals.length === 0 ? (
        <p className="empty-state">No goals saved.</p>
      ) : (
        <ul>
          {goals.map((g, i) => (
            <li key={i}>
              <strong>{g.name}</strong>
              <em>{g.calories} calories — {g.timeframe}</em>
              <em>{g.description}</em>
            </li>
          ))}
        </ul>
      )}

      <h3>Your Reminders</h3>
      {reminders.length === 0 ? (
        <p className="empty-state">No reminders.</p>
      ) : (
        <ul>
          {reminders.map((r, i) => (
            <li key={i}>
              <strong>{r.title}</strong>
              <em>{r.date} at {r.time}</em>
              {r.notes && <em>{r.notes}</em>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";

export default function InputMeals({ userId }: { userId: number }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [cal, setCal] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [meals, setMeals] = useState<any[]>([]);

  async function loadMeals() {
    const res = await fetch(`http://localhost:3001/api/data/${userId}`);
    const items = await res.json();
    const onlyMeals = items.filter((item: any) => item.type?.toLowerCase() === "meal");
    setMeals(onlyMeals);
  }

  async function saveMeal() {
    if (!name || !desc || !cal) return;

    const mealObject = {
      type: "meal",
      name,
      description: desc,
      calories: parseInt(cal)
    };

    await fetch("http://localhost:3001/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, data: mealObject })
    });

    setMsg("Meal saved!");

    setName("");
    setDesc("");
    setCal("");

    // Refresh the meal list
    loadMeals();

    setTimeout(() => setMsg(null), 1200);
  }

  useEffect(() => {
    loadMeals();
  }, []);

  return (
    <div className="page-card">
      <h2>Add a Meal</h2>

      <input
        placeholder="Meal Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />

      <input
        placeholder="Calories"
        value={cal}
        type="number"
        onChange={(e) => setCal(e.target.value)}
      />

      <button onClick={saveMeal}>Save Meal</button>
      {msg && <p className="success-message">{msg}</p>}

      <h3>Your Saved Meals</h3>
      {meals.length === 0 ? (
        <p className="empty-state">No meals saved yet.</p>
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
    </div>
  );
}

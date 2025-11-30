import React, { useEffect, useState } from "react";

export default function Reminders({ userId }: { userId: number }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [reminders, setReminders] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  // Fetch all reminders from backend
  async function loadReminders() {
    const res = await fetch(`http://localhost:3001/api/data/${userId}`);
    const data = await res.json();

    const filtered = data
      .filter((item: any) => item.type === "REMINDER");

    setReminders(filtered);
  }

  useEffect(() => {
    loadReminders();
  }, []);

  async function saveReminder() {
    if (!title || !date || !time) {
      setMsg("Title, date, and time are required.");
      return;
    }

    const payload = {
      user_id: userId,
      data: {
        type: "REMINDER",
        title,
        date,
        time,
        notes,
      }
    };

    const res = await fetch("http://localhost:3001/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    setMsg(text);

    setTitle("");
    setDate("");
    setTime("");
    setNotes("");

    loadReminders();
  }

  async function deleteReminder(index: number) {
    const res = await fetch(
      `http://localhost:3001/api/data/${userId}/${index}`,
      { method: "DELETE" }
    );

    await res.text();
    loadReminders();
  }

  return (
    <div>
      <h2>Create Reminder</h2>

      <input
        className="reminder-input"
        placeholder="Reminder Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Date:</label>
      <input
        className="reminder-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <label>Time:</label>
      <input
        className="reminder-input"
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />

      <textarea
        className="reminder-input"
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button onClick={saveReminder}>Save Reminder</button>

      {msg && <p style={{ marginTop: "10px" }}>{msg}</p>}

      <h3>Your Reminders</h3>

      {reminders.length === 0 ? (
        <p>No reminders yet.</p>
      ) : (
        <ul>
          {reminders.map((reminder, i) => (
            <li key={i}>
              <strong>{reminder.title}</strong>
              <br />
              {reminder.date} at {reminder.time}
              <br />
              {reminder.notes && <em>{reminder.notes}</em>}
              <br />
              <button onClick={() => deleteReminder(i)}>Delete</button>
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

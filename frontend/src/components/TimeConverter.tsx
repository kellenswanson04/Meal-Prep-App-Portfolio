import React, { useState } from "react";

export default function TimeConverter() {
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("seconds");
  const [toUnit, setToUnit] = useState("minutes");
  const [result, setResult] = useState<any>(null);

  async function convert() {
    const res = await fetch(
      `http://localhost:3001/api/convert-time?value=${value}&from=${fromUnit}&to=${toUnit}`
    );

    const data = await res.json();
    setResult(data);
  }

  return (
    <div className="page-card">
      <h2>Time Converter</h2>

      <input
        type="number"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <label>From:</label>
      <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
        <option value="seconds">Seconds</option>
        <option value="minutes">Minutes</option>
        <option value="hours">Hours</option>
        <option value="days">Days</option>
      </select>

      <label>To:</label>
      <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
        <option value="seconds">Seconds</option>
        <option value="minutes">Minutes</option>
        <option value="hours">Hours</option>
        <option value="days">Days</option>
      </select>

      <button onClick={convert}>Convert</button>

      {result && result.success && (
        <div className="quote-box" style={{ marginTop: "20px" }}>
          <p style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
            {result.from} = {result.to}
          </p>
        </div>
      )}

      {result && !result.success && (
        <p className="error-message">{result.error || "Conversion failed"}</p>
      )}
    </div>
  );
}

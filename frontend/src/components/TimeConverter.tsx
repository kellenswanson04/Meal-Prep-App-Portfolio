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
    <div>
      <h2>Time Converter</h2>

      <input
        type="number"
        placeholder="Value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <div>
        <label>From:</label>
        <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>

      <div>
        <label>To:</label>
        <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
          <option value="seconds">Seconds</option>
          <option value="minutes">Minutes</option>
          <option value="hours">Hours</option>
          <option value="days">Days</option>
        </select>
      </div>

      <button onClick={convert}>Convert</button>

      {result && result.success && (
        <p>{result.from} = {result.to}</p>
      )}
    </div>
  );
}

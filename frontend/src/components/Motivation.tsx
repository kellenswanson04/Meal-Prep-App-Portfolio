import React, { useState } from "react";

export default function Motivation() {
  const [category, setCategory] = useState("random");
  const [quote, setQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getQuote() {
    setLoading(true);
    setError(null);
    setQuote(null);

    try {
      // encode the category so "video games" becomes "video%20games"
      const q = encodeURIComponent(category);
      const res = await fetch(
        `http://localhost:3001/api/quotes?quantity=1&category=${q}`
      );

      if (!res.ok) {
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }

      // attempt to parse JSON
      const data = await res.json();
      console.log("raw quotes response:", data);

      // handle multiple possible shapes robustly
      // 1) data is an array: ["quote"]
      if (Array.isArray(data) && data.length > 0) {
        setQuote(String(data[0]));
        setLoading(false);
        return;
      }

      // 2) data.quotes is an array
      if (data && Array.isArray(data.quotes) && data.quotes.length > 0) {
        setQuote(String(data.quotes[0]));
        setLoading(false);
        return;
      }

      // 3) data.data is an array (some proxies wrap in data)
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        setQuote(String(data.data[0]));
        setLoading(false);
        return;
      }

      // 4) data itself is a string
      if (typeof data === "string" && data.trim().length > 0) {
        setQuote(data);
        setLoading(false);
        return;
      }

      // 5) data.result or other wrappers
      if (data && typeof data.result === "string" && data.result.trim().length > 0) {
        setQuote(data.result);
        setLoading(false);
        return;
      }

      // nothing usable found
      setError("No quote returned (empty or unexpected shape). See console for raw response.");
    } catch (err: any) {
      console.error("Error fetching quote:", err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Motivational Quotes</h2>

      <label>Category: </label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="random">Random</option>
        <option value="music">Music</option>
        <option value="pets">Pets</option>
        <option value="school">School</option>
        <option value="sports">Sports</option>
        <option value="video games">Video Games</option>
      </select>

      <button onClick={getQuote} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {quote && (
        <div className="quote-box" style={{ marginTop: "1rem" }}>
          <p>"{quote}"</p>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";

type Props = {
  onLogin: (user: { user_id: number; username: string }) => void;
};

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [msgType, setMsgType] = useState<"error" | "success" | null>(null);

  async function handleLogin() {
    const res = await fetch("http://localhost:3001/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      setMsg(null);
      onLogin({ user_id: data.user_id, username: data.username });
    } else {
      setMsg(data.error || "Invalid login credentials");
      setMsgType("error");
    }
  }

  async function handleRegister() {
    const res = await fetch("http://localhost:3001/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      setMsg("Registration successful! You may now log in.");
      setMsgType("success");
    } else {
      setMsg(data.error || "Registration failed");
      setMsgType("error");
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">Meal Prep App</h1>
        <h3 className="login-subtitle">Log In or Register to continue</h3>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="login-btn" onClick={handleLogin}>Log In</button>
        <button className="register-btn" onClick={handleRegister}>Register</button>

        {msg && (
          <p className={`login-message ${msgType === "error" ? "error-box" : "success-box"}`}>
            {msg}
          </p>
        )}

        <p className="login-tagline">
          Meal prepping made easy in an app!  
          <br />  
          Create your diet goals and track them here!
        </p>
      </div>
    </div>
  );
}

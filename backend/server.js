// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const zmq = require("zeromq");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "1mb" }));

// ----------------------------
// ZMQ SOCKET CONNECTIONS
// ----------------------------
const authSocket = new zmq.Request();
const dataSocket = new zmq.Request();
const quotesSocket = new zmq.Request();
const timeSocket = new zmq.Request();

(async () => {
  await authSocket.connect("tcp://localhost:5555");
  await dataSocket.connect("tcp://localhost:5556");
  await quotesSocket.connect("tcp://localhost:5557");
  await timeSocket.connect("tcp://localhost:5558");

  console.log("Gateway connected to:");
  console.log(" - Auth Microservice (5555)");
  console.log(" - Data Saver Microservice (5556)");
  console.log(" - Motivational Quotes Microservice (5557)");
  console.log(" - Time Conversion Microservice (5558)");
})();

// ============================================================================
// AUTH ROUTES
// ============================================================================
app.post("/api/register", async (req, res) => {
  try {
    await authSocket.send([
      Buffer.from("register"),
      Buffer.from(JSON.stringify(req.body)),
    ]);
    const [reply] = await authSocket.receive();
    res.json(JSON.parse(reply.toString()));
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    await authSocket.send([
      Buffer.from("login"),
      Buffer.from(JSON.stringify(req.body)),
    ]);
    const [reply] = await authSocket.receive();
    res.json(JSON.parse(reply.toString()));
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

// ============================================================================
// DATA SAVER ROUTES
// ============================================================================
app.post("/api/save", async (req, res) => {
  try {
    const payload = { action: "save", ...req.body };
    await dataSocket.send(JSON.stringify(payload));
    const reply = await dataSocket.receive();
    res.send(reply.toString());
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get("/api/data/:user_id", async (req, res) => {
  try {
    const payload = {
      action: "get_all",
      user_id: parseInt(req.params.user_id),
    };
    await dataSocket.send(JSON.stringify(payload));
    const reply = await dataSocket.receive();
    res.json(JSON.parse(reply.toString()));
  } catch (err) {
    res.status(500).json({ success: false, error: err.toString() });
  }
});

app.delete("/api/data/:user_id/:index", async (req, res) => {
  try {
    const payload = {
      action: "delete",
      user_id: parseInt(req.params.user_id),
      index: parseInt(req.params.index),
    };
    await dataSocket.send(JSON.stringify(payload));
    const reply = await dataSocket.receive();
    res.send(reply.toString());
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// ============================================================================
// MOTIVATIONAL QUOTES ROUTE
// ============================================================================
app.get("/api/quotes", async (req, res) => {
  try {
    const category = req.query.category || "random";
    const quantity = parseInt(req.query.quantity) || 1;

    // ZMQ microservice expects: "1 sports", NOT JSON
    const message = `${quantity} ${category}`;
    console.log(`[Quotes] Sending message: "${message}"`);

    await quotesSocket.send(message);
    const [reply] = await quotesSocket.receive();
    
    const responseText = reply.toString();
    console.log(`[Quotes] Received reply: ${responseText.substring(0, 100)}...`);
    
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (err) {
    console.error("[Quotes] Error:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});


// ============================================================================
// TIME CONVERSION ROUTE
// ============================================================================
app.get("/api/convert-time", async (req, res) => {
  try {
    const { value, from, to } = req.query;

    // ZMQ microservice expects: "value from_unit to_unit" (space-separated string)
    const message = `${value} ${from} ${to}`;
    console.log(`[TimeConverter] Sending message: "${message}"`);

    await timeSocket.send(message);
    const [reply] = await timeSocket.receive();
    
    const responseText = reply.toString();
    console.log(`[TimeConverter] Received reply: ${responseText}`);
    
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (err) {
    console.error("[TimeConverter] Error:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

// ============================================================================
// START API GATEWAY
// ============================================================================
const PORT = 3001;
app.listen(PORT, () =>
  console.log(`API gateway running at http://localhost:${PORT}`)
);

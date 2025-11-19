const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());

// Log folder
if (!fs.existsSync("logs")) fs.mkdirSync("logs");

app.post("/consent-log", (req, res) => {
  const entry = {
    timestamp: req.body.timestamp,
    page: req.body.page,
    userAgent: req.body.userAgent,
    consent: req.body.consent
  };

  fs.appendFileSync("logs/consent.log", JSON.stringify(entry) + "\n");
  res.json({ status: "ok" });
});

app.use(express.static("."));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

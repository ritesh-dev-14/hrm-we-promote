const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/error.middleware");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});

// Register routes
app.use("/api/auth", require("./modules/auth/auth.routes"));

app.use(errorMiddleware);

module.exports = app;
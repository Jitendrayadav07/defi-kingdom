// routes/index.js
const express = require("express");
const router = express.Router();

// Import route handlers
const walletProfileRoutes = require("./walletProfile");
const heroesRoutes = require("./heroes");
const userRoutes = require("./user");
const agentRoutes = require("./agent");

// Register route handlers
router.use("/profile", walletProfileRoutes);
router.use("/heroes", heroesRoutes);
router.use("/user", userRoutes);
router.use("/agent", agentRoutes);

module.exports = router;

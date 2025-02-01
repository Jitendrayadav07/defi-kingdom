// routes/index.js
const express = require("express");
const router = express.Router();

// Import route handlers
const walletProfileRoutes = require("./walletProfile");
const heroesRoutes = require("./heroes");
const userRoutes = require("./user");
const defiChatRoutes = require("./defiChat");

// Register route handlers
router.use("/profile", walletProfileRoutes);
router.use("/heroes", heroesRoutes);
router.use("/user", userRoutes);
router.use("/defi-chat", defiChatRoutes);

module.exports = router;

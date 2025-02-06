// routes/index.js
const express = require("express");
const router = express.Router();

// Import route handlers
const walletProfileRoutes = require("./walletProfile");
const heroesRoutes = require("./heroes");
const userRoutes = require("./user");
const tokenRoutes = require("./token");

// Register route handlers
router.use("/profile", walletProfileRoutes);
router.use("/heroes", heroesRoutes);
router.use("/user", userRoutes);
router.use("/token", tokenRoutes);

module.exports = router;

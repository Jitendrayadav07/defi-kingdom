// routes/index.js
const express = require("express");
const router = express.Router();

// Import route handlers
const roleRoutes = require("./role");

// Register route handlers
router.use("/role", roleRoutes);

module.exports = router;

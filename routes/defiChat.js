const express = require("express");
const router = express.Router();
const defiController = require("../controllers/defiController");

router.post("/",
    defiController.communicateWithBot
);


module.exports = router; 

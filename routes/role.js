const express = require("express");
const router = express.Router();

const roleController = require("../controllers/roleController");
const JoiMiddleWare = require('../middlewares/joi/joiMiddleware'); 
const roleSchema = require("../validations/roleValidation");
const userAuth = require("../middlewares/jsonwebtoken/joiAuthMiddleware");

router.post("/create", 
JoiMiddleWare(roleSchema.createRole, 'body'),
roleController.createRole);

router.get("/", roleController. getRoles);

module.exports = router;
const express = require("express");
const router = express.Router();

const tokenController = require("../controllers/tokenController");
const tokenSchema = require("../validations/tokenValidation");
const JoiMiddleWare = require("../middlewares/joi/joiMiddleware");
const userAuth = require("../middlewares/jsonwebtoken/joiAuthMiddleware");

router.post("/swap-tokens",
    userAuth,
    JoiMiddleWare(tokenSchema.swapTokens, "body"),
    tokenController.swapTokens
);


module.exports = router;
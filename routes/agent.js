const express = require("express");
const router = express.Router();

const agentController = require("../controllers/agentController");
const agentValidationSchema = require("../validations/agentValidation");
const JoiMiddleWare = require("../middlewares/joi/joiMiddleware");

router.post("/user-prompt",
  JoiMiddleWare(agentValidationSchema.userPromptSchema, "body"),
  agentController.userPrompt
);

module.exports = router;

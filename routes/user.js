const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const userSchema = require("../validations/userValidation");
const JoiMiddleWare = require("../middlewares/joi/joiMiddleware");

router.post("/register",
  JoiMiddleWare(userSchema.registerUser, "body"),
  userController.registerUser
);

router.post("/sign-in",
  JoiMiddleWare(userSchema.signIn, "body"),
  userController.userSignIn
);


router.post('/forgot-password',
  JoiMiddleWare(userSchema.forgotPassword, "body"),
  userController.forgotPassword)

router.put("/set-user-password",
  JoiMiddleWare(userSchema.setUserPassword, "body"),
  userController.setUserPassword)

module.exports = router;

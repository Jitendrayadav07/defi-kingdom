const express = require("express");
const router = express.Router();
const passport = require("passport");
const db = require("../config/db.config");

const { JWT_SECRET } = require("../config/jwtTokenKey");
const jwt = require("jsonwebtoken");
require("dotenv").config();


router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login/failed",
  }),
  async (req, res) => {
    try {
      const user_data = req.user;
      console.log("user_data",user_data)
        if(!user_data){
            res.status(404).json({ message: "User not found" });
        }

        let userExist = await db.users.findOne({
          where: {
            email: user_data.emails[0].value,
          },
        });
 
        if (!userExist) {
          user_create = await db.users.create({
            email: user_data.emails[0].value,
            name: user_data.displayName,
          })
        }

        const token = jwt.sign(
          {
            email: user_data.emails[0].value,
            name: user_data.displayName,
          },
          JWT_SECRET,
          { expiresIn: "24h" }
        );
        res.cookie("googleAuthToken", token, {
          httpOnly: true, 
          secure: process.env.NODE_ENV === "production", 
          sameSite: "strict",
        });
        const CLIENT_URL = "http://localhost:5173/auth/google/success";
        res.redirect(CLIENT_URL); 
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;
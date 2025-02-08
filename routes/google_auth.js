const express = require("express");
const router = express.Router();
const passport = require("passport");
const db = require("../config/db.config");

const { JWT_SECRET } = require("../config/jwtTokenKey");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.get("/google", passport.authenticate("google", { scope: ["profile","email"]  }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/failed" }),
  async (req, res) => {
    try {
      const user_data = req.user;
      if (!user_data) {
        return res.status(404).json({ message: "User not found" });
      }

      const type = req.query.type; // Get login or signup type
      let userExist = await db.users.findOne({ where: { email: user_data.emails[0].value } });
      console.log({type})
      if (!userExist) {
        if (type === "login") {
          return res.redirect("http://localhost:5173/auth/error?message=User%20does%20not%20exist");
        }
        
        // Create new user for sign-up
        userExist = await db.users.create({
          email: user_data.emails[0].value,
          name: user_data.displayName,
          wallet_address: null,
        });
      } else if (type === "signup") {
        return res.redirect("http://localhost:5173/auth/error?message=User%20already%20exists");
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          email: userExist.email,
          name: userExist.name,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.cookie("googleAuthToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      const CLIENT_URL = `http://localhost:5173/auth/google/success/${token}/${userExist.wallet_address || "N/A"}`;
      res.redirect(CLIENT_URL);
    } catch (error) {
      console.error("Error during Google callback:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);


module.exports = router;
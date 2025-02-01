const Response = require("../classes/Response");
const db = require("../config/db.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwtTokenKey");
const { Op, QueryTypes } = require("sequelize");
const USER_CONSTANTS = require("../constants/userConstants");
const sendForgetEmail = require("../utils/sendForgetEmail");
const sendEmail = require("../utils/sendEmail");
const { ethers } = require("ethers");
require("dotenv").config();

// Function to create a new wallet
async function generateWallet() {
  const wallet = ethers.Wallet.createRandom(); // No need for await here as it's synchronous
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

const registerUser = async (req, res) => {
  try {
    let user_data = await db.users.findOne({ where: { email: req.body.email } });

    if (user_data)
      return res.status(400).send(Response.sendResponse(false, null, USER_CONSTANTS.EMAIL_ALREADY_EXISTS, 400));

    req.body.password = await bcrypt.hash(req.body.password, 10);

    let wallet_create = await generateWallet();

    req.body.wallet_address = wallet_create.address;
    req.body.wallet_private_key = wallet_create.privateKey;

    let user = await db.users.create(req.body);

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "23h" });

    let emailData = {
      token: token,
      filePath: "../templates/userRegister.html",
      subject: 'Verify Email',
      name: user.name
    };

    await sendEmail(req.body.email, emailData.subject, emailData);
    res.status(201).send(Response.sendResponse(true, user, USER_CONSTANTS.USER_CREATED, 201));
  } catch (err) {
    console.log("errr", err)
    return res.status(500).send(Response.sendResponse(false, null, err, 500));
  }
}

const userSignIn = async (req, res) => {
  try {
    let user_data = await db.users.findOne({ where: { email: req.body.email } });

    if (!user_data)
      return res.status(404).send(Response.sendResponse(false, null, USER_CONSTANTS.EMAIL_AND_PASSWORD_INVALID, 404));

    let passwordMatch = await bcrypt.compare(req.body.password, user_data.password);

    if (!passwordMatch)
      return res.status(404).send(Response.sendResponse(false, null, USER_CONSTANTS.EMAIL_AND_PASSWORD_INVALID, 404));

    delete user_data.dataValues.password;
    delete user_data.dataValues.wallet_private_key;
    // JWT Token creation
    const token = jwt.sign(
      { email: user_data.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    user_data.dataValues["token"] = token;
    res.status(200).send(Response.sendResponse(true, user_data, USER_CONSTANTS.LOGIN_SUCCESSFUL, 200));
  } catch (err) {
    console.log("err", err)
    return res.status(500).send(Response.sendResponse(false, null, err, 500));
  }
};

const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body

    let user_data = await db.users.findOne({
      where: {
        email: email
      }
    })

    if (!user_data) {
      return res.status(400).send(Response.sendResponse(false, null, USER_CONSTANTS.EMAIL_AND_PASSWORD_INVALID, 400));
    }

    let userName = user_data.name

    const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: "5h" });
    console.log("token", token)
    await sendForgetEmail(userName, "Password Reset Request", token, email);

    return res.status(200).send(Response.sendResponse(true, null, USER_CONSTANTS.EMAIL_SENT, 200));

  } catch (error) {
    return res.status(500).send(Response.sendResponse(false, null, error, 500));
  }
}

const setUserPassword = async (req, res) => {
  try {
    let { token, password } = req.body
    const decoded = jwt.verify(token, JWT_SECRET);

    let user_data = await db.users.findOne({ where: { email: decoded.email } })

    if (!user_data) {
      return res.status(400).send(Response.sendResponse(false, null, USER_CONSTANTS.EMAIL_AND_PASSWORD_INVALID, 400));
    } else {
      password = await bcrypt.hash(password, 10)

      let user_update = await db.users.update({ password: password }, { where: { email: decoded.email } })

      return res
        .status(200)
        .send(
          Response.sendResponse(
            true,
            user_update,
            USER_CONSTANTS.PASSWORD_UPDATE,
            200
          )
        );
    }
  } catch (error) {
    return res.status(500).send(Response.sendResponse(false, null, error, 500));
  }
};


module.exports = {
  registerUser,
  userSignIn,
  forgotPassword,
  setUserPassword
}
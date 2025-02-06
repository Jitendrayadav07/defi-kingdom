const Response = require("../classes/Response");
const db = require("../config/db.config");
const speakeasy = require('speakeasy');
const sendEmail = require("../config/sendEmail");
const OTPCONSTANT = require("../constants/otpConstants");

function generateOTP() {
    const otp = speakeasy.totp({
        secret: 'secret_key',  // Use a secure key in production
        encoding: 'base32'
    });
    return otp;
}

function verifyOTP(token) {
    const verified = speakeasy.totp.verify({
        secret: 'secret_key', 
        encoding: 'base32',
        token: token,
        window: 1
    });
    return verified;
}

async function getUserData(email) {
    if (!email) {
        return { error: OTPCONSTANT.EMAIL_REQUIRED, status: 400 };
    }
    let user_data = await db.users.findOne({
        where: { email: email },
        attributes: ['email', 'wallet_address']
    });
    if (!user_data) {
        return { error: OTPCONSTANT.USER_NOT_FOUND, status: 400 };
    }
    return { user_data };
}

const generateOTPSendEmail = async (req, res) => {   
    try {
        let { email } = req.user;

        const { error, status } = await getUserData(email);
        if (error) {
            return res.status(status).send(Response.sendResponse(false, null, error, status));
        }

        const otp = generateOTP();
        await sendEmail(OTPCONSTANT.OTP_SEND_SUCCESS, email, otp);
        return res.status(200).send(Response.sendResponse(true, otp, OTPCONSTANT.OTP_SEND_SUCCESS, 200));
    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, error, 500));
    }
}

const verifyOTPEmail = async (req, res) => {
    try {
        let { otp } = req.body;

        if (!otp) {
            return res.status(400).send(Response.sendResponse(false, null, OTPCONSTANT.OTP_REQUIRED, 400));
        }

        let { email } = req.user;

        const { error, status, user_data } = await getUserData(email);
        if (error) {
            return res.status(status).send(Response.sendResponse(false, null, error, status));
        }

        const isVerified = verifyOTP(otp);
        if (isVerified) {
            return res.status(200).send(Response.sendResponse(true, user_data, OTPCONSTANT.OTP_SUCCESS, 200));
        } else {
            return res.status(400).send(Response.sendResponse(false, null, OTPCONSTANT.OTP_FAILED, 400));
        }
    } catch (error) {
        return res.status(500).send(Response.sendResponse(false, null, error, 500));
    }
}

module.exports = {
    generateOTPSendEmail,
    verifyOTPEmail
}
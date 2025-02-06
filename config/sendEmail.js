const nodemailer = require("nodemailer");
const fs = require('fs');
const handlebars = require("handlebars");
const { promisify } = require('util');
const path = require("path")
const readFile = promisify(fs.readFile);
require("dotenv").config();

const sendEmail = async (subject, email ,otp ) => {
    try {
      const htmlToSend = `
        <h2>Pharmaalabs - OTP Verification</h2>
  
        <p>Hi ${email},</p>
  
        <p>You're one step away from securing your account.</p>
  
        <p>Your One-Time Password (OTP) for verification is:</p>
  
        <h3 style="color: #ff6600; font-size: 24px;">${otp}</h3>
  
        <p>This OTP is valid for the next 10 minutes. Please do not share it with anyone.</p>
  
        <p>If you didn't request this OTP, please ignore this email.</p>
  
        <p>Need more help?</p>
  
        <p>If you encounter any issues, please reach out to our support team at 
        <a href="mailto:jitendra.bechan.yadav@gmail.com">jitendra.bechan.yadav@gmail.com</a> or 
        <a href="tel:+91 9078347824">+91 9078347824</a>. We're always happy to assist!</p>
  
        <p>Stay safe online!</p>
  
        <p>Sincerely,</p>
        <p>The Pharmaalabs Team</p>
      `;
  
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        port: 587,
        secure: true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
  
      await transporter.sendMail({
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: subject,
        html: htmlToSend,
      });
  
      console.log("OTP email sent successfully");
    } catch (error) {
      console.log("OTP email not sent");
      console.log(error);
    }
  };
  

module.exports = sendEmail;
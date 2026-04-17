const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.json({ success: false, message: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      username,
      email,
      password: hashedPassword
    });

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: "User already exists" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false, message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: "Invalid credentials" });

    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
        console.error("Critical: JWT_SECRET missing in environment variables.");
        return res.status(500).json({ success: false, message: "Internal server error" });
    }

    // MFA FLOW: Generate OTP, Hash & Save, Send Mail.
    const otpService = require("../services/otpService");
    const emailService = require("../services/emailService");
    
    const otp = otpService.generateOtp();
    await otpService.storeOtp(user.email, otp);
    
    try {
        await emailService.sendOtpEmail(user.email, otp);
    } catch (err) {
        console.error("Failed to send OTP via Resend. The OTP was generated however.");
        // Non-blocking for offline testing, but in production we can throw an error if desired.
    }

    // Return to client flagging MFA
    res.json({
        success: true,
        mfaRequired: true,
        email: user.email
    });
    
  } catch (error) {
    console.error("Login failed:", error);
    res.json({ success: false, message: "Login failed" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
      const { email, otp } = req.body;
      if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP required" });

      const otpService = require("../services/otpService");
      const isValid = await otpService.verifyOtp(email, otp);
      if (!isValid) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

      // OTP is valid. Proceed to issue JWT.
      const user = await User.findOne({ email });

      const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' } 
      );

      // Clean up the verified OTP.
      await otpService.clearOtp(email);

      res.json({
          success: true,
          token,
          username: user.username
      });
  } catch (error) {
      console.error("OTP verification failed:", error);
      res.status(500).json({ success: false, message: "OTP Verification failed" });
  }
};

exports.sendOtp = async (req, res) => {
  try {
      const { email } = req.body;
      // Ensure user actually exists to prohibit arbitrary spamming
      const user = await User.findOne({ email });
      if (!user) return res.json({ success: false, message: "User not found" });

      const otpService = require("../services/otpService");
      const emailService = require("../services/emailService");
      
      const otp = otpService.generateOtp();
      await otpService.storeOtp(email, otp);
      
      try {
          await emailService.sendOtpEmail(email, otp);
      } catch(err) {
          console.error("Send OTP manual request failed at Resend boundary", err);
      }

      res.json({ success: true, mfaRequired: true });
  } catch(err) {
      console.error("Send OTP failed", err);
      res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const otpService = require("../services/otpService");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function verifyTestUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "testuser@example.com";
    const password = "user@123";
    const testOtp = "587862";

    // 1. Verify User Credentials
    const user = await User.findOne({ username: "testuser" });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    // 2. Verify Default OTP
    const isValidOtp = await otpService.verifyOtp(email, testOtp);
    console.log("OTP verify (default code):", isValidOtp);

    if (isMatch && isValidOtp) {
        console.log("✅ Test User Verification Success!");
    } else {
        console.log("❌ Test User Verification Failed!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

verifyTestUser();

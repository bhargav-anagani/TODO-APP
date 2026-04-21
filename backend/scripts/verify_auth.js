const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../models/User");
const Otp = require("../models/Otp");
const otpService = require("../services/otpService");

async function verifyAuthFlow() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!");

    const testUser = {
      name: "Test User",
      username: "testuser_" + Date.now(),
      email: "test_" + Date.now() + "@example.com",
      password: "password123"
    };

    console.log(`\n1. Creating Test User: ${testUser.username}...`);
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    const user = await User.create({ ...testUser, password: hashedPassword });
    console.log("User created successfully!");

    console.log("\n2. Simulating Login & OTP Generation...");
    // This mimics authController.login logic
    const foundUser = await User.findOne({ username: testUser.username });
    if (foundUser) {
        const otp = otpService.generateOtp();
        console.log(`Generated OTP: ${otp}`);
        
        await otpService.storeOtp(foundUser.email, otp);
        console.log("OTP stored in database!");
    }

    console.log("\n3. Verifying Collections...");
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const names = collections.map(c => c.name);
    console.log("Current Collections:", names);

    if (names.includes("otps")) {
        console.log("SUCCESS: 'otps' collection is present.");
        const otpCount = await db.collection("otps").countDocuments();
        console.log(`Documents in 'otps': ${otpCount}`);
    } else {
        console.log("FAILURE: 'otps' collection is still missing!");
    }

    // Cleanup
    console.log("\nCleaning up test data...");
    await User.deleteOne({ _id: user._id });
    await Otp.deleteMany({ email: testUser.email });
    console.log("Cleanup complete.");

    process.exit(0);
  } catch (err) {
    console.error("Error during verification:", err);
    process.exit(1);
  }
}

verifyAuthFlow();

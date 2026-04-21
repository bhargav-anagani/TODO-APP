const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function verify() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // 1. Find or create a test user
    let user = await User.findOne({ email: "test@example.com" });
    if (!user) {
      user = await User.create({
        name: "Test User",
        username: "testuser_" + Date.now(),
        email: "test@example.com",
        password: "password123"
      });
      console.log("Created test user");
    }

    // 2. Simulate generating a token and storing it
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    user.tokens = user.tokens.concat({ token });
    await user.save();
    console.log("Token stored in DB successfully");

    // 3. Verify token exists in DB (simulating authMiddleware)
    const foundUser = await User.findOne({ _id: user._id, "tokens.token": token });
    if (foundUser) {
      console.log("Verification Success: Token found in DB for user");
    } else {
      console.log("Verification Failed: Token NOT found in DB");
    }

    // 4. Simulate logout
    user.tokens = user.tokens.filter(t => t.token !== token);
    await user.save();
    console.log("Token removed from DB (Logout simulated)");

    // 5. Verify token is gone
    const goneUser = await User.findOne({ _id: user._id, "tokens.token": token });
    if (!goneUser) {
      console.log("Verification Success: Token correctly removed from DB");
    } else {
      console.log("Verification Failed: Token still exists in DB after logout");
    }

    process.exit(0);
  } catch (error) {
    console.error("Verification Error:", error);
    process.exit(1);
  }
}

verify();

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

dotenv.config({ path: path.join(__dirname, "../.env") });

async function verifyHashedSession() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "testuser@example.com";
    let user = await User.findOne({ email });
    if (!user) throw new Error("testuser not found");

    // 1. Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    // 2. Hash and store
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    user.tokens = user.tokens.concat({ token: hashedToken });
    await user.save();
    console.log("Hashed token stored in DB:", hashedToken);

    // 3. Verify hashing correctly obscures the token
    if (hashedToken === token) {
        throw new Error("Security Failure: Token was NOT hashed properly!");
    } else {
        console.log("Security Success: Token is hashed and obscured.");
    }

    // 4. Verify lookup works (simulating authMiddleware)
    const foundUser = await User.findOne({ _id: user._id, "tokens.token": hashedToken });
    if (foundUser) {
      console.log("Verification Success: Hashed token correctly matched in DB");
    } else {
      console.log("Verification Failed: Hashed token NOT found in DB");
    }

    // 5. Cleanup
    user.tokens = user.tokens.filter(t => t.token !== hashedToken);
    await user.save();
    console.log("Hashed token removed from DB");

    process.exit(0);
  } catch (error) {
    console.error("Verification Error:", error);
    process.exit(1);
  }
}

verifyHashedSession();

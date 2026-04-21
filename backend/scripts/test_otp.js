const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Otp = require("../models/Otp");

async function testOtp() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!");

    const email = "test@example.com";
    const otp = "123456";

    console.log("Creating OTP record...");
    const record = await Otp.create({ email, otp });
    console.log("OTP Record created:", record);

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in database:", collections.map(c => c.name));

    // Clean up
    await Otp.deleteOne({ _id: record._id });
    console.log("Cleaned up test record.");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testOtp();

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function checkDb() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections in database:", collections.map(c => c.name));

    // Check Users
    const users = await db.collection("users").countDocuments();
    const userSingular = await db.collection("user").countDocuments();
    console.log(`Documents in 'users': ${users}`);
    console.log(`Documents in 'user': ${userSingular}`);

    process.exit(0);
  } catch (err) {
    console.error("Error connecting:", err);
    process.exit(1);
  }
}

checkDb();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");
const Task = require("./models/Task");


const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   MONGODB CONNECTION
========================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB Error:", err);
    process.exit(1);
  });

/* =========================
   AUTH APIs
========================= */

/* SIGNUP */
app.post("/signup", async (req, res) => {
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
});

/* LOGIN */
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.json({ success: false });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false });

    res.json({
      success: true,
      userId: user._id
    });
  } catch (error) {
    res.json({ success: false });
  }
});

/* =========================
   TASK APIs (USER-WISE)
========================= */

/* ADD TASK */
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, task_date, userId } = req.body;

    if (!title || !userId) {
      return res.status(400).json({ error: "Title and userId required" });
    }

    const task = await Task.create({
      title,
      description,
      task_date,
      userId
    });

    res.json({ message: "Task added", taskId: task._id });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* GET TASKS */
app.get("/tasks/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json(error);
  }
});

/* UPDATE STATUS */
app.put("/tasks/:id", async (req, res) => {
  try {
    const { status } = req.body;

    await Task.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* DELETE TASK */
app.delete("/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
});

/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

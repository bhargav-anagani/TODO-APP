const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   DATABASE CONNECTION
========================= */
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bhargav@123',
  database: 'todo_app'
});

db.connect(err => {
  if (err) {
    console.error('DB Error:', err);
    return;
  }
  console.log('MySQL Connected');
});

/* =========================
   AUTH APIs
========================= */

/* SIGNUP */
app.post('/signup', async (req, res) => {
  const { name, username, email, password } = req.body;

  if (!name || !username || !email || !password) {
    return res.json({ success: false, message: "All fields required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = `
    INSERT INTO users (name, username, email, password)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, username, email, hashedPassword], err => {
    if (err) {
      return res.json({ success: false, message: "User already exists" });
    }
    res.json({ success: true });
  });
});

/* LOGIN */
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';

  db.query(sql, [username], async (err, result) => {
    if (err || result.length === 0) {
      return res.json({ success: false });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      userId: user.id
    });
  });
});

/* =========================
   TASK APIs (USER-WISE)
========================= */

/* ADD TASK */
app.post('/tasks', (req, res) => {
  const { title, description, task_date, userId } = req.body;

  if (!title || !userId) {
    return res.status(400).json({ error: 'Title and userId required' });
  }

  const sql = `
    INSERT INTO tasks (user_id, title, description, task_date, status)
    VALUES (?, ?, ?, ?, 'pending')
  `;

  db.query(sql, [userId, title, description || '', task_date || null], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Task added', taskId: result.insertId });
  });
});

/* GET TASKS */
app.get('/tasks/:userId', (req, res) => {
  const { userId } = req.params;

  const sql = 'SELECT * FROM tasks WHERE user_id = ?';

  db.query(sql, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

/* UPDATE STATUS */
app.put('/tasks/:id', (req, res) => {
  const { status } = req.body;

  const sql = 'UPDATE tasks SET status = ? WHERE id = ?';

  db.query(sql, [status, req.params.id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Status updated' });
  });
});

/* DELETE TASK */
app.delete('/tasks/:id', (req, res) => {
  const sql = 'DELETE FROM tasks WHERE id = ?';

  db.query(sql, [req.params.id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Task deleted' });
  });
});

/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

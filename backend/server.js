const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

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

/* ADD TASK */
app.post('/tasks', (req, res) => {
  const { title, description, task_date } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Default user_id = 1 for now
  const sql = 'INSERT INTO tasks (user_id, title, description, task_date, status) VALUES (1, ?, ?, ?, "pending")';
  db.query(sql, [title, description || '', task_date || null], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Task added', taskId: result.insertId });
  });
});

/* GET TASKS */
app.get('/tasks', (req, res) => {
  db.query('SELECT * FROM tasks WHERE user_id = 1', (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

/* UPDATE STATUS */
app.put('/tasks/:id', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE tasks SET status=? WHERE id=?', [status, req.params.id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Status updated' });
  });
});

/* DELETE TASK */
app.delete('/tasks/:id', (req, res) => {
  db.query('DELETE FROM tasks WHERE id=?', [req.params.id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Task deleted' });
  });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

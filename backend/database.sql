CREATE DATABASE IF NOT EXISTS todo_app;
USE todo_app;

-- =========================
-- USERS TABLE (for login)
-- =========================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TASKS TABLE (user-wise)
-- =========================
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_date DATE,
    status ENUM('pending','completed') DEFAULT 'pending',

    CONSTRAINT fk_user_tasks
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE
);

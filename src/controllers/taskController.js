const { pool } = require("../db/database");

async function getAllTasks(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTaskById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createTask(req, res) {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const result = await pool.query(
      "INSERT INTO tasks (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
      [req.user.id, title, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        completed = COALESCE($3, completed)
       WHERE id = $4 AND user_id = $5`,
      [title, description, completed, id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteTask(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };

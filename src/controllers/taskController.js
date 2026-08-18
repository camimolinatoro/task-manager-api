const db = require("../db/database");

function getAllTasks(req, res) {
  db.all("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
}

function getTaskById(req, res) {
  const { id } = req.params;
  db.get("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Task not found" });
    res.json(row);
  });
}

function createTask(req, res) {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  db.run(
    "INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)",
    [req.user.id, title, description || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, description, completed: 0 });
    }
  );
}

function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  db.run(
    "UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), completed = COALESCE(?, completed) WHERE id = ? AND user_id = ?",
    [title, description, completed, id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
      res.json({ message: "Task updated" });
    }
  );
}

function deleteTask(req, res) {
  const { id } = req.params;
  db.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task deleted" });
  });
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };

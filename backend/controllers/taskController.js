const Task = require("../models/Task");

/* ADD TASK */
exports.createTask = async (req, res) => {
  try {
    const { title, description, task_date } = req.body;

    // Use req.userId safely extracted from JWT by authMiddleware
    if (!title || !req.userId) {
      return res.status(400).json({ error: "Title and userId required" });
    }

    const task = await Task.create({
      title,
      description,
      task_date,
      userId: req.userId 
    });

    res.json({ message: "Task added", taskId: task._id });
  } catch (error) {
    res.status(500).json(error);
  }
};

/* GET TASKS */
exports.getTasks = async (req, res) => {
  try {
    // Only return tasks belonging to authenticated user
    const tasks = await Task.find({ userId: req.userId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json(error);
  }
};

/* UPDATE STATUS */
exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body;
    
    // First, verify the task actually belongs to this user before updating
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
        return res.status(403).json({ error: "Not authorized to update this task" });
    }

    await Task.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Status updated" });
  } catch (error) {
    res.status(500).json(error);
  }
};

/* DELETE TASK */
exports.deleteTask = async (req, res) => {
  try {
    // First, verify the task actually belongs to this user before deleting
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) {
        return res.status(403).json({ error: "Not authorized to delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json(error);
  }
};

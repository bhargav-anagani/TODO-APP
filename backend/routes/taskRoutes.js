const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth middleware to all task routes
router.use(authMiddleware);

router.post("/", taskController.createTask);
router.get("/", taskController.getTasks); // Note: /tasks/:userId is now /tasks
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;

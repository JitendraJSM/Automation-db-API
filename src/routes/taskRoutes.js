const express = require('express');
const taskController = require('../controllers/taskController');
const router = express.Router();

router
  .route('/')
  .get(taskController.getAllTasks)
  .post(taskController.createTask);

router
  .route('/:id')
  .get(taskController.getTask)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

router.post('/auto-assign', taskController.autoAssignTasks);
router.get('/distribution', taskController.getTaskDistribution);
router.patch('/:id/complete', taskController.completeTask);
router.patch('/:id/fail', taskController.failTask);

module.exports = router;
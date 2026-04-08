import express from 'express';
import { getTasks, createTask, getTask, updateTask, deleteTask, getAllTasksAdmin } from '../controllers/taskController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getTasks);

router.post('/', protect, createTask);

router.get('/admin/all', protect, authorizeRoles('admin'), getAllTasksAdmin);

router.get('/:id', protect, getTask);

router.put('/:id', protect, updateTask);

router.delete('/:id', protect, deleteTask);


export default router;
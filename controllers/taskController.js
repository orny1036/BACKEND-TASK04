import db from '../config/db.js';
import { getAllTasksQueryResult, getUserTaskQueryResult, createUserTaskQuery, updateUserTaskQuery, deleteUserTaskQuery } from '../models/taskModel.js';
import { validateTask, validateTaskId } from '../utils/validate.js';

// @desc --> Get all tasks
// @route --> GET /tasks
export const getTasks = async (req, res) => {

    const { status } = req.query;

    try {

        const results = await getAllTasksQueryResult(req.user.id, req.user.role, status)

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
};

// @desc --> Get single tasks
// @route --> GET: /api/tasks/:id
export const getTask = async (req, res) => {

    try {
        const id = parseInt(req.params.id);

        validateTaskId(id);

        const result = await getUserTaskQueryResult(req.user.id, id, req.user.role);
        
        if (result.length === 0) {
            throw new Error('Task not found');
        }

        res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
};

// @desc --> Create task
// @route --> CREATE: /api/tasks
export const createTask = async (req, res) => {

    try {
        const { title, description, status } = req.body;
        
        validateTask (req.body);
        
        const result = await createUserTaskQuery(req.user.id, title, description, status)

        res.status(201).json({
            success: true,
            message: 'Task Created',
            data: {
                id: result.insertId,
                title: title.trim(),
                description: description || null,
                status: status || 'to-do',
                user_id: req.user.id
            }
        });

    } catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc --> Update task
// @route --> UPDATE: /api/tasks/:id
export const updateTask = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        validateTaskId(id);
        
        const { title, description, status } = req.body;
        
        const updatedResult = await updateUserTaskQuery(req.user.id, id, req.user.role, title, description, status)

        res.status(200).json({
            success: true,
            message: 'Task Updated',
            data: updatedResult[0]
        });

    }
    catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
};

// @desc --> Delete task
// @route --> DELETE: /api/tasks/:id
export const deleteTask = async (req, res) => {

    try {

        const id = parseInt(req.params.id);

        validateTaskId(id);

        await deleteUserTaskQuery(req.user.id, req.user.role, id);

        res.status(200).json({
            success: true,
            message: 'Task moved to trash'
        });

    } catch (error) {
        const status = error.statusCode || 500;
        res.status(status).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
};
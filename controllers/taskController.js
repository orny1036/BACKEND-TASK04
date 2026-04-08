import db from '../config/db.js';

// @desc --> Get all tasks
// @route --> GET /tasks
export const getTasks = async (req, res) => {

    const { status } = req.query;

    try {
        let query = 'SELECT * FROM tasks WHERE isDeleted = 0';
        let values = [];

        if (req.user.role !== "admin") {
            query += " AND user_id = ?";
            values.push(req.user.id);
        }

        if (status) {

                query += " AND status = ?"
                values.push(status);
        }

        const [results] = await db.execute(query, values);

        res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks',
            error: error.message
        });
    }
};

// @desc --> Get single tasks
// @route --> GET: /api/tasks/:id
export const getTask = async (req, res) => {

    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Task ID'
            });
        }
        let query = 'SELECT * FROM tasks WHERE id = ? AND isDeleted = 0';
        let values = [id];

        if (req.user.role !== "admin") {
            query += " AND user_id = ?";
            values.push(req.user.id);
        }
        const [result] = await db.execute(query, values);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: result[0]
        });

    } catch (error) {
        return res.status(500).json({
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

        if (!title || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const validStatus = ['to-do', 'in-progress', 'completed'];
        const taskStatus = status || 'to-do';

        if (!validStatus.includes(taskStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const query = `INSERT INTO tasks
                    (title, description, status, user_id)
                    VALUES(?, ?, ?, ?)
                    `;
        const values = [
            title.trim(),
            description || null,
            taskStatus,
            req.user.id
        ];

        const [result] = await db.execute(query, values);

        res.status(201).json({
            success: true,
            message: 'Task Created',
            data: {
                id: result.insertId,
                title: title.trim(),
                description: description || null,
                status: taskStatus,
                user_id: req.user.id
            }
        });

    } catch (error) {
        return res.status(500).json({
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
        const { title, description, status } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Task ID'
            });
        }

        let query = 'SELECT * FROM tasks WHERE id = ? AND isDeleted = 0';
        let params = [id];

        if (req.user.role !== "admin") {
            query += " AND user_id = ?";
            params.push(req.user.id);
        }

        const [result] = await db.execute(query, params);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (!title && !description && !status) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required to update'
            });
        }

        const validStatus = ['to-do', 'in-progress', 'completed'];

        if (status && !validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        let fields = [];
        let values = [];

        if (title) {
            fields.push('title = ?');
            values.push(title.trim());
        }

        if (description) {
            fields.push('description = ?');
            values.push(description);
        }

        if (status) {
            fields.push('status = ?');
            values.push(status);
        }

        if (req.user.role === "admin") {
            query = `UPDATE tasks 
        SET ${fields.join(', ')}
        WHERE id = ?`;

        values.push(id);
        } else {
            query = `UPDATE tasks 
        SET ${fields.join(', ')}
        WHERE id = ? AND user_id = ?`;

            values.push(id, req.user.id);
        }


        await db.execute(query, values);

        // Return updates task
        let updatedQuery = "SELECT * FROM tasks WHERE id = ? AND isDeleted = 0";
        let updatedValues = [id];

        if (req.user.role !== "admin") {
            updatedQuery += " AND user_id = ?";
            updatedValues.push(req.user.id);
        }
        const [updatedResult] = await db.execute(updatedQuery, updatedValues);

        res.status(200).json({
            success: true,
            message: 'Task Updated',
            data: updatedResult[0]
        });

    }
    catch (error) {
        res.status(500).json({
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

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        let query = 'SELECT * FROM tasks WHERE id = ? AND isDeleted = 0';
        let values = [id];

        if (req.user.role !== "admin") {
            query += " AND user_id = ?";
            values.push(req.user.id);
        }

        const [result] = await db.execute(query, values);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (req.user.role === "admin") {
            query = `UPDATE tasks 
    SET isDeleted = 1
    WHERE id = ?`;

            await db.execute(query, [id]);
        } else {
            query = `UPDATE tasks 
    SET isDeleted = 1
    WHERE id = ? AND user_id = ?`;

            await db.execute(query, [id, req.user.id]);
        }

        res.status(200).json({
            success: true,
            message: 'Task moved to trash'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
};
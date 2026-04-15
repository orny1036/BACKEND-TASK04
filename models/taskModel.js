
import db from '../config/db.js';

export const getAllTasksQueryResult = async (userId, userRole, Userstatus) => {

    let query = 'SELECT * FROM tasks WHERE isDeleted = 0';
    let values = [];
    if (userRole !== "admin") {
        query += " AND user_id = ?";
        values.push(userId);
    }

    if (Userstatus) {

        query += " AND status = ?"
        values.push(Userstatus);
    }

    const [results] = await db.execute(query, values);
    return results;
}

export const getUserTaskQueryResult = async (userId, taskId, userRole) => {
    
    if (isNaN(taskId)) {
        throw new Error('Invalid Task ID');
    }
    let query = 'SELECT * FROM tasks WHERE id = ? AND isDeleted = 0';
    let values = [taskId];

    if (userRole !== "admin") {
        query += " AND user_id = ?";
        values.push(userId);
    }
    const [result] = await db.execute(query, values);
    return result;
}

export const CreateUserTaskQuery = async (userId, title, description, status) => {
   
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
        userId
    ];

    const [result] = await db.execute(query, values);
    return result;
}

export const UpdateUserTaskQuery = async (userId, taskId, userRole, title, description, status) => {

    if (isNaN(taskId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid Task ID'
        });
    }

    let query = 'SELECT * FROM tasks WHERE id = ? AND isDeleted = 0';
    let params = [taskId];

    if (userRole !== "admin") {
        query += " AND user_id = ?";
        params.push(userId);
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

    if (userRole === "admin") {
        query = `UPDATE tasks 
        SET ${fields.join(', ')}
        WHERE id = ?`;

        values.push(taskId);
    } else {
        query = `UPDATE tasks 
        SET ${fields.join(', ')}
        WHERE id = ? AND user_id = ?`;

        values.push(taskId, userId);
    }

    await db.execute(query, values);

    // Return updates task
    let updatedQuery = "SELECT * FROM tasks WHERE id = ? AND isDeleted = 0";
    let updatedValues = [taskId];

    if (userRole !== "admin") {
        updatedQuery += " AND user_id = ?";
        updatedValues.push(userId);
    }
    const [updatedResult] = await db.execute(updatedQuery, updatedValues);
   
    return updatedResult;
}

export const DeleteUserTaskQuery = async (userId, userRole, taskId) => {

        if (isNaN(taskId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid task ID'
            });
        }

        let query = 'SELECT * FROM tasks WHERE id = ? AND isDeleted = 0';
        let values = [taskId];

        if (userRole !== "admin") {
            query += " AND user_id = ?";
            values.push(userId);
        }

        const [result] = await db.execute(query, values);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        if (userRole === "admin") {
            query = `UPDATE tasks 
                     SET isDeleted = 1
                     WHERE id = ?`;

            await db.execute(query, [taskId]);
        } else {
            query = `UPDATE tasks 
                     SET isDeleted = 1
                     WHERE id = ? AND user_id = ?`;

            await db.execute(query, [taskId, userId]);
        }
}
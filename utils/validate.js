import validator from "validator";

export const validateRegister = ( {username, email, password} ) => {
    if (username.length < 3) {
        const err = Error('Username must be at least 3 characters');
        err.statusCode = 400;
        throw err;
    }

    if (!validator.isEmail(email)) {
        const err = Error('Invalid email format');
        err.statusCode = 400;
        throw err;
    }

    if (password.length < 6) {
        const err = Error('Password must be at least 6 characters');
        err.statusCode = 400;
        throw err;
    }

};

export const validateLogin = ( {email, password} ) => {
    
    if (!validator.isEmail(email)) {
        const err = Error('Invalid email format');
        err.statusCode = 400;
        throw err;

    }
    if( password.length < 6) {
        const err = Error('Invalid password input format');
        err.statusCode = 400;
        throw err;
    }

}

export const validateTask = ( {title, description, status} ) => {
 
    if (!title || title.trim() === '') {
        const err = Error ('Title is required');
        err.statusCode = 400;
        throw err;
    }
    const validStatus = ['to-do', 'in-progress', 'completed'];
    const taskStatus = status || 'to-do';

    if (!validStatus.includes(taskStatus)) {
        const err = Error('Invalid status value');
        err.statusCode = 400;
        throw err;
    }
    
    if (description && typeof description !== 'string') {
        const err = Error('Description must be a String');
        err.statusCode = 400;
        throw err;
    }
}
export const validateTaskId = (taskId) => {
    if (isNaN(taskId)) {
        const err = new Error('Invalid Task ID');
        err.statusCode = 400;
        throw err;
    }
}
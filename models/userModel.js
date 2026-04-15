import db from '../config/db.js';

export const registerUserQuery = async (username, email, password, hashedPassword, role) => {

    if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
    }

    // 2. Insert into DB
    const query = `
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `;

    const [result] = await db.execute(query, [username, email, hashedPassword, role]);
    return result;
}

export const loginUserQuery = async (email, password) => {

    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const query = "SELECT id, email, password, role FROM users WHERE email = ?";

    const [result] = await db.execute(query, [email]);

    if (result.length === 0) {
        throw new Error('Invalid credentials');
    }
    return result[0];
}
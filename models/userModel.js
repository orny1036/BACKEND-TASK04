import db from '../config/db.js';

export const registerUserQuery = async (username, email, hashedPassword, role) => {
    // 2. Insert into DB
    const query = `
            INSERT INTO users (username, email, password, role)
            VALUES (?, ?, ?, ?)
        `;

    const [result] = await db.execute(query, [username, email, hashedPassword, role]);
    return result;
}

export const loginUserQuery = async (email, password) => {


    const query = "SELECT id, email, password, role FROM users WHERE email = ?";

    const [result] = await db.execute(query, [email]);

    if (result.length === 0) {
        throw new Error('Invalid credentials');
    }
    return result[0];
}
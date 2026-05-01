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

export const loginUserQuery = async (email) => {


    const query = "SELECT id, email, password, role FROM users WHERE email = ?";

    const [result] = await db.execute(query, [email]);

    if (result.length === 0) {
        throw new Error('Invalid credentials');
    }
    return result[0];
}

export const storeRefreshToken = async (userId, token, expiresAt) => {
    await db.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
    );
}

export const getRefreshToken = async (refreshToken) => {

    const [ rows ] = await db.execute(
        'SELECT * FROM refresh_tokens WHERE token = ?',
        [refreshToken]
    );
    
    return rows[0];
}

export const deleteRefreshToken = async (refreshToken) => {
    await db.execute(
        'DELETE FROM refresh_tokens WHERE token = ?',
        [refreshToken]
    );
}
export const deleteRefreshTokenByUser = async(userId) => {

    await db.execute(
        'DELETE FROM refresh_tokens WHERE user_id = ?',
        [userId]  // comes from protect middleware
    );

}
export const findUserByEmail = async (email) => {
    const [ rows ] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    return rows[0];
}
export const saveResetToken = async (userId, token, expiresAt) => {
    await db.execute(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
    );
}
export const checkResetToken = async (resetToken) => {

    const [rows] = await db.execute(
        'SELECT * FROM  password_reset_tokens WHERE token = ?',
        [resetToken]
    );
    return rows[0];
}

export const deleteResetToken = async (resetToken) => {
    await db.execute(
        'DELETE FROM password_reset_tokens WHERE token = ?',
        [resetToken]
    );
}

export const resetPasswordQuery = async (userId, newPassword) => {
    await db.execute(
     'UPDATE users SET password = ? WHERE id = ?',
     [newPassword, userId]
    );
}
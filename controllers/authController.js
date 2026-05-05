import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import crypto from "crypto";
import transporter from "../config/mailer.js";

import { validateRegister, validateLogin } from "../utils/validate.js";
import {
    registerUserQuery, findExistingUser, loginUserQuery, storeRefreshToken, 
    getRefreshToken, deleteRefreshToken, deleteRefreshTokenByUser, 
    findUserByEmail, saveResetToken, checkResetToken, deleteResetToken, resetPasswordQuery } from "../models/userModel.js";

export const registerUser = async (req, res) => {

    const { username, email, password } = req.body;

    const role = 'user';

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Username, email, and password are required"
        });
    }

    try {

        validateRegister(req.body);
        await findExistingUser(username, email);
        // 1. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await registerUserQuery(username, email, hashedPassword, role);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: result.insertId,
                username,
                email
            }
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

export const loginUser = async (req, res) => {

    const { email, password } = req.body;

    try {

        validateLogin(req.body);

        const user = await loginUserQuery(email);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Create JWT access token (stateless, short)
        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        //Refresh token (random string, not a JWT)
        const refreshToken = crypto.randomBytes(64).toString('hex');

        //Save to DB with expiry
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        await storeRefreshToken(user.id, refreshToken, expiresAt);
        
        res.json({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }

};

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required.' })
    }

    try {

        const storedToken = await getRefreshToken(refreshToken);

        if (!storedToken) {
            return res.status(400).json({ success: false, message: 'Invalid refresh token.' });
        }

        if (new Date() > new Date(storedToken.expires_at)) {
            
           await deleteRefreshToken(refreshToken);

            return res.status(401).json({ success: false, message: 'Refresh token expired. Please login again.' });
        }
        const accessToken = jwt.sign(
            { id: storedToken.user_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        res.json({ success: true, accessToken });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const logoutUser = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required.' });
    }
    try {

       await deleteRefreshToken(refreshToken);

        res.json({ success: true, message: 'Logged out successfully' });

    } catch (error) {

        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const logoutAllDevices = async (req, res) => {
    try {
       await deleteRefreshTokenByUser(req.user.id);

        res.json({ success: true, message: 'Logged out from all devices' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {

        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    try {

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        
        const token = crypto.randomBytes(64).toString('hex');

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await saveResetToken(user.id, token, expiresAt);

        const resetLink = `http://localhost:5000/api/auth/reset-password?token=${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Expires in 10 minutes.</p>`
        });

        res.json({
            success: true,
            message: "Password reset link sent to your email.",
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }

};

export const resetPassword = async (req, res) => {

    const { resetToken, new_password } = req.body;

    if (!resetToken || !new_password) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    try {
        const storedToken = await checkResetToken(resetToken);
        if (!storedToken) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        if(new Date() > new Date(storedToken.expires_at)) {
            await deleteResetToken(resetToken);

            return res.status(401).json({ success: false, message: 'Reset token expired. Please login again.' });
        }
        const hashedNewPassword = await bcrypt.hash(new_password, 10);

        await resetPasswordQuery(storedToken.user_id, hashedNewPassword);
        
        await deleteResetToken(resetToken);
        res.json({ success: true, message: 'Password reset successful.' });

    } catch(error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validateRegister, validateLogin } from "../utils/validate.js";
import { registerUserQuery, loginUserQuery } from "../models/userModel.js";


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

        // 1. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await registerUserQuery (username, email, hashedPassword, role);
        
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
      
        if(error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
             success: false,
             message: "Email or username already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export const loginUser = async (req, res) => {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

    try {
        
        validateLogin(req.body);

        const user = await loginUserQuery (email, password);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Create JWT access token (stateless, short)
        const accesToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        
        //Refresh token (random string, not a JWT)
        const refreshToken = crypto.randomBytes(64).toString('hex');
        
        //Save to DB with expiry
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.execute(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', 
            [user.id, refreshToken, expiresAt]
        );
            res.json({
                success: true,
                message: "Login successful",
                accesToken,
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

    if(!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required.' })
    }

    try {

        const [ rows ] = await db.execute (
            'SELECT * FROM refresh_tokens WHERE token = ?'
            [refreshToken]
        );
        if(rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token.' })
        }

        const storedToken = rows[0];

        if(new Date() > new Date(storedToken.expires_at)) {
            await db.execute(
                'DELETE FROM refresh_tokens WHERE token = ?',
                [refreshToken]
            );
            return res.status(401).json({ success: false, message: 'Refresh token expired. Please login again.' })
        }
        const accessToken = jwt.sign(
            { id: storedToken.user_id },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES_IN}
        );
        res.json({ success:true, accessToken });

    } catch (error) {
      res.status(500).json({ success:false, message: 'Server error' });
    }
};

export const logoutUser = async (req, res) {
    const { refreshToken } = req.body;

    if(!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token required.' });
    }
    try {
        await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
        res.json({ success: false, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const logoutAllDevices = async (req, res) => {
    try {
        await db.execute(
            'DELETE FROM refresh_tokens WHERE user_id = ?',
            [req.user.id]  // comes from protect middleware
        );

        res.json({ success: true, message: 'Logged out from all devices' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
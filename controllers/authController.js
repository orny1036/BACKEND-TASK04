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

     validateLogin (req.body);

    try {

        const user = await loginUserQuery (email, password);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Create JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

            res.json({
                success: true,
                message: "Login successful",
                token
            });
        
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }

};
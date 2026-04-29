import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/refresh', refreshAccessToken);

// protect middleware is there so only authenticated users can hit this endpoint.
router.post('/logout', protect, logoutUser);

export default router;
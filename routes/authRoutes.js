import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { registerUser, loginUser, refreshAccessToken, logoutUser, logoutAllDevices } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/refresh', refreshAccessToken);

// protect middleware is there so only authenticated users can hit this endpoint.
router.post('/logout', protect, logoutUser);

router.post('/logout-all', protect, logoutAllDevices);

router.post('/forgot-password', )
export default router;
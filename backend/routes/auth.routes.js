const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/admin-login', authController.loginAdmin);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;

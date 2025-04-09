const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const {
    register,
    login,
    logout,
    updateUserPublicKey,
    getCurrentUser
} = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/update-public-key', verifyToken, updateUserPublicKey);
router.get('/me', verifyToken, getCurrentUser); // This route is used to check if the user is authenticated


module.exports = router;

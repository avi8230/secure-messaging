const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { register, login, logout, updateUserPublicKey } = require('../controllers/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/update-public-key', verifyToken, updateUserPublicKey);

module.exports = router;

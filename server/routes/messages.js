const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { saveMessage, getMessages } = require('../controllers/messages');

const router = express.Router();

router.post('/', verifyToken, saveMessage);
router.get('/', verifyToken, getMessages);

module.exports = router;

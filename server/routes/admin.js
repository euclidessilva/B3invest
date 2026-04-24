const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { listUsers, updatePassword, deleteUser } = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

router.get('/users', listUsers);
router.patch('/users/:id/password', updatePassword);
router.delete('/users/:id', deleteUser);

module.exports = router;

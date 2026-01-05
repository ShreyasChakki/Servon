const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    getUserDetails,
    toggleUserBan,
    deleteUser,
    getRecentActivity
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// All routes require admin authentication
router.use(protect);
router.use(isAdmin);

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/ban', toggleUserBan);
router.delete('/users/:id', deleteUser);

module.exports = router;

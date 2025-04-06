const express = require('express');
const memberRoutes = require('./members');
const channelRoutes = require('./channels');
const postRoutes = require('./posts');
const taskRoutes = require('./tasks');
const analyticsRoutes = require('./analytics');

const router = express.Router();

// Mount routes
router.use('/members', memberRoutes);
router.use('/channels', channelRoutes);
router.use('/posts', postRoutes);
router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
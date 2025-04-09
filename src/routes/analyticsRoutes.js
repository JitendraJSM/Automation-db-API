const express = require("express");
const analyticsController = require("../controllers/analyticsController.js");
const router = express.Router();

// Member performance analytics
router.get("/member/:id/performance", analyticsController.getMemberPerformance);

// Channel growth analytics
router.get("/channel/:id/growth", analyticsController.getChannelGrowth);

// Posts engagement analytics
router.get("/posts/engagement", analyticsController.getPostsEngagement);

// Tasks distribution analytics
router.get("/tasks/distribution", analyticsController.getTasksDistribution);

module.exports = router;

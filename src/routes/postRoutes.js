const postController = require("../controllers/postController");

const express = require("express");
const router = express.Router();

router
  .route("/")
  .get(postController.getAllPosts)
  .post(postController.createPost);

router
  .route("/:id")
  .get(postController.getPost)
  .put(postController.updatePost)
  .delete(postController.deletePost);

/*
router.get('/:id/tasks', postController.getPostTasks);
router.get('/unengaged', postController.getUnengagedPosts);
router.get('/analytics/engagement', postController.getPostEngagementAnalytics);
router.patch('/:id/engagement', postController.updatePostEngagement);
*/

module.exports = router;

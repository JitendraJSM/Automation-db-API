const express = require('express');
const channelController = require('../controllers/channelController');
const router = express.Router();

router
  .route('/')
  .get(channelController.getAllChannels)
  .post(channelController.createChannel);

router
  .route('/:id')
  .get(channelController.getChannel)
  .put(channelController.updateChannel)
  .delete(channelController.deleteChannel);

router.get('/:id/posts', channelController.getChannelPosts);
router.get('/:id/stats', channelController.getChannelStats);

module.exports = router;
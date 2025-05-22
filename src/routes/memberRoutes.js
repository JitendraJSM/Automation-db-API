const memberController = require("../controllers/memberController.js");

const express = require("express");
const router = express.Router();

router.route("/").get(memberController.getAllMembers).post(memberController.createMember).delete(memberController.deleteAllMembers);

router.route("/:id").get(memberController.getMember).patch(memberController.updateMember).delete(memberController.deleteMember);

router.post("/:id/systemProfile", memberController.addSystemProfile);
router.patch("/:id/systemProfile", memberController.updateSystemProfile);
router.delete("/:id/systemProfile", memberController.deleteSystemProfile);

/*
router.get("/:id/tasks", memberController.getMemberTasks); // GET /api/members/:id/tasks - Get member's tasks
router.get("/:id/channel", memberController.getMemberChannel); // GET /api/members/:id/channel - Get member's channel
*/

module.exports = router;

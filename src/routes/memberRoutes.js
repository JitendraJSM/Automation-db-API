const express = require("express");
const memberController = require("../controllers/memberController.js");

const router = express.Router();

// GET /api/members - List all members with pagination
router.get("/", memberController.getAllMembers);      
router.get("/:id", memberController.getMember);       // GET /api/members/:id - Get member details
router.post("/", memberController.createMember);      // POST /api/members - Create new member
router.patch("/:id", memberController.updateMember);  // PATCH /api/members/:id - Update member
router.delete("/:id", memberController.deleteMember); // DELETE /api/members/:id - Delete member

// router.get("/:id/tasks", memberController.getMemberTasks); // GET /api/members/:id/tasks - Get member's tasks
// router.get("/:id/channel", memberController.getMemberChannel); // GET /api/members/:id/channel - Get member's channel

module.exports = router;
const express = require('express');
const Member = require('../models/member');
const router = express.Router();

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMongoId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

const validatePagination = (page, limit) => {
  page = parseInt(page);
  limit = parseInt(limit);
  return {
    isValid: (!page || page >= 1) && (!limit || (limit >= 1 && limit <= 100)),
    page: page || 1,
    limit: limit || 10
  };
};

// GET /api/members - List all members with pagination
router.get('/', async (req, res) => {
  try {
    const { page, limit, sort = '-createdAt' } = req.query;
    const pagination = validatePagination(page, limit);
    
    if (!pagination.isValid) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const { page: validPage, limit: validLimit } = pagination;

    const members = await Member.find()
      .select('-pwd')
      .sort(sort)
      .skip((validPage - 1) * validLimit)
      .limit(validLimit);

    const total = await Member.countDocuments();

    res.json({
      members,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/members/:id - Get member details
router.get('/:id', async (req, res) => {
  try {
    if (!validateMongoId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid member ID format' });
    }

    const member = await Member.findById(req.params.id)
      .select('-pwd')
      .populate('tasks')
      .populate('youtubeChannelId');

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/members - Create new member
router.post('/', async (req, res) => {
  try {
    const { gmail, pwd, recoveryMail, systemProfiles } = req.body;
    
    // Validate required fields
    if (!gmail || !validateEmail(gmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (!pwd || pwd.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Validate optional fields
    if (recoveryMail && !validateEmail(recoveryMail)) {
      return res.status(400).json({ error: 'Invalid recovery email format' });
    }
    
    if (systemProfiles && !Array.isArray(systemProfiles)) {
      return res.status(400).json({ error: 'System profiles must be an array' });
    }
    
    if (systemProfiles) {
      const invalidProfile = systemProfiles.some(profile => 
        typeof profile.systemName !== 'string' ||
        typeof profile.profileNumber !== 'string'
      );
      
      if (invalidProfile) {
        return res.status(400).json({ error: 'Invalid system profile format' });
      }
    }

    const existingMember = await Member.findOne({ gmail: req.body.gmail });
    if (existingMember) {
      return res.status(409).json({ error: 'Gmail already registered' });
    }

    const member = new Member(req.body);
    await member.save();

    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/members/:id - Update member
router.put('/:id', [
  param('id').isMongoId(),
  body('pwd').optional().isLength({ min: 6 }),
  body('recoveryMail').optional().isEmail().normalizeEmail(),
  body('systemProfiles').optional().isArray(),
  body('systemProfiles.*.systemName').optional().isString(),
  body('systemProfiles.*.profileNumber').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-pwd');

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/members/:id - Delete member
router.delete('/:id', [
  param('id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // TODO: Implement cascading deletion of tasks

    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
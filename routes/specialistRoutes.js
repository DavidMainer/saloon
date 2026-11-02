const express = require('express');
const router = express.Router();
const specialistController = require('../controllers/specialistController');
const requireAuth = require('../middleware/auth');

router.get('/', specialistController.getAllSpecialists);
router.patch('/:id/status', requireAuth, specialistController.updateStatus);

module.exports = router;
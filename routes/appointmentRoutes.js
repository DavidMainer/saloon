const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const requireAuth = require('../middleware/auth');

router.post('/', appointmentController.createAppointment);
router.get('/', requireAuth, appointmentController.getAppointments);
router.patch('/:id/status', requireAuth, appointmentController.updateStatus);

module.exports = router;
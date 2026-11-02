const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const requireAuth = require('../middleware/auth');

router.get('/', serviceController.getAllServices);
router.post('/', requireAuth, serviceController.createService);
router.put('/:id', requireAuth, serviceController.updateService);

module.exports = router;
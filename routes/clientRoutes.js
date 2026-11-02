const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, clientController.getClients);
router.get('/:id', requireAuth, clientController.getClientById);
router.patch('/:id', requireAuth, clientController.updateClient);

module.exports = router;

const router = require('express').Router();
const facebookController = require('../controller/facebook.controller');

router.post('/webhook', facebookController.webhookVerification());

module.exports = router;
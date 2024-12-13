const express = require('express');
const { WebhookHandler } = require('../../controllers/v1/webHooksController');
const router = express.Router();

// Stripe requires raw body parsing for webhook requests
const bodyParser = require('body-parser');
router.post(
    '/',
    bodyParser.raw({ type: 'application/json' }), // Use raw parser
    WebhookHandler
);

module.exports = router;

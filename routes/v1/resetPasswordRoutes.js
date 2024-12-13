const express = require('express');
const { requestPasswordResetHandler, resetPasswordHandler } = require('../../controllers/v1/resetPsswodController');

const router = express.Router();

// Request password reset
router.post('/request-reset', requestPasswordResetHandler);

// Reset password
router.post('/reset-password/:token', resetPasswordHandler);

module.exports = router;

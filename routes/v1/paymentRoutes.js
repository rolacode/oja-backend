const express = require('express');
const {
    createPayment,
    // createCheckoutHandler, 
    } = require('../../controllers/v1/paymentController');
const router = express.Router();

router.post('/', createPayment); // Endpoint: /payments
// router.post('/checkout', createCheckoutHandler); //Endpoint: /checkout

module.exports = router;

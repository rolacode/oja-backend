const express = require('express');
const { 
  registerBuyerHandler,
  findNearbyVendorsHandler,
  updateBuyerHandler,
  loginBuyerHandler,
  searchVendors1Handler,
  getVendorsLocationHandler,
  createBuyerDisputeHandler,
  createOrderHandler,
  updateOrderHandler,
  deleteOrderHandler,
  verifyEmailHandler,
  sendVerificationEmail,
} = require('../../controllers/v1/buyerController');

const router = express.Router();

router.post('', registerBuyerHandler);
router.get('/maxDist', findNearbyVendorsHandler);
router.put('/:id', updateBuyerHandler);
router.post('/login', loginBuyerHandler);
router.get('/vendor1/location', searchVendors1Handler);
router.get('/:id', getVendorsLocationHandler);
router.post('/dispute', createBuyerDisputeHandler);
router.post('/order', createOrderHandler);
router.put('/:id', updateOrderHandler);
router.delete('/:id', deleteOrderHandler);
router.get('/verify', verifyEmailHandler);
router.post('/sendVerifyMail', sendVerificationEmail);

module.exports = router;
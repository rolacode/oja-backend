const express = require('express');
const { 
  registerBuyerHandler,
  findNearbyVendorsHandler,
  updateBuyerHandler,
  loginBuyerHandler,
  searchVendors1Handler,
  getVendorsLocationHandler,
  createBuyerDisputeHandler,
} = require('../../controllers/v1/buyerController');
const validateToken = require('../../middleware/auth');

const router = express.Router();

router.post('', registerBuyerHandler);
router.get('/maxDist', findNearbyVendorsHandler);
router.put('/:id', validateToken, updateBuyerHandler);
router.post('/login', loginBuyerHandler);
router.get('/vendor1/location', searchVendors1Handler);
router.get('/:id', getVendorsLocationHandler);
router.post('/dispute', createBuyerDisputeHandler);

module.exports = router;
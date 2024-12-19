const express = require('express');
const {
  createAdminHandler,
  getVendorHandler,
  getVendorsHandler,
  updateVendorHandler,
  updateAdminHandler,
  loginAdminHandler,
  deleteVendorHandler,
  getNearbyLocations,
  updateVendorListingsHandler,
  updateBuyerStatusHandler,
  buyerTransactionsHandler,
  analyticBuyersHandler,
  analyticVendorsHandler,
  vendorGrowthHandler,
  updateBuyersDisputeHandler,
  getAllBuyersHandler,
  getBuyerHandler,
  deleteBuyerHandler,
  createAdminNotificationHandler, 
} = require('../../controllers/v1/adminController');
const validateToken = require('../../middleware/auth');

const router = express.Router();

router.post('', createAdminHandler);
router.get('/:id', validateToken, getVendorHandler);
router.get('', validateToken, getVendorsHandler);
router.put('/:id', validateToken, updateVendorHandler);
router.patch('/:id', validateToken, updateAdminHandler);
router.post('/login', loginAdminHandler);
router.delete('/:id',validateToken, deleteVendorHandler);
router.get('/:id', getNearbyLocations);
router.put('/vendor-listings/:id/feature', updateVendorListingsHandler);
router.put('/:Id', validateToken, updateBuyerStatusHandler);
router.get('/transactions', validateToken, buyerTransactionsHandler);
router.get('/analytics', validateToken, analyticBuyersHandler);
router.get('/analytics/vendorId', validateToken, analyticVendorsHandler);
router.get('/user-growth', vendorGrowthHandler);
router.get('/buyers', validateToken, getAllBuyersHandler);
router.get('/buyer/:id', validateToken, getBuyerHandler);
router.delete('/buyer/:id', validateToken, deleteBuyerHandler);
router.put('/disputes/:disputeId',validateToken, updateBuyersDisputeHandler);
router.post('/notification', validateToken, createAdminNotificationHandler);

module.exports = router;

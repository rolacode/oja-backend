const express = require('express');
const { 
    createVendorHandler,
    getProductsByNameHandler,
    updateVendorHandler,
    loginVendorHandler,
    deleteProductHandler,
    createProductHandler,
    getAllProductsHandler,
    getSalesHandler,
    getEarningsHandler,
    getProductHandler,
    getOrdersHandler,
    getBuyerHandler, 
    analyticBuyersHandler,
} = require('../../controllers/v1/vendorController');
const authenticateVendor = require('../../middleware/auth1');

const router = express.Router();

router.post('', authenticateVendor, createProductHandler);
router.get('/search', getProductsByNameHandler);
router.get('/product', getAllProductsHandler)
router.get('/:id', authenticateVendor, getSalesHandler);
router.get('/earning', authenticateVendor, getEarningsHandler);
router.delete('/:id', authenticateVendor, deleteProductHandler);
router.get('/:productId',authenticateVendor, getProductHandler);
router.get('/:orderId',authenticateVendor, getOrdersHandler);
router.get('', authenticateVendor, getBuyerHandler);
//vendors operation
router.post('/reg', createVendorHandler);
router.put('/:id', updateVendorHandler);
router.post('/login', loginVendorHandler);
router.get('/analytics', authenticateVendor, analyticBuyersHandler);

module.exports = router;
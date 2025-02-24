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
    getOrderHandler,
    getBuyerHandler, 
    analyticBuyersHandler,
    getAllOrdersHandler
} = require('../../controllers/v1/vendorController');
const authenticateVendor = require('../../middleware/auth1');

const router = express.Router();

router.post('/createProduct', authenticateVendor, createProductHandler);
router.get('/search', getProductsByNameHandler);
router.get('/product', getAllProductsHandler)
router.get('/:id', authenticateVendor, getSalesHandler);
router.get('/earning', getEarningsHandler);
router.delete('/:id', authenticateVendor, deleteProductHandler);
router.get('/:productId',authenticateVendor, getProductHandler);
router.get('/:orderId',authenticateVendor, getOrderHandler);
router.get('', authenticateVendor, getBuyerHandler);
router.get('/order', authenticateVendor, getAllOrdersHandler);
//vendors operation
router.post('', createVendorHandler);
router.put('/:id', updateVendorHandler);
router.post('/login', loginVendorHandler);
router.get('/analytics', authenticateVendor, analyticBuyersHandler);

module.exports = router;
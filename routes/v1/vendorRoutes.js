const express = require('express');
const { 
    createVendorHandler,
    getProductsByNameHandler,
    updateVendorHandler,
    loginVendorHandler,
    deleteProductHandler,
    createProductHandler,
    getProductsHandler,
    getSalesHandler,
    getEarningsHandler,
    getProductHandler,
    getOrdersHandler,
    getBuyerHandler, 
    analyticBuyersHandler,
} = require('../../controllers/v1/vendorController');
const validateToken1 = require('../../middleware/auth1');

const router = express.Router();

router.post('', createProductHandler);
router.get('/search', getProductsByNameHandler);
router.get('/product/vendorId', validateToken1, getProductsHandler)
router.get('/:id', validateToken1, getSalesHandler);
router.get('', validateToken1, getEarningsHandler);
router.delete('/:id', validateToken1, deleteProductHandler);
router.get('/:vendorId',validateToken1, getProductHandler);
router.get('/:id',validateToken1, getOrdersHandler);
router.get('/:id',validateToken1, getBuyerHandler);
//vendors operation
router.post('/reg', createVendorHandler);
router.put('/:id', updateVendorHandler);
router.post('/login', loginVendorHandler);
router.get('/analytics', validateToken1, analyticBuyersHandler);

module.exports = router;
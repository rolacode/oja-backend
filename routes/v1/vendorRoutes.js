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
const upload = require('../../middleware/uploadMiddleware');
const authenticateVendor = require('../../middleware/auth1');

const router = express.Router();

// ✅ Serve uploads before other routes
router.use('/upload', express.static("uploads"));

// Product routes
router.post('/createProduct', upload.single("image"), authenticateVendor, createProductHandler);
router.get('/search', getProductsByNameHandler);
router.get('/product', getAllProductsHandler);

// Order routes
router.get('/order', authenticateVendor, getAllOrdersHandler);
router.get('/earning', getEarningsHandler);

// Vendors
router.post('', createVendorHandler);
router.post('/login', loginVendorHandler);
router.put('/:id', updateVendorHandler);
router.get('/analytics', authenticateVendor, analyticBuyersHandler);

// **Move Dynamic Routes to the Bottom**
router.get('/sales/:id', authenticateVendor, getSalesHandler);
router.get('/product/:productId', authenticateVendor, getProductHandler);
router.get('/order/:orderId', authenticateVendor, getOrderHandler);
router.get('/buyer', authenticateVendor, getBuyerHandler);
router.delete('/product/:id', authenticateVendor, deleteProductHandler);

module.exports = router;

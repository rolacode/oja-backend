const jwt = require('jsonwebtoken')
const Vendor1 = require('../models/Vendor1') // Adjust path based on your setup
const config = require('../config/config');

const authenticateVendor = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({
                message: 'Authorization header is required',
            })
        }

        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'Invalid Token',
            });
        }

        const payload = jwt.verify(token, config.jwtSecret);
        if (!payload) {
            return res.status(401).json({
                message: 'Invalid Token',
            });
        }

        const vendor = await Vendor1.findById(payload.id);
        if (!vendor) {
            return res.status(401).json({
                message: 'Error fetching vendor',
            });
        }

        req.vendor = vendor;
        next();
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = authenticateVendor

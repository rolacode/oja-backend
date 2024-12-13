const express = require('express');
const router = express.Router();
const {
    createLocationHandler,
    getAllLocationsHandler,
    findNearbyLocationsHandler,
    updateLocationHandler,
    deleteLocationHandler,
} = require('../../controllers/v1/locationController');

// Routes
router.post('', createLocationHandler); // Create
router.get('', getAllLocationsHandler); // Get All
router.get('/nearby', findNearbyLocationsHandler); // Get Nearby
router.put('/:id', updateLocationHandler); // Update
router.delete('/:id', deleteLocationHandler); // Delete

module.exports = router;

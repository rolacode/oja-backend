const Location = require('../../models/Location');

const createLocationHandler = async (req, res) => {
    try {
      const { name, coordinates, category, rating, priceRange } = req.body;
  
      const newLocation = new Location({
        name,
        coordinates: {
          type: 'Point',
          coordinates,
        },
        category,
        rating,
        priceRange,
      });
  
      await newLocation.save();
      return res.status(201).json({ message: 'Location created successfully', data: newLocation });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const getAllLocationsHandler = async (req, res) => {
    try {
      const locations = await Location.find();
      res.status(200).json({ data: locations });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const findNearbyLocationsHandler = async (req, res) => {
    try {
      const { lng, lat, maxDistance = 5000 } = req.query;
  
      if (!lng || !lat) {
        return res.status(400).json({ error: 'Longitude and latitude are required' });
      }
  
      const locations = await Location.find({
        coordinates: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(maxDistance),
          },
        },
      });
  
      res.status(200).json({ data: locations });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const updateLocationHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
  
      const updatedLocation = await Location.findByIdAndUpdate(id, updates, { new: true });
  
      if (!updatedLocation) {
        return res.status(404).json({ error: 'Location not found' });
      }
  
      res.status(200).json({ message: 'Location updated successfully', data: updatedLocation });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const deleteLocationHandler = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedLocation = await Location.findByIdAndDelete(id);
  
      if (!deletedLocation) {
        return res.status(404).json({ error: 'Location not found' });
      }
  
      res.status(200).json({ message: 'Location deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  

  module.exports = {
    createLocationHandler,
    getAllLocationsHandler,
    findNearbyLocationsHandler,
    updateLocationHandler,
    deleteLocationHandler,
  };
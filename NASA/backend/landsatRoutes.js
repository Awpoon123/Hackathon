const express = require('express');
const router = express.Router();
const { getLandsatData } = require('../controllers/landsatController');

// Route to get Landsat SR data
router.post('/getData', getLandsatData);

module.exports = router;
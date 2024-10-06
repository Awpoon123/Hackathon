const axios = require('axios');

const getLandsatData = async (req, res) => {
  const { lat, lng, date } = req.body;
  const apiKey = process.env.API_KEY_LANDSAT;

  try {
    const response = await axios.get(`https://api.example.com/landsat`, {
      params: {
        lat,
        lng,
        date,
        apiKey,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching Landsat data');
  }
};

module.exports = { getLandsatData };
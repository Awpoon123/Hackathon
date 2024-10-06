import axios from 'axios';

export const fetchLandsatData = async (lat, lng, date) => {
  try {
    const response = await axios.post('/api/landsat/getData', { lat, lng, date });
    return response.data;
  } catch (error) {
    console.error('Error fetching Landsat data:', error);
  }
};
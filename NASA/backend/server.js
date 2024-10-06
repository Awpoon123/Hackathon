const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const axios = require('axios');
const User = require('./models/User');  // Assuming you have a User model for storing users

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// DB Config
const db = process.env.MONGO_URI;
mongoose.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

// Routes
app.use('/api/landsat', require('./routes/landsatRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // Added authentication route

// Nodemailer setup for notifications
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Your email here
    pass: process.env.EMAIL_PASS,  // Your email password here
  },
});

// Cron job to check for satellite overpasses and send notifications to users
cron.schedule('0 0 * * *', async () => {  // Runs once a day at midnight
  try {
    console.log('Checking for Landsat overpasses...');
    
    // Fetch all users from the database
    const users = await User.find();

    // Loop through users and check for satellite overpasses
    for (const user of users) {
      const { lat, lng } = user.location;

      // Call your overpass API or calculate satellite positions
      const response = await axios.get(`https://api.example.com/landsat/predict-overpass`, {
        params: { lat, lng },
      });

      const overpassData = response.data;

      // Check if there is an upcoming overpass
      if (overpassData.pass) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Landsat Satellite Overpass Notification',
          text: `A Landsat satellite will pass over your location on ${overpassData.passDate}.`,
        };

        // Send notification email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
          } else {
            console.log('Email sent:', info.response);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error checking satellite overpass:', error);
  }
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
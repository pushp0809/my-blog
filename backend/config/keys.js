require('dotenv').config();

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
  PORT: process.env.PORT || 5002,
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
};
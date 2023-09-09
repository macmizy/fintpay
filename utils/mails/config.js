
const nodemailer = require('nodemailer');
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const dotenv = require('dotenv');

// Function to update an environment variable in the .env file
function updateEnvVariable(key, value) {
  // Load the existing .env file
  const env = dotenv.config();

  // Check if there was an error loading the .env file
  if (env.error) {
    throw env.error;
  }

  // Update the environment variable
  env.parsed[key] = value;

  // Serialize the updated environment variables
  const updatedEnv = Object.keys(env.parsed)
    .map((key) => `${key}=${env.parsed[key]}`)
    .join('\n');

  // Write the updated environment variables back to the .env file
  fs.writeFileSync('.env', updatedEnv);

    // Reload the environment variables
    dotenv.config();
}

// Create an OAuth2 client with client ID and client secret
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI

);  

oauth2Client.setCredentials({
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
  });

  oauth2Client.on('tokens', (tokens) => {
    if (tokens.access_token) {
      // Save the new access token or use it for API requests
        updateEnvVariable('ACCESS_TOKEN', tokens.access_token)
    }
    if (tokens.refresh_token) {
      // Save the new refresh token (optional)
      updateEnvVariable('REFRESH_TOKEN', tokens.refresh_token)
    }
  });
        




// Create a Nodemailer transporter with OAuth2
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL, // Replace with your Gmail email address
    pass: process.env.GMAIL_PASSWORD, // Replace with your Gmail email password
    clientId: process.env.CLIENT_ID,    // Replace with your OAuth2 client ID
    clientSecret: process.env.CLIENT_SECRET, // Replace with your OAuth2 client secret
    refreshToken: process.env.REFRESH_TOKEN, // Replace with your OAuth2 refresh token
    accessToken: process.env.ACCESS_TOKEN, 
  }
});

module.exports = transporter;
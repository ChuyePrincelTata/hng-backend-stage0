// Import required packages
const express = require('express'); // Web framework for creating server and routes
const axios = require('axios'); // Library for making HTTP requests to external APIs
const cors = require('cors'); // Allows cross-origin requests (browsers can access your API)

// Create an Express application instance
const app = express();

// Middleware: Functions that run before your route handlers
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Configuration - PORT from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// ==================== YOUR PROFILE DATA ====================
// TODO: Replace these with your actual information
const USER_PROFILE = {
  email: 'princelychuye@gmail.com',  // Replace with your email
  name: 'Chuye Princely Tata',       // Replace with your full name
  stack: 'Node.js/Express'           // Your backend stack
};

// ==================== MAIN ENDPOINT: GET /me ====================
app.get('/me', async (req, res) => {
  try {
    // Log the incoming request (helpful for debugging)
    console.log(`[${new Date().toISOString()}] GET /me endpoint hit`);
    
    // Step 1: Get current timestamp in ISO 8601 format (UTC)
    // new Date().toISOString() returns format: "2025-10-18T14:30:00.000Z"
    const timestamp = new Date().toISOString();
    
    // Step 2: Fetch a random cat fact from external API
    // We use axios.get() to make an HTTP GET request
    // The 'await' keyword waits for the API response before continuing
    // timeout: 5000 means wait max 5 seconds before giving up
    const catFactResponse = await axios.get('https://catfact.ninja/fact', {
      timeout: 5000 // 5 second timeout
    });
    
    // Extract the fact from the API response
    // The API returns: { "fact": "Some cat fact...", "length": 123 }
    // We only need the "fact" field
    const catFact = catFactResponse.data.fact;
    
    // Step 3: Build the response object following the exact schema
    const response = {
      status: 'success',
      user: {
        email: USER_PROFILE.email,
        name: USER_PROFILE.name,
        stack: USER_PROFILE.stack
      },
      timestamp: timestamp,
      fact: catFact
    };
    
    // Step 4: Send the response back to the client
    // res.json() automatically sets Content-Type to application/json
    // 200 is the HTTP status code for "OK/Success"
    return res.status(200).json(response);
    
  } catch (error) {
    // Error handling: If something goes wrong (API down, network error, etc.)
    console.error('Error in /me endpoint:', error.message);
    
    // Check if it was a timeout error
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        status: 'error',
        message: 'Cat Facts API timeout - please try again',
        timestamp: new Date().toISOString()
      });
    }
    
    // For other errors, return a fallback response with a default cat fact
    return res.status(200).json({
      status: 'success',
      user: {
        email: USER_PROFILE.email,
        name: USER_PROFILE.name,
        stack: USER_PROFILE.stack
      },
      timestamp: new Date().toISOString(),
      fact: 'Cats sleep 70% of their lives. (Fallback fact - external API unavailable)'
    });
  }
});

// ==================== HEALTH CHECK ENDPOINT ====================
// Simple endpoint to check if your server is running
app.get('/', (req, res) => {
  res.json({
    message: 'Backend Wizards Stage 0 API',
    endpoints: {
      profile: '/me'
    },
    status: 'running'
  });
});

// ==================== START THE SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
  // '0.0.0.0' makes the server accessible from any network interface
  // This is important for deployment
  console.log(`
  ╔════════════════════════════════════════╗
  ║  Server is running!                 ║
  ║  Port: ${PORT}                      ║
  ║  Local: http://localhost:${PORT}    ║
  ║  Endpoint: http://localhost:${PORT}/me ║
  ╚════════════════════════════════════════╝
  `);
});

// ==================== GRACEFUL SHUTDOWN ====================
// Handle CTRL+C to shut down gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});
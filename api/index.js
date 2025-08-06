// This is your Express.js serverless function.
// Vercel will automatically detect and deploy this file as an API endpoint.

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// --- In-memory Service Providers (for Hackathon MVP) ---
// In a real app, this would be a database (e.g., Supabase free tier)
const serviceProviders = [
  { id: 'p1', type: 'plumber', location: 'GA', contact: '08012345678' },
  { id: 't1', type: 'tailor', location: 'Sawmill', contact: '08098765432' },
  { id: 'e1', type: 'electrician', location: 'Tanke', contact: '07011223344' },
  { id: 'p2', type: 'plumber', location: 'Tanke', contact: '08055554444' },
  { id: 'c1', type: 'carpenter', location: 'Offa Road', contact: '08123456789' },
  { id: 'd1', type: 'driver', location: 'Sango', contact: '08033332222' },
  { id: 'w1', type: 'welder', location: 'Challenge', contact: '07066665555' },
  { id: 'g1', type: 'gardener', location: 'Adewole', contact: '09011110000' },
  // Add more dummy data for your demo to showcase variety!
];

// --- API Endpoint for Service Matching ---
app.post('/api/match-service', (req, res) => {
  const { message } = req.body;
  let responseMessage = "I'm sorry, I couldn't understand your request. Please try 'Need [service] in [location]' or 'Available: [service] in [location]'.";

  if (!message) {
    return res.status(400).json({ reply: "No message provided." });
  }

  const lowerMessage = message.toLowerCase();

  // Handle "Need" requests
  if (lowerMessage.includes('need')) {
    const parts = lowerMessage.split('need ');
    if (parts.length > 1) {
      const serviceQuery = parts[1].trim();
      let foundProviders = [];

      // Try to match both service type and location
      const serviceAndLocationMatch = serviceProviders.filter(
        p => serviceQuery.includes(p.type) && serviceQuery.includes(p.location.toLowerCase())
      );

      if (serviceAndLocationMatch.length > 0) {
        foundProviders = serviceAndLocationMatch;
      } else {
        // If no exact service+location match, try to match just the service type
        const serviceOnlyMatch = serviceProviders.filter(p => serviceQuery.includes(p.type));
        if (serviceOnlyMatch.length > 0) {
          foundProviders = serviceOnlyMatch;
          responseMessage = `No exact match for your location, but here are some ${serviceOnlyMatch[0].type}s:\n`;
        }
      }

      if (foundProviders.length > 0) {
        responseMessage = responseMessage.startsWith("No exact match") ? responseMessage : `Found ${foundProviders.length} matching service provider(s):\n`;
        foundProviders.forEach(p => {
          responseMessage += `- ${p.type.charAt(0).toUpperCase() + p.type.slice(1)} in ${p.location}: ${p.contact}\n`;
        });
      } else {
        responseMessage = `No ${serviceQuery.split(' ')[0] || 'service'} found. Try a different service or location.`;
      }
    }
  }
  // Handle "Available" requests (for adding new providers - for demo, just acknowledge)
  else if (lowerMessage.includes('available:')) {
    responseMessage = "Thank you for offering your service! We've noted your availability. We'll connect you with clients soon.";
    // For a real MVP, you'd parse the message and add to a persistent database here.
    // Example parsing (not saving for this MVP):
    // const providerInfo = lowerMessage.replace('available:', '').trim();
    // console.log('New provider info received:', providerInfo);
  }

  res.json({ reply: responseMessage });
});

// Export the app for Vercel serverless deployment
module.exports = app;

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}/api/match-service`);
});

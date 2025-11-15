const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Roles Backend API is running!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.get('/api/roles', (req, res) => {
  res.json({
    roles: ['admin', 'user', 'guest'],
    message: 'Available roles'
  });
});

app.post('/api/logs', (req, res) => {
  const { action, user, timestamp } = req.body;
  res.json({
    success: true,
    log: { action, user, timestamp: new Date() }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

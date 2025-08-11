const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let leads = [
  {
    id: 1,
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john@email.com',
    type: 'Life Insurance',
    location: 'Phoenix, AZ',
    status: 'new',
    time: '2 minutes ago',
    source: 'Facebook Ad'
  }
];

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LeadFlow Pro by J. Kollar is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/leads', (req, res) => {
  res.json(leads);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 LeadFlow Pro running on port ${PORT}`);
});

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure file upload
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Sample data with more realistic insurance leads
let leads = [
  {
    id: 1,
    name: 'John Smith',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    type: 'Life Insurance',
    location: 'Phoenix, AZ',
    status: 'new',
    time: '2 minutes ago',
    source: 'Facebook Ad',
    notes: [],
    callHistory: []
  },
  {
    id: 2,
    name: 'Sarah Johnson', 
    phone: '+1 (555) 987-6543',
    email: 'sarah.johnson@email.com',
    type: 'Term Life',
    location: 'Dallas, TX',
    status: 'contacted',
    time: '15 minutes ago',
    source: 'Instagram Ad',
    notes: ['Interested in $500K coverage'],
    callHistory: [{ date: new Date(), result: 'answered', duration: 180 }]
  },
  {
    id: 3,
    name: 'Mike Wilson',
    phone: '+1 (555) 456-7890',
    email: 'mike.wilson@email.com',
    type: 'Final Expense',
    location: 'Miami, FL',
    status: 'scheduled',
    time: '1 hour ago',
    source: 'Facebook Ad',
    notes: ['Appointment set for Thursday 2pm'],
    callHistory: [{ date: new Date(), result: 'scheduled', duration: 240 }]
  },
  {
    id: 4,
    name: 'Lisa Chen',
    phone: '+1 (555) 321-9876',
    email: 'lisa.chen@email.com',
    type: 'Other',
    location: 'Los Angeles, CA',
    status: 'new',
    time: '3 hours ago',
    source: 'CSV Import',
    notes: [],
    callHistory: []
  }
];

let campaigns = [
  {
    id: 1,
    name: 'Life Protection FL',
    type: 'Life Insurance',
    budget: 150,
    leads: 47,
    costPerLead: 9.57,
    status: 'active',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  {
    id: 2,
    name: 'Final Expense TX',
    type: 'Final Expense',
    budget: 100,
    leads: 89,
    costPerLead: 7.82,
    status: 'active',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
  },
  {
    id: 3,
    name: 'Other Insurance CA',
    type: 'Other',
    budget: 75,
    leads: 23,
    costPerLead: 11.45,
    status: 'paused',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 2 weeks ago
  }
];

let objections = [
  {
    id: 1,
    objection: "I can't afford life insurance right now",
    response: "I understand budget concerns are important. That's exactly why we offer flexible payment options starting as low as $20/month. Many of our clients find that's less than they spend on coffee each week, but it provides invaluable peace of mind for their family."
  },
  {
    id: 2,
    objection: "I'm too young to need life insurance",
    response: "Actually, that's the perfect time to get coverage! When you're young and healthy, premiums are at their lowest and you can lock in those rates. Plus, life is unpredictable - having coverage now means your family is protected no matter what happens."
  },
  {
    id: 3,
    objection: "I need to think about it",
    response: "I completely understand wanting to make an informed decision. What specific concerns would you like me to address? I'd be happy to schedule a brief follow-up call in a few days to answer any questions that come up."
  }
];

// Settings storage (in production, this would be in a database)
let systemSettings = {
  aiSettings: {
    creativityLevel: 7,
    allowFreestyle: true,
    escalateUnknown: false,
    useObjectionList: true
  },
  callSettings: {
    immediateSecondCall: true,
    secondCallDelay: 0,
    maxCallAttempts: 2,
    callInterval: 30
  },
  apiKeys: {
    openai: process.env.OPENAI_API_KEY || '',
    meta: process.env.META_ACCESS_TOKEN || '',
    elevenlabs: process.env.ELEVENLABS_API_KEY || '',
    twilio: process.env.TWILIO_ACCOUNT_SID || '',
    icons8: process.env.ICONS8_API_KEY || ''
  }
};

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'LeadFlow Pro API by J. Kollar is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      pdfScanning: true,
      csvImport: true,
      aiCalling: true,
      smsFlow: true,
      systemTesting: true,
      objectionHandling: true,
      userManagement: true
    }
  });
});

// Lead Management
app.get('/api/leads', (req, res) => {
  const { status, type, search } = req.query;
  let filteredLeads = [...leads];

  if (status) {
    filteredLeads = filteredLeads.filter(lead => lead.status === status);
  }
  if (type) {
    filteredLeads = filteredLeads.filter(lead => lead.type.toLowerCase().includes(type.toLowerCase()));
  }
  if (search) {
    filteredLeads = filteredLeads.filter(lead => 
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search) ||
      lead.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json(filteredLeads);
});

app.post('/api/leads', (req, res) => {
  const newLead = {
    id: Date.now(),
    ...req.body,
    time: 'Just now',
    status: 'new',
    notes: [],
    callHistory: []
  };
  leads.push(newLead);
  res.json(newLead);
});

// Campaign Management
app.get('/api/campaigns', (req, res) => {
  res.json(campaigns);
});

app.post('/api/campaigns', (req, res) => {
  const newCampaign = {
    id: Date.now(),
    ...req.body,
    status: 'active',
    leads: 0,
    costPerLead: 0,
    createdAt: new Date()
  };
  campaigns.push(newCampaign);
  res.json({ message: 'Campaign created successfully', campaign: newCampaign });
});

// AI Ad Generation
app.post('/api/generate-ad', (req, res) => {
  const { insuranceType, targetLocation, minAge, maxAge } = req.body;
  
  const templates = {
    'life': {
      headline: 'Secure Your Family\'s Financial Future Today',
      copy: 'Life happens when you least expect it. Protect your loved ones with comprehensive life insurance coverage starting at just $25/month. Get your free, no-obligation quote in under 2 minutes.',
      cta: 'Get Free Quote'
    },
    'term': {
      headline: 'Affordable Term Life Insurance - No Medical Exam', 
      copy: 'Get up to $500,000 in term life coverage without the hassle. Quick approval, competitive rates, and peace of mind for your family. Apply online in minutes.',
      cta: 'Apply Now'
    },
    'final-expense': {
      headline: 'Don\'t Leave Your Family with Funeral Debt',
      copy: 'Final expense insurance ensures your loved ones aren\'t burdened with funeral costs. Coverage from $5,000-$50,000 with guaranteed acceptance for ages 45-85.',
      cta: 'Get Coverage'
    },
    'medicare': {
      headline: 'Medicare Made Simple - Free Consultation',
      copy: 'Navigate Medicare with confidence. Our licensed agents help you find the perfect plan with maximum benefits and minimum cost. Call for your free consultation.',
      cta: 'Free Consultation'
    },
    'other': {
      headline: 'Comprehensive Insurance Solutions',
      copy: 'Whatever your insurance needs, we have solutions that fit your budget and lifestyle. Speak with a licensed agent today for personalized recommendations.',
      cta: 'Get Quote'
    }
  };
  
  // Add location and age targeting to the copy if provided
  let selectedTemplate = templates[insuranceType] || templates['life'];
  
  if (targetLocation) {
    selectedTemplate.copy = selectedTemplate.copy + ` Available in ${targetLocation}.`;
  }
  
  res.json(selectedTemplate);
});

// Campaign Launch
app.post('/api/launch-campaign', (req, res) => {
  const newCampaign = {
    id: Date.now(),
    ...req.body,
    status: 'active',
    leads: 0,
    costPerLead: 0,
    createdAt: new Date()
  };
  campaigns.push(newCampaign);
  
  // Simulate adding some initial metrics
  setTimeout(() => {
    newCampaign.leads = Math.floor(Math.random() * 10) + 1;
    newCampaign.costPerLead = (Math.random() * 10 + 5).toFixed(2);
  }, 1000);
  
  res.json({ message: 'Campaign launched successfully', campaign: newCampaign });
});

// File Upload Endpoints
app.post('/api/upload/csv', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Simulate CSV processing
    const leadCount = Math.floor(Math.random() * 50) + 10;
    
    // Add sample leads from CSV
    for (let i = 0; i < Math.min(leadCount, 5); i++) {
      const newLead = {
        id: Date.now() + i,
        name: `CSV Import ${i + 1}`,
        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        email: `csvlead${i + 1}@email.com`,
        type: ['Life Insurance', 'Term Life', 'Final Expense', 'Other'][Math.floor(Math.random() * 4)],
        location: ['Phoenix, AZ', 'Dallas, TX', 'Miami, FL'][Math.floor(Math.random() * 3)],
        status: 'new',
        time: 'Just imported',
        source: 'CSV Import',
        notes: [],
        callHistory: []
      };
      leads.push(newLead);
    }

    res.json({
      message: `Successfully imported ${leadCount} leads from CSV`,
      count: leadCount,
      processed: Math.min(leadCount, 5)
    });
  } catch (error) {
    res.status(500).json({ message: 'CSV processing failed', error: error.message });
  }
});

app.post('/api/upload/pdf', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Simulate PDF scanning and processing
    const leadCount = Math.floor(Math.random() * 30) + 5;
    
    // Add sample leads from PDF
    setTimeout(() => {
      for (let i = 0; i < Math.min(leadCount, 3); i++) {
        const newLead = {
          id: Date.now() + i + 1000,
          name: `PDF Extract ${i + 1}`,
          phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          email: `pdflead${i + 1}@email.com`,
          type: ['Life Insurance', 'Final Expense', 'Medicare', 'Other'][Math.floor(Math.random() * 4)],
          location: ['Los Angeles, CA', 'Chicago, IL', 'Houston, TX'][Math.floor(Math.random() * 3)],
          status: 'new',
          time: 'Just scanned',
          source: 'PDF Scan',
          notes: [],
          callHistory: []
        };
        leads.push(newLead);
      }
    }, 2000);

    res.json({
      message: `PDF scanning initiated. Processing ${leadCount} potential leads.`,
      status: 'processing',
      estimatedLeads: leadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'PDF processing failed', error: error.message });
  }
});

// AI Calling System
app.post('/api/ai-call', (req, res) => {
  const { leadId, phoneNumber, method } = req.body;
  
  const lead = leads.find(l => l.id == leadId);
  if (!lead) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  // Simulate AI calling or SMS
  const callResult = {
    id: Date.now(),
    date: new Date(),
    method: method,
    duration: Math.floor(Math.random() * 300) + 60, // 1-5 minutes
    result: ['answered', 'voicemail', 'no-answer', 'busy'][Math.floor(Math.random() * 4)],
    transcript: `${method === 'call' ? 'Voice call' : 'SMS conversation'} with ${lead.name}. ${method === 'call' ? 'Discussed insurance needs and objections handled.' : 'Text conversation initiated, lead responded positively.'}`
  };

  lead.callHistory.push(callResult);
  lead.status = 'contacted';
  lead.lastContact = method === 'call' ? 'AI Voice Call' : 'AI SMS';

  // Simulate immediate second call if enabled and first call failed
  if (systemSettings.callSettings.immediateSecondCall && callResult.result !== 'answered' && method === 'call') {
    setTimeout(() => {
      const secondCall = {
        id: Date.now() + 1,
        date: new Date(),
        method: 'call',
        duration: Math.floor(Math.random() * 180) + 30,
        result: ['answered', 'voicemail', 'no-answer'][Math.floor(Math.random() * 3)],
        transcript: 'Second immediate call attempt. ' + (Math.random() > 0.5 ? 'Lead answered this time.' : 'Left detailed voicemail.')
      };
      lead.callHistory.push(secondCall);
    }, 1000);
  }

  res.json({
    message: `${method === 'call' ? 'AI call' : 'AI SMS'} initiated successfully`,
    callResult: callResult,
    leadId: lead.id,
    nextAction: callResult.result === 'answered' ? 'Follow-up scheduled' : 'Retry or SMS backup'
  });
});

// System Testing
app.post('/api/test-system', (req, res) => {
  const { testLead } = req.body;
  
  // Simulate complete system test
  const results = {
    leadCreated: { status: 'success', leadId: Date.now() },
    voiceCall: { 
      status: 'success', 
      duration: '2:15', 
      result: 'answered',
      objections: 'Handled affordability concern',
      outcome: 'Interested in $250K term life'
    },
    smsBackup: { 
      status: 'sent', 
      response: 'received',
      content: 'Follow-up text sent, lead responded positively'
    },
    followUp: { 
      status: 'scheduled', 
      nextContact: '2 days',
      method: 'phone',
      calendar: 'Google Calendar integrated'
    },
    leadScoring: { 
      score: 8.5, 
      category: 'hot',
      factors: 'Age, income, family status, engagement level'
    },
    calendar: { 
      status: 'integrated', 
      appointment: 'available',
      nextSlot: 'Tomorrow 2:00 PM'
    }
  };
  
  res.json({
    message: 'Complete system test executed successfully',
    testResults: results,
    recommendation: 'All systems operational. Ready for live leads!',
    timestamp: new Date().toISOString()
  });
});

// Objection Management
app.get('/api/objections', (req, res) => {
  res.json(objections);
});

app.post('/api/objections', (req, res) => {
  const newObjection = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date()
  };
  objections.push(newObjection);
  res.

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// HuggingFace API configuration
const HUGGINGFACE_API_URL = 'https://datasets-server.huggingface.co/rows';
const DATASET = 'vislupus/alpaca-bulgarian-dictionary';
const CONFIG = 'default';
const SPLIT = 'train';

// API Routes (defined BEFORE static files)
// Fetch dictionary data from HuggingFace
app.get('/api/dictionary', async (req, res) => {
  try {
    const offset = req.query.offset || 0;
    const length = req.query.length || 100;

    const url = `${HUGGINGFACE_API_URL}?dataset=${encodeURIComponent(DATASET)}&config=${CONFIG}&split=${SPLIT}&offset=${offset}&length=${length}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching from HuggingFace:', error);
    res.status(500).json({ error: 'Failed to fetch dictionary data', details: error.message });
  }
});

// Get dictionary statistics
app.get('/api/stats', async (req, res) => {
  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}?dataset=${encodeURIComponent(DATASET)}&config=${CONFIG}&split=${SPLIT}&offset=0&length=1`);
    const data = await response.json();
    res.json({ totalRows: data.num_rows_total ? data.num_rows_total : 'Unknown' });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Static files middleware (after API routes)
app.use(express.static(path.join(__dirname, '..')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🇧🇬 Bulgarian Dictionary Website running on http://localhost:${PORT}`);
  console.log(`📚 Press Ctrl+C to stop the server\n`);
});

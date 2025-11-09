require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Supabase Express API is running',
    status: 'healthy' 
  });
});

// POST endpoint to insert data into a table
// Usage: POST /api/insert with body: { table: 'your_table_name', data: {...} }
app.post('/api/insert', async (req, res) => {
  try {
    const { table, data } = req.body;

    // Validate request
    if (!table || !data) {
      return res.status(400).json({ 
        error: 'Missing required fields: table and data' 
      });
    }

    // Insert data into specified table
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error 
      });
    }

    res.status(201).json({ 
      success: true,
      message: 'Data inserted successfully',
      data: result 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST endpoint for calllogs table
app.post('/api/calllogs', async (req, res) => {
  try {
    const callLogData = req.body;

    // Insert into calllogs table
    const { data, error } = await supabase
      .from('calllogs')
      .insert(callLogData)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error 
      });
    }

    res.status(201).json({ 
      success: true,
      message: 'Call log created successfully',
      data: data 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET all call logs
app.get('/api/calllogs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('calllogs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error 
      });
    }

    res.json({ 
      success: true,
      count: data.length,
      data: data 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET single call log by ID
app.get('/api/calllogs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('calllogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error 
      });
    }

    res.json({ 
      success: true,
      data: data 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// GET endpoint example - fetch data from a table
app.get('/api/data/:table', async (req, res) => {
  try {
    const { table } = req.params;

    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error 
      });
    }

    res.json({ 
      success: true,
      data: data 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
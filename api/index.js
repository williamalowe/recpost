require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Supabase Express API is running',
    status: 'healthy' 
  });
});

// e.g. POST /api/insert with body: { table: 'your_table_name', data: {...} }
app.post('/api/insert', async (req, res) => {
  try {
    const { table, data } = req.body;

    if (!table || !data) {
      return res.status(400).json({ 
        error: 'Missing required fields: table and data' 
      });
    }

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

// POST callogs
app.post('/api/calllogs', async (req, res) => {
  try {
    const callLogData = req.body;

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


// vercel
module.exports = app;

// local testing
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
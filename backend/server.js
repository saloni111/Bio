const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Google Sheets setup
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Initialize Google Sheets
async function initializeSheet() {
  try {
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    // Get or create the first sheet
    let sheet = doc.sheetsByIndex[0];
    if (!sheet) {
      sheet = await doc.addSheet({ 
        title: 'GHC 2025 Recruiter Contacts',
        headerValues: ['Timestamp', 'Email', 'Source', 'IP Address', 'User Agent']
      });
    } else {
      // Ensure headers exist
      await sheet.loadHeaderRow();
      if (sheet.headerValues.length === 0) {
        await sheet.setHeaderRow(['Timestamp', 'Email', 'Source', 'IP Address', 'User Agent']);
      }
    }
    
    return sheet;
  } catch (error) {
    console.error('Error initializing Google Sheet:', error);
    throw error;
  }
}

// Email capture endpoint
app.post('/api/capture-email', async (req, res) => {
  try {
    const { email, source = 'ghc25-qr' } = req.body;
    
    // Validate email
    if (!email || !email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid email is required' 
      });
    }

    // Get client info
    const timestamp = new Date().toISOString();
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    // Initialize and add to Google Sheet
    const sheet = await initializeSheet();
    await sheet.addRow({
      'Timestamp': timestamp,
      'Email': email.toLowerCase().trim(),
      'Source': source,
      'IP Address': ipAddress,
      'User Agent': userAgent
    });

    console.log(`✅ Email captured: ${email} from ${source} at ${timestamp}`);

    res.json({ 
      success: true, 
      message: 'Email captured successfully',
      timestamp: timestamp
    });

  } catch (error) {
    console.error('Error capturing email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save email. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'GHC Email Capture API'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email capture server running on port ${PORT}`);
  console.log(`📊 Google Sheets ID: ${SPREADSHEET_ID}`);
  console.log(`📧 Service Account: ${GOOGLE_SERVICE_ACCOUNT_EMAIL}`);
});

module.exports = app;

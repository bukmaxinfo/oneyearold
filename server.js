require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Google Sheets auth (created once, reused)
const authOptions = { scopes: ['https://www.googleapis.com/auth/spreadsheets'] };
if (process.env.GOOGLE_CREDENTIALS) {
  authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
  authOptions.keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json';
}
const auth = new google.auth.GoogleAuth(authOptions);
const sheets = google.sheets({ version: 'v4', auth });

app.post('/api/rsvp', async (req, res) => {
  const { guestName, babyName, email, attendance, guests, notes, timestamp } = req.body;

  if (!guestName || !attendance) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, guestName, babyName, email, attendance, guests, notes]],
      },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Google Sheets error:', err.message);
    res.status(500).json({ error: 'Failed to save RSVP' });
  }
});

// Local dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;

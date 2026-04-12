const { google } = require('googleapis');

const authOptions = { scopes: ['https://www.googleapis.com/auth/spreadsheets'] };
if (process.env.GOOGLE_CREDENTIALS) {
  authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
  authOptions.keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'credentials.json';
}
const auth = new google.auth.GoogleAuth(authOptions);
const sheets = google.sheets({ version: 'v4', auth });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    console.error('Full error:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('GOOGLE_SHEET_ID set:', !!process.env.GOOGLE_SHEET_ID);
    console.error('GOOGLE_CREDENTIALS set:', !!process.env.GOOGLE_CREDENTIALS);
    res.status(500).json({ error: 'Failed to save RSVP', detail: err.message });
  }
};

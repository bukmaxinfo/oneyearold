require('dotenv').config();
const express = require('express');
const path = require('path');
const rsvpHandler = require('./api/rsvp');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/rsvp', (req, res) => rsvpHandler(req, res));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Example API endpoint for fetching emails
app.get('/api/emails', (req, res) => {
  const emails = [
    {
      id: 1,
      sender: 'sender1@example.com',
      recipient: 'user@example.com',
      subject: 'Hello from Sender 1',
      body: 'This is the body of the email from Sender 1.',
      timestamp: '2024-05-23T10:00:00Z'
    },
    {
      id: 2,
      sender: 'sender2@example.com',
      recipient: 'user@example.com',
      subject: 'Important Update',
      body: 'This is an important update from Sender 2.',
      timestamp: '2024-05-23T11:30:00Z'
    }
  ];
  res.json(emails);
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
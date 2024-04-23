const express = require('express');
const app = express();
require('dotenv').config();

// app.set('view engine', 'html');
// Set up EJS as view engine
app.set('view engine', 'ejs');
const port = process.env.PORT || 3000;
app.use(express.static('views'));

// app.use(express.static('public'));
app.get('/', (req, res) => {
  res.render('index', { 
    google_api_key: process.env.GOOGLE_API_KEY,
  });
});
app.get('/locationPage', (req, res) => {
  res.render('locationPage', { 
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
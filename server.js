const express = require('express');
const app = express();
require('dotenv').config();

// app.set('view engine', 'html');
// Set up EJS as view engine
app.set('view engine', 'ejs');
const port = process.env.PORT || 3000;
app.use(express.static('views'));


// app.use(express.static('public'));
console.log(process.env.API_KEY)
app.get('/', (req, res) => {
  console.log({ 
    API_KEY: process.env.API_KEY,
    // Add more variables as needed
  })
  res.render('index', { 
    API_KEY: process.env.API_KEY,
    // Add more variables as needed
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
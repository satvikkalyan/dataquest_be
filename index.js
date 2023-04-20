const express = require('express');
const app = express();
const helloWorldRoutes = require('./routes/helloWorld');
const userDetailsRoutes = require('./routes/userDetails');

// Mount the routes defined in "routes/helloWorld.js"
app.use('/', helloWorldRoutes);

// Mount the routes defined in "routes/userDetails.js"
app.use('/', userDetailsRoutes);

// Start the Express app
app.listen(3001, () => {
  console.log('App listening on port 3001!');
});

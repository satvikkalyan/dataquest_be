const express = require('express');
const app = express();
const helloWorldRoutes = require('./routes/helloWorld');
const userDetailsRoutes = require('./routes/userDetails');
const emailRoutes = require('./utils/email');
const jobRoutes=require('./routes/skills');
const Jobdetails_by_id= require('./routes/Jobdetails');
const allJobs=require('./routes/allJobs')
const delete_job=require('./routes/deleteJob');
// Mount the routes defined in "routes/helloWorld.js"
app.use('/', helloWorldRoutes);

// Mount the routes defined in "routes/userDetails.js"
app.use('/', userDetailsRoutes);
app.use('/',jobRoutes);
app.use('/',Jobdetails_by_id);
app.use('/',allJobs);
app.use(emailRoutes);
app.use('/',delete_job);
// Start the Express app
app.listen(3001, () => {
  console.log('App listening on port 3001!');
});

const express = require("express");
const app = express();
const helloWorldRoutes = require("./routes/helloWorld");
const userDetailsRoutes = require("./routes/userDetails");
const emailRoutes = require("./utils/email");
const jobRoutes = require("./routes/skills");
const Jobdetails_by_id = require("./routes/Jobdetails");
const allJobs = require("./routes/allJobs");
const delete_job = require("./routes/deleteJob");
const chartRoutes = require("./routes/charts");
const addJob=require("./routes/createJobs");
const cors = require('cors');
const updateJob=require('./routes/updateJobs');
app.use(cors());

app.use("/", helloWorldRoutes);

app.use("/", chartRoutes);
app.use("/", userDetailsRoutes);
app.use("/", jobRoutes);
app.use("/", Jobdetails_by_id);
app.use("/", allJobs);
app.use("/", emailRoutes);
app.use("/", delete_job);
app.use("/",addJob);
app.use("/",updateJob);
app.listen(3001, () => {
  console.log("App listening on port 3001!");
});

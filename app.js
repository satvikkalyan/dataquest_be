// Import required packages
const express = require('express');
const mysql = require('mysql');

// Create Express app
const app = express();

// Create a MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 1,  // Set the maximum number of connections in the pool
  host: 'adtdataquest.cvrueppipmsl.us-east-2.rds.amazonaws.com',       // Replace with your AWS RDS host name
  user: 'dataquest',  // Replace with your database username
  password: '9133656685',  // Replace with your database password
  database: 'dataquest'  // Replace with your database name
});

// Define API endpoint to fetch data from 'helloworld' table
app.get('/getdata', (req, res) => {
  // Get a connection from the connection pool
  pool.getConnection((err, connection) => {
    if (err) throw err;

    // Perform a SELECT query to fetch all data from 'helloworld' table
    const query = 'SELECT * FROM helloworld';
    connection.query(query, (err, results) => {
      connection.release();  // Release the connection back to the pool
      if (err) {
        res.status(500).send('Error fetching data from database');
      } else {
        res.status(200).send(results);
      }
    });
  });
});

// Start the Express app
app.listen(3000, () => {
  console.log('App listening on port 3000!');
});

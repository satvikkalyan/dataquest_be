// routes/helloWorld.js

const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbConfig = require('./../conf/database');

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Define API endpoint to fetch data from 'helloworld' table
router.get('/getdata', (req, res) => {
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

module.exports = router;

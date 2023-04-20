const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dbConfig = require('./../conf/database');

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Define API endpoint to fetch user details from the 'users', 'user_job', and 'skills' tables
router.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  // Get a connection from the connection pool
  pool.getConnection((err, connection) => {
    if (err) throw err;

    // Perform a JOIN query to fetch user details from the 'users', 'user_job', and 'skills' tables
    const query = `
      SELECT
        u.user_id,
        u.firstName,
        u.lastName,
        u.email,
        u.gender,
        j.company,
        j.title,
        j.salary,
        j.salary_type,
        j.job_rating
      FROM
        users u
        LEFT JOIN user_job j ON u.user_id = j.user_id
      WHERE
        u.user_id = ${userId}
    `;
    connection.query(query, (err, results) => {
      connection.release();  // Release the connection back to the pool
      if (err) {
        res.status(500).send('Error fetching user details from database');
      } else {
        res.status(200).send(results);
      }
    });
  });
});

module.exports = router;

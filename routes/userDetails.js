const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dbConfig = require("./../conf/database");
router.use(express.json());
// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Define API endpoint to fetch user details from the 'users', 'user_job', and 'skills' tables
router.get("/users/:id", (req, res) => {
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
      connection.release(); // Release the connection back to the pool
      if (err) {
        res.status(500).send("Error fetching user details from database");
      } else {
        res.status(200).send(results);
      }
    });
  });
});

// Define API endpoint to create a new user in 'users' table
router.post("/users", (req, res) => {
  const { firstName, lastName, email, passphrase, gender } = req.body;

  // Get a connection from the connection pool
  pool.getConnection((err, connection) => {
    if (err) throw err;

    // Perform an INSERT query to create a new user in 'users' table
    const query = `INSERT INTO users (firstName, lastName, email, passphrase, gender)
                     VALUES (?, ?, ?, ?, ?)`;
    connection.query(
      query,
      [firstName, lastName, email, passphrase, gender],
      (err, result) => {
        connection.release(); // Release the connection back to the pool
        if (err) {
            console.log(err)
          res.status(500).send("Error creating new user in database");
        } else {
          res.status(201).send(`${result.insertId}`);
        }
      }
    );
  });
});

module.exports = router;

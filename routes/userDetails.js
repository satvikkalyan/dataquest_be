const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dbConfig = require("./../conf/database");
router.use(express.json());
// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

function queryDatabase(query, params) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        connection.query(query, params, (err, results) => {
          connection.release(); // Release the connection back to the pool
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      }
    });
  });
}

// Define API endpoint to fetch user details from the 'users', 'user_job', and 'skills' tables
router.get("/users/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    // Perform a JOIN query to fetch user details from the 'users', 'user_job', and 'skills' tables
    const query = `
      SELECT
        u.user_id,
        u.firstName,
        u.lastName,
        u.email,
        u.gender,
        u.isadmin,
        j.company,
        j.title,
        j.salary,
        j.salary_type,
        j.job_rating
      FROM
        users u
        LEFT JOIN user_job j ON u.user_id = j.user_id
      WHERE
        u.user_id = ?
    `;
    const results = await queryDatabase(query, [userId]);
    res.status(200).send(results);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching user details from database");
  }
});

router.get("/users/verify/:email", async (req, res) => {
  const email = req.params.email;
  try {
    // Perform a JOIN query to fetch user details from the 'users', 'user_job', and 'skills' tables
    const query = `
      SELECT
        u.user_id,
        u.firstName,
        u.lastName,
        u.email,
        u.passphrase,
        u.gender,
        u.isAdmin,
        j.company,
        j.title,
        j.salary,
        j.salary_type,
        j.job_rating
      FROM
        users u
        LEFT JOIN user_job j ON u.user_id = j.user_id
      WHERE
        u.email = ?
    `;
    const results = await queryDatabase(query, [email]);
    res.status(200).send(results);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching user details from database");
  }
});

router.put("/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id);
  console.log(userId);
  const { firstName, lastName } = req.body;

  try {
    // Perform an UPDATE query to update the user's first name, last name, and email in 'users' table
    const query = `
      UPDATE users
      SET firstName = ?,
          lastName = ?
      WHERE user_id = ?
    `;
    const result = await queryDatabase(query, [firstName, lastName, userId]);
    res.status(200).send(`User ${userId} updated successfully`);
  } catch (err) {
    console.log(err);
    res.status(500).send(`Error updating user ${userId} in database`);
  }
});

router.put("/users-job/:id", async (req, res) => {
  const { company, title, salary, salary_type, job_rating } = req.body;
  const userId = parseInt(req.params.id);

  try {
    // Perform a SELECT query to check if user has job details already present in 'user_job' table
    const query = `SELECT * FROM user_job WHERE user_id = ?`;
    const result = await queryDatabase(query, [userId]);

    if (result.length > 0) {
      // If job details already present for user, perform an UPDATE query to update the details
      const updateQuery = `UPDATE user_job
                           SET company = ?, title = ?, salary = ?, salary_type = ?, job_rating = ?
                           WHERE user_id = ?`;
      await queryDatabase(updateQuery, [
        company,
        title,
        salary,
        salary_type,
        job_rating,
        userId,
      ]);
      res.status(200).send("Job details updated successfully");
    } else {
      // If job details not present for user, perform an INSERT query to create a new record
      const insertQuery = `INSERT INTO user_job (company, title, salary, salary_type, job_rating, user_id)
                           VALUES (?, ?, ?, ?, ?, ?)`;
      await queryDatabase(insertQuery, [
        company,
        title,
        salary,
        salary_type,
        job_rating,
        userId,
      ]);
      res.status(201).send("Job details added successfully");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding/updating job details for user");
  }
});

// Define API endpoint to create a new user in 'users' table
router.post("/users", async (req, res) => {
  const { firstName, lastName, email, passphrase, gender, admin } = req.body;

  try {
    // Perform an INSERT query to create a new user in 'users' table
    const query = `INSERT INTO users (firstName, lastName, email, passphrase, gender,isadmin)
                     VALUES (?, ?, ?, ?, ?,?)`;
    const result = await queryDatabase(query, [
      firstName,
      lastName,
      email,
      passphrase,
      gender,
      admin,
    ]);
    res.status(201).send(`${result.insertId}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating new user in database");
  }
});

router.post("/users-job", async (req, res) => {
  const { company, title, salary, salary_type, job_rating, user_id } = req.body;

  try {
    // Perform an INSERT query to create a new user in 'users' table
    const query = `INSERT INTO user_job (company, title, salary, salary_type, job_rating , user_id)
                       VALUES (?, ?, ?, ?, ?,?)`;
    const result = await queryDatabase(query, [
      company,
      title,
      salary,
      salary_type,
      job_rating,
      user_id,
    ]);
    res.status(201).send(`${result.insertId}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating new user in database");
  }
});

router.post("/users-skills", async (req, res) => {
  const { user_id, skill } = req.body;
  try {
    // Perform an INSERT query to create a new skill for a user in 'skills' table
    const query = `INSERT INTO skills (user_id, skill) VALUES (?, ?)`;
    const result = await queryDatabase(query, [user_id, skill]);
    res.status(201).send(`${result.insertId}`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error creating new skill in database");
  }
});

module.exports = router;

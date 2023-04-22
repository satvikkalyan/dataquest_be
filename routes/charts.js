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

router.get("/charts", async (req, res) => {
  try {
    const avgHourlyPayByIndustry = await queryDatabase(`
        SELECT Industry, AVG(LowerSalary + UpperSalary)/2 AS AvgHourlyPay
        FROM Jobs JOIN Companies ON Jobs.CompanyID = Companies.CompanyID
        WHERE Hourly = 1
        GROUP BY Industry;
      `);

    const avgAnnuallyPayByIndustry = await queryDatabase(`
        SELECT Industry, AVG(AvgSalary) AS AvgAnnuallyPay
        FROM Jobs JOIN Companies ON Jobs.CompanyID = Companies.CompanyID
        WHERE Hourly = 0
        GROUP BY Industry;
      `);

    const numOfJobOpeningsByIndustry = await queryDatabase(`
        SELECT Industry, COUNT(*) AS NumOfJobOpenings
        FROM Jobs JOIN Companies ON Jobs.CompanyID = Companies.CompanyID
        GROUP BY Industry;
      `);

    res.status(200).send({
      avgHourlyPayByIndustry: avgHourlyPayByIndustry,
      avgAnnuallyPayByIndustry: avgAnnuallyPayByIndustry,
      numOfJobOpeningsByIndustry: numOfJobOpeningsByIndustry,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
});


module.exports = router;
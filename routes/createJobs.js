const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const dbConfig = require("./../conf/database");
router.use(express.json());
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

router.post("/createJob", async (req, res) => {
  const jobData = req.body;
  const companyData = jobData.company;
  let companyId;

  // Check if company exists
  const checkCompanyQuery =
    "SELECT CompanyID FROM Companies WHERE CompanyName = ?";
  const checkCompanyParams = [companyData.companyName];
  const checkCompanyResults = await queryDatabase(
    checkCompanyQuery,
    checkCompanyParams
  );

  if (checkCompanyResults.length > 0) {
    companyId = checkCompanyResults[0].CompanyID;
  } else {
    const id_query = "select max(CompanyID) as maxid from Companies;";
    max_id = await queryDatabase(id_query, []);
    new_id = max_id[0].maxid + Math.floor(Math.random() * 100);
    const createCompanyQuery =
      "INSERT INTO Companies (CompanyID, CompanyName, Rating, Location, Headquarters, Size, Founded, TypeOfOwnership, Industry, Sector, Revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const createCompanyParams = [
      new_id,
      companyData.companyName,
      companyData.rating,
      companyData.location,
      companyData.headquarters,
      companyData.size,
      companyData.founded,
      companyData.typeOfOwnership,
      companyData.industry,
      companyData.sector,
      companyData.revenue,
    ];
    await queryDatabase(createCompanyQuery, createCompanyParams);
    companyId = new_id;
    if (companyData.competitors && companyData.competitors.length > 0) {
      const insertCompetitorQuery =
        "INSERT INTO COMPETITORS (CompanyID, CompetitorName) VALUES (?, ?)";
      for (let i = 0; i < companyData.competitors.length; i++) {
        const competitorParams = [companyId, companyData.competitors[i]];
        await queryDatabase(insertCompetitorQuery, competitorParams);
      }
    }
  }
  const id_query_job = "select max(JobId) as maxid from Jobs;";
  max_id = await queryDatabase(id_query_job, []);
  new_id_job = max_id[0].maxid + Math.floor(Math.random() * 100);
  const createJobQuery =
    "INSERT INTO Jobs (JobID, JobTitle, JobDescription, Hourly, EmployerProvided, LowerSalary, UpperSalary, AvgSalary, CompanyID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const createJobParams = [
    new_id_job,
    jobData.jobTitle,
    jobData.jobDescription,
    jobData.hourly,
    jobData.employerProvided,
    jobData.lowerSalary,
    jobData.upperSalary,
    jobData.avgSalary,
    companyId,
  ];
  await queryDatabase(createJobQuery, createJobParams);

  // Insert job skills
  if (jobData.skills && jobData.skills.length > 0) {
    const insertSkillQuery =
      "INSERT INTO JobSkills (JobID, Skill) VALUES (?, ?)";
    for (let i = 0; i < jobData.skills.length; i++) {
      const skillParams = [new_id_job, jobData.skills[i]];
      await queryDatabase(insertSkillQuery, skillParams);
    }
  }
  res
    .status(200)
    .send(`${new_id_job}`);
});
module.exports = router;

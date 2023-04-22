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
  const checkCompanyQuery = "SELECT CompanyID FROM Companies WHERE CompanyName = ?";
  const checkCompanyParams = [companyData.companyName];
  const checkCompanyResults = await queryDatabase(checkCompanyQuery, checkCompanyParams);

  if (checkCompanyResults.length > 0) {
    // Company already exists
    console.log("line1")
    companyId = checkCompanyResults[0].CompanyID;
  } else {
    // Create new company
    console.log("line2")
    // const currentTimestamp = new Date().getTime();
    // console.log(currentTimestamp)
    const id_query="select max(CompanyID) as maxid from Companies;"
    max_id= await queryDatabase(id_query, []);
    console.log(max_id)
    console.log(max_id[0].maxid);
    new_id=max_id[0].maxid+Math.floor(Math.random() * 100);
    console.log(new_id," new id")
    const createCompanyQuery = "INSERT INTO Companies (CompanyID, CompanyName, Rating, Location, Headquarters, Size, Founded, TypeOfOwnership, Industry, Sector, Revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const createCompanyParams = [      new_id,      companyData.companyName,      companyData.rating,      companyData.location,      companyData.headquarters,      companyData.size,      companyData.founded,      companyData.typeOfOwnership,      companyData.industry,      companyData.sector,      companyData.revenue    ];
    await queryDatabase(createCompanyQuery, createCompanyParams);
    companyId = new_id;

    // Insert competitors
    console.log(companyData.competitors);
    console.log(companyData.competitors.length > 0);
    if (companyData.competitors && companyData.competitors.length > 0) {
        console.log("line 3")
      const insertCompetitorQuery = "INSERT INTO COMPETITORS (CompanyID, CompetitorName) VALUES (?, ?)";
      for (let i = 0; i < companyData.competitors.length; i++) {
        console.log("hi")
        const competitorParams = [companyId, companyData.competitors[i]];
        await queryDatabase(insertCompetitorQuery, competitorParams);
      }
    }
  }

  // Insert job
  const createJobQuery = "INSERT INTO Jobs (JobID, JobTitle, JobDescription, Hourly, EmployerProvided, LowerSalary, UpperSalary, AvgSalary, CompanyID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const createJobParams = [    jobData.jobId,    jobData.jobTitle,    jobData.jobDescription,    jobData.hourly,    jobData.employerProvided,    jobData.lowerSalary,    jobData.upperSalary,    jobData.avgSalary,    companyId  ];
  await queryDatabase(createJobQuery, createJobParams);

  // Insert job skills
  if (jobData.skills && jobData.skills.length > 0) {
    const insertSkillQuery = "INSERT INTO JobSkills (JobID, Skill) VALUES (?, ?)";
    for (let i = 0; i < jobData.skills.length; i++) {
      const skillParams = [jobData.jobId, jobData.skills[i]];
      await queryDatabase(insertSkillQuery, skillParams);
    }
  }
  res.status(200).json({ message: `Job with id ${ jobData.jobId} has been added` });
});
module.exports=router;

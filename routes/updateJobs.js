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

router.post("/updateJob", async (req, res) => {
    const job = req.body;
    // Check if company already exists
    let query = `SELECT * FROM Companies WHERE CompanyName = ?`;
    let params = [job.company.companyName];
    let results = await queryDatabase(query, params);
    let companyId;
    if (results.length === 0) {
      // Company doesn't exist, so insert new record and get its id
        console.log("I am coming")
        const id_query="select max(CompanyID) as maxid from Companies;"
        max_id= await queryDatabase(id_query, []);
        console.log(max_id)
        console.log(max_id[0].maxid);
        new_id=max_id[0].maxid+Math.floor(Math.random() * 100);
        query = `INSERT INTO Companies (CompanyID,CompanyName, Rating, Location, Headquarters, Size, Founded, TypeOfOwnership, Industry, Sector, Revenue) 
                VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        params = [  new_id,      job.company.companyName,        job.company.rating,        job.company.location,        job.company.headquarters,        job.company.size,        job.company.founded,        job.company.typeOfOwnership,        job.company.industry,        job.company.sector,        job.company.revenue      ];
        results = await queryDatabase(query, params);
        companyId = new_id;
    } else {
      // Company exists, so update its values
        console.log("line1")
        companyId = results[0].CompanyID;
        query = `UPDATE Companies SET Rating=?, Location=?, Headquarters=?, Size=?, Founded=?, TypeOfOwnership=?, Industry=?, Sector=?, Revenue=? WHERE CompanyID=?`;
        params = [        job.company.rating,        job.company.location,        job.company.headquarters,        job.company.size,        job.company.founded,        job.company.typeOfOwnership,        job.company.industry,        job.company.sector,        job.company.revenue,        companyId      ];
        results = await queryDatabase(query, params);
    }

    // Delete existing competitors
    console.log(companyId,"companyId")
    query = `DELETE FROM COMPETITORS WHERE CompanyID = ?`;
    params = [companyId];
    results = await queryDatabase(query, params);

    // Insert new competitors
    console.log(job.company.competitors);
    if (job.company.competitors) {

        console.log("hi")
        for (let i = 0; i < job.company.competitors.length; i++) {
            query = `INSERT INTO COMPETITORS (CompanyID, CompetitorName) VALUES (?, ?)`;
            params = [companyId, job.company.competitors[i]];
            results = await queryDatabase(query, params);
        }
    }

    // Update job
    query = `UPDATE Jobs SET JobTitle=?, JobDescription=?, Hourly=?, EmployerProvided=?, LowerSalary=?, UpperSalary=?, AvgSalary=?,CompanyId=? WHERE JobID=?`;
    params = [      job.jobTitle,      job.jobDescription,      job.hourly,      job.employerProvided,      job.lowerSalary,      job.upperSalary,      job.avgSalary, companyId,     job.jobId    ];
    results = await queryDatabase(query, params);

    // Delete existing skills
    const deleteSkillsQuery = 'DELETE FROM JobSkills WHERE JobID = ?';
    const deleteSkillsResult = await queryDatabase(deleteSkillsQuery, job.jobId );
    for (const skill of job.skills) {
      const addSkillQuery = 'INSERT INTO JobSkills (JobID, Skill) VALUES (?, ?)';
      const addSkillResult = await queryDatabase(addSkillQuery, [job.jobId , skill]);
    }
    res.status(200).json("Job details are updated ");
});
module.exports=router;

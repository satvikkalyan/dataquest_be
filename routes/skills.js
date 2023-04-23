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
        
        console.log(params);
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
router.post('/jobs', async (req, res) => {
    const skills = req.body.skills;
    const skills_query=[skills];
    const query = 'SELECT DISTINCT JobID FROM JobSkills WHERE Skill IN (?)';
    const results= await queryDatabase(query,skills_query)
    const jobDetailsParams = results.map(result => result.JobID);
    const jobDetailsParams_for_skills = [jobDetailsParams];
    const allskillsquery='select * from JobSkills where JobID in (?)';
    const skills_details=await queryDatabase(allskillsquery, jobDetailsParams_for_skills)
    const skillsDict = {};

    for (const item of skills_details) {
      if (!skillsDict[ parseInt(item.JobID)]) {
        skillsDict[parseInt(item.JobID)] = [];
      }
      skillsDict[parseInt(item.JobID)].push(item.Skill);
    }
    const jobDetails = [];
    for (const jobId of Object.values(jobDetailsParams)) {
      const query_job=`
      SELECT Jobs.JobID, Jobs.JobTitle, Jobs.JobDescription, Jobs.Hourly, Jobs.EmployerProvided, Jobs.LowerSalary, Jobs.UpperSalary, Jobs.AvgSalary, Jobs.CompanyID, Companies.CompanyName, Companies.Rating, Companies.Location, Companies.Headquarters, Companies.Size, Companies.Founded, Companies.TypeOfOwnership, Companies.Industry, Companies.Sector, Companies.Revenue
      FROM Jobs
      JOIN Companies ON Jobs.CompanyID = Companies.CompanyID
      WHERE Jobs.JobID = (?)
    `
      const job = await queryDatabase(query_job,parseInt(jobId));
      const COMPETITORS_query=`
      SELECT CompetitorName
      FROM COMPETITORS
      WHERE CompanyID = (?)
    `
      const COMPETITORS = await queryDatabase(COMPETITORS_query,job[0].CompanyID);
      const skills_query=`
      SELECT Skill
      FROM JobSkills
      WHERE JobID = (?)
    `
      const skills =await queryDatabase(skills_query,jobId);
    
      jobDetails.push({
        jobId: job[0].JobID,
        jobTitle: job[0].JobTitle,
        jobDescription: job[0].JobDescription,
        hourly: job[0].Hourly === 1,
        employerProvided: job[0].EmployerProvided === 1,
        lowerSalary: job[0].LowerSalary,
        upperSalary: job[0].UpperSalary,
        avgSalary: job[0].AvgSalary,
        companyId: job[0].CompanyID,
        company: {
          companyName: job[0].CompanyName,
          rating: job[0].Rating,
          location: job[0].Location,
          headquarters: job[0].Headquarters,
          size: job[0].Size,
          founded: job[0].Founded,
          typeOfOwnership: job[0].TypeOfOwnership,
          industry: job[0].Industry,
          sector: job[0].Sector,
          revenue: job[0].Revenue,
          competitors: COMPETITORS.map(({ CompetitorName }) => ({ competitorName: CompetitorName })),
        },
      });
    }
    for (const result of jobDetails) {
        const userId = result.jobId;
        const skillsToDevelop = skillsDict[userId].filter(skill => !skills.includes(skill));
        result.skills = skillsToDevelop.map(skill => ({skill}));
    }
      
    res.status(200).send(jobDetails);


  });
  module.exports = router;
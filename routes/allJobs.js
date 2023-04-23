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
        connection.release(); 
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



router.get("/allJobs", async (req, res) => {
try{
    const query = `
    SELECT 
        j.JobID AS jobId,
        j.JobTitle AS jobTitle,
        j.JobDescription AS jobDescription,
        j.Hourly AS hourly,
        j.EmployerProvided AS employerProvided,
        j.LowerSalary AS lowerSalary,
        j.UpperSalary AS upperSalary,
        j.AvgSalary AS avgSalary,
        j.CompanyID AS companyId,
        c.CompanyName AS companyName,
        c.Rating AS rating,
        c.Location AS location,
        c.Headquarters AS headquarters,
        c.Size AS size,
        c.Founded AS founded,
        c.TypeOfOwnership AS typeOfOwnership,
        c.Industry AS industry,
        c.Sector AS sector,
        c.Revenue AS revenue,
        GROUP_CONCAT(DISTINCT comp.CompetitorName) AS competitors,
        GROUP_CONCAT(DISTINCT js.Skill) AS skills
    FROM 
        Jobs j
        JOIN Companies c ON j.CompanyID = c.CompanyID
        LEFT JOIN COMPETITORS comp ON j.CompanyID = comp.CompanyID
        LEFT JOIN JobSkills js ON j.JobID = js.JobID
    GROUP BY 
        j.JobID,c.companyId
    `;
   

    const jobs = await queryDatabase(query,[]);
    const transformedJobs = jobs.map(job => {
        const competitors = job.competitors
          ? job.competitors.split(',').map(name => ({ competitorName: name.trim() }))
          : [];
        const skills = job.skills
          ? job.skills.split(',').map(skill => ({ skill: skill.trim() }))
          : [];
  
        return {
          jobId: job.jobId,
          jobTitle: job.jobTitle,
          jobDescription: job.jobDescription,
          hourly: job.hourly === 1,
          employerProvided: job.employerProvided === 1,
          lowerSalary: job.lowerSalary,
          upperSalary: job.upperSalary,
          avgSalary: job.avgSalary,
          companyId: job.companyId,
          company: {
            companyName: job.companyName,
            rating: job.rating,
            location: job.location,
            headquarters: job.headquarters,
            size: job.size,
            founded: job.founded,
            typeOfOwnership: job.typeOfOwnership,
            industry: job.industry,
            sector: job.sector,
            revenue: job.revenue,
            competitors,
          },
          skills,
        };
      });
    res.status(200).json(transformedJobs);

}
catch(err){
    console.log(err);
    res.status(500).send("Error fetching Job details from database");

}
});

module.exports = router;

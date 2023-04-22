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
        
        //console.log(params);
       
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
//get all Job details
router.delete("/deleteJob/:id", async (req, res) => {
    const jobId=req.params.id
    console.log("Here");
    try{
        const query = 'DELETE FROM JobSkills WHERE JobID =(?)';
        const jobs = await queryDatabase(query,parseInt(jobId));
        console.log(jobs)
        const new_test = 'select * from JobSkills';
        const results = await queryDatabase(new_test,parseInt(jobId));
        console.log(results)
        const deleteJob='DELETE FROM Jobs WHERE JobID = (?)';
        const result = await queryDatabase(deleteJob,parseInt(jobId));
        res.status(200).json({ message: `Job with id ${jobId} has been deleted` });
        //res.status(200).jssedon("Deleted Job with id ");
    
    }
    catch(err){
        console.log(err);
        res.status(500).send("Error fetching Job details from database");
    
    }
    });
    
    module.exports = router;
const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();

/**
 * GET route template
 */

router.get("/", (req, res) => {
  const query = `SELECT * FROM tutees
  ORDER BY submission_timestamp ASC;
  `;
  pool
    .query(query)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log("ERROR: Get test", err);
      res.sendStatus(500);
    });
});

router.get("/active", (req, res) => {
  const query = `SELECT * FROM tutees
  WHERE tutees.active_tutee = true
  ORDER BY submission_timestamp ASC;`;
  pool
    .query(query)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log("ERROR: Get test", err);
      res.sendStatus(500);
    });
});

router.get("/deactive", (req, res) => {
  const query = `SELECT * FROM tutees
  WHERE tutees.active_tutee = false
  ORDER BY submission_timestamp ASC;`;
  pool
    .query(query)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((err) => {
      console.log("ERROR: Get test", err);
      res.sendStatus(500);
    });
});

/**
 * POST route template
 */
router.post("/", (req, res) => {
  // POST route code here
});

module.exports = router;

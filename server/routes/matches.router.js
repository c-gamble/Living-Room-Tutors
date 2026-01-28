const express = require("express");
const pool = require("../modules/pool");
const router = express.Router();
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const matchingService = require("../services/matchingService");
const emailService = require("../services/emailService");

// Whitelist of valid subject column names to prevent SQL injection
const VALID_SUBJECT_COLUMNS = [
  "K5_Math", "K5_Reading", "K5_English_Writing", "K5_Science", "K5_social_studies",
  "6th_to_8th_language_arts", "6th_to_8th_science", "6th_to_8th_social_studies",
  "math_pre_algebra", "math_alg1_linear_alg", "math_alg2", "math_geom", "math_precalc_trig",
  "sci_bio_life", "sci_chem", "sci_physics", "sci_comp_sci",
  "lang_chinese", "lang_spanish", "lang_french", "lang_german",
  "hist_world", "hist_us",
  "ap_bio", "ap_chem", "ap_physics", "ap_calc_AB", "ap_calc_BC", "ap_stats", "ap_comp_sci",
  "ap_english_lit_comp", "ap_lang_comp", "ap_macro_econ", "ap_micro_econ", "ap_psyc",
  "ap_hist_us", "ap_gov_politics_us", "ap_human_geog",
  "sat_subject_tests", "sat_prep", "act_prep", "other"
];

// Whitelist of valid grade column names
const VALID_GRADE_COLUMNS = [
  "prek_kindergarten", "1st", "2nd", "3rd", "4th", "5th", "6th",
  "7th", "8th", "9th", "10th", "11th", "12th"
];

// Validate column name against whitelist
function isValidSubjectColumn(column) {
  return VALID_SUBJECT_COLUMNS.includes(column);
}

function isValidGradeColumn(column) {
  return VALID_GRADE_COLUMNS.includes(column);
}

/**
 * GET route template
 */

router.get("/", (req, res) => {
  console.log("in matches get router");
  const query = `SELECT
matches.id,
tutor_id,
tutee_id,
match_timestamp,
emails_sent,
match_type,
match_score,
tutor_first_name,
tutor_last_name,
tutors.pronouns AS tutor_pronouns,
tutors.phone AS tutor_phone,
tutors.email AS tutor_email,
tutors.grade_level AS tutor_grade,
tutors.school AS tutor_school,
tutors.misc_info AS tutor_miscInfo,
active_tutor,
active_tutee,
student_first_name AS tutee_firstname,
student_last_name  AS tutee_lastname,
tutees.pronouns AS tutee_pronouns,
student_or_guardian,
email_guardian,
email_student,
tutees.phone AS tutee_phone,
tutees.grade_level AS tutee_grade,
tutees.school AS tutee_school,
tutees.subject_other AS tutee_subject_other,
tutees.subject_details AS tutee_subject_details,
tutees.misc_info AS tutee_misc_info,
Subject1.subject AS subject_1, 
Subject2.subject AS subject_2,
Subject3.subject AS subject_3, 
mentoring_grade.prek_kindergarten,
"1st" AS mentor_grade_1,
"2nd" AS mentor_grade_2,
"3rd" AS mentor_grade_3,
"4th" AS mentor_grade_4,
"5th" AS mentor_grade_5,
"6th" AS mentor_grade_6,
"7th" AS mentor_grade_7,
"8th" AS mentor_grade_8,
"9th" AS mentor_grade_9,
"10th" AS mentor_grade_10,
"11th" AS mentor_grade_11,
"12th" AS mentor_grade_12,
subjects_tutors."K5_Math" AS tutor_k5_math,
subjects_tutors."K5_Reading" AS tutor_k5_reading,
subjects_tutors."K5_English_Writing" AS tutor_k5_english_writing,
subjects_tutors."K5_Science" AS tutor_k5_science,
subjects_tutors."K5_social_studies" AS tutor_k5_social_studies,
subjects_tutors."6th_to_8th_language_arts" AS tutor_6th_to_8th_language_arts,
subjects_tutors."6th_to_8th_science" AS tutor_6th_to_8th_science,
subjects_tutors."6th_to_8th_social_studies" AS tutor_6th_to_8th_social_studies,
subjects_tutors."math_pre_algebra" AS tutor_math_pre_algebra,
subjects_tutors."math_alg1_linear_alg" AS tutor_math_alg1_linear_alg,
subjects_tutors."math_alg2" AS tutor_math_alg2,
subjects_tutors."math_geom" AS tutor_math_geom,
subjects_tutors."math_precalc_trig" AS tutor_math_precalc_trig,
subjects_tutors."sci_bio_life" AS tutor_sci_bio_life,
subjects_tutors."sci_chem" AS tutor_sci_chem,
subjects_tutors."sci_physics" AS tutor_sci_physics,
subjects_tutors."sci_comp_sci" AS tutor_sci_comp_sci,
subjects_tutors."lang_chinese" AS tutor_lang_chinese,
subjects_tutors."lang_spanish" AS tutor_lang_spanish,
subjects_tutors."lang_french" AS tutor_lang_french,
subjects_tutors."lang_german" AS tutor_lang_german,
    subjects_tutors."hist_world" AS tutor_hist_world,
    subjects_tutors."hist_us" AS tutor_hist_us,
    subjects_tutors."ap_bio" AS tutor_ap_bio,
    subjects_tutors."ap_chem" AS tutor_ap_chem,
    subjects_tutors."ap_physics" AS tutor_ap_physics,
    subjects_tutors."ap_calc_AB" AS tutor_ap_calc_AB,
    subjects_tutors."ap_calc_BC" AS tutor_ap_calc_BC,
    subjects_tutors."ap_stats" AS tutor_ap_stats,
    subjects_tutors."ap_comp_sci" AS tutor_ap_comp_sci,
    subjects_tutors."ap_english_lit_comp" AS tutor_ap_english_lit_comp,
    subjects_tutors."ap_lang_comp" AS tutor_ap_lang_comp,
    subjects_tutors."ap_macro_econ" AS tutor_ap_macro_econ,
    subjects_tutors."ap_micro_econ" AS tutor_ap_micro_econ,
    subjects_tutors."ap_psyc" AS tutor_ap_psyc, 
    subjects_tutors."ap_hist_us" AS tutor_ap_hist_us,
subjects_tutors."ap_gov_politics_us" AS tutor_ap_gov_politics_us,
subjects_tutors."ap_human_geog" AS tutor_ap_human_geog,
subjects_tutors."sat_subject_tests" AS tutor_sat_subject_tests,
subjects_tutors."sat_prep" AS tutor_sat_prep,
subjects_tutors."act_prep" AS tutor_act_prep,
subjects_tutors."other" AS tutor_subject_other,
tutor_languages."Arabic" AS tutor_language_Arabic,
tutor_languages."Chinese" AS tutor_language_Chinese,
tutor_languages."French" AS tutor_language_French,
tutor_languages."Hmong" AS tutor_language_Hmong,
tutor_languages."Somali" AS tutor_language_Somali,
tutor_languages."Tagalog" AS tutor_language_Tagalog,
tutor_languages."Vietnamese" AS tutor_language_Vietnamese,
tutor_languages."Spanish" AS tutor_language_Spanish,
tutor_languages."Other" AS tutor_language_Other,
tutee_languages."Arabic" AS tutee_language_Arabic,
tutee_languages."Chinese" AS tutee_language_Chinese,
tutee_languages."French" AS tutee_language_French,
tutee_languages."Hmong" AS tutee_language_Hmong,
tutee_languages."Somali" AS tutee_language_Somali,
tutee_languages."Tagalog" AS tutee_language_Tagalog,
tutee_languages."Vietnamese" AS tutee_language_Vietnamese,
tutee_languages."Spanish" AS tutee_language_Spanish,
tutee_languages."Other" AS tutee_language_Other
FROM matches
JOIN tutors ON matches.tutor_id = tutors.id
JOIN tutees ON matches.tutee_id = tutees.id
JOIN subjects_tutors ON tutors.subjects_id = subjects_tutors.id 
inner join subjects_tutees AS Subject1 on Subject1.id = tutees.subject_1
inner join subjects_tutees AS Subject2 on Subject2.id = tutees.subject_2
inner join subjects_tutees AS Subject3 on Subject3.id = tutees.subject_3
inner join "language" AS tutor_languages on tutor_languages.id = tutors.language_tutor_id
inner join "language" AS tutee_languages on tutee_languages.id = tutees.language_tutee_id
JOIN mentoring_grade ON tutors.mentoring_grade_id = mentoring_grade.id
ORDER BY match_timestamp DESC;`;

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

// match search group A
router.get("/groupA", (req, res) => {
  console.log("in tutors.router/get");

  // Validate column names to prevent SQL injection
  const { subject1, subject2, subject3, grade } = req.query;
  if (!isValidSubjectColumn(subject1) || !isValidSubjectColumn(subject2) ||
      !isValidSubjectColumn(subject3) || !isValidGradeColumn(grade)) {
    return res.status(400).send("Invalid subject or grade parameter");
  }

  const query = `SELECT
  tutors.id,
  tutor_first_name,
  tutor_last_name,
    pronouns AS tutor_pronouns,
    tutors.phone AS tutor_phone,
tutors.email AS tutor_email,
    grade_level AS tutor_grade,
    school AS tutor_school,
   misc_info AS tutor_miscInfo,
    active_tutor,
    submission_timestamp AS tutor_submission_timestamp,
    "prek_kindergarten" AS mentor_prek_kindergarten,
   "1st" AS mentor_grade_1,
   "2nd" AS mentor_grade_2,
   "3rd" AS mentor_grade_3,
   "4th" AS mentor_grade_4,
   "5th" AS mentor_grade_5,
   "6th" AS mentor_grade_6,
   "7th" AS mentor_grade_7,
   "8th" AS mentor_grade_8,
   "9th" AS mentor_grade_9,
   "10th" AS mentor_grade_10,
   "11th" AS mentor_grade_11,
   "12th" AS mentor_grade_12,
   subjects_tutors."K5_Math" AS tutor_k5_math,
      subjects_tutors."K5_Reading" AS tutor_k5_reading,
      subjects_tutors."K5_English_Writing" AS tutor_k5_english_writing,
      subjects_tutors."K5_Science" AS tutor_k5_science,
      subjects_tutors."K5_social_studies" AS tutor_k5_social_studies,
      subjects_tutors."6th_to_8th_language_arts" AS tutor_6th_to_8th_language_arts,
      subjects_tutors."6th_to_8th_science" AS tutor_6th_to_8th_science,
      subjects_tutors."6th_to_8th_social_studies" AS tutor_6th_to_8th_social_studies,
      subjects_tutors."math_pre_algebra" AS tutor_math_pre_algebra,
      subjects_tutors."math_alg1_linear_alg" AS tutor_math_alg1_linear_alg,
      subjects_tutors."math_alg2" AS tutor_math_alg2,
      subjects_tutors."math_geom" AS tutor_math_geom,
      subjects_tutors."math_precalc_trig" AS tutor_math_precalc_trig,
      subjects_tutors."sci_bio_life" AS tutor_sci_bio_life,
      subjects_tutors."sci_chem" AS tutor_sci_chem,
      subjects_tutors."sci_physics" AS tutor_sci_physics,
      subjects_tutors."sci_comp_sci" AS tutor_sci_comp_sci,
      subjects_tutors."lang_chinese" AS tutor_lang_chinese,
      subjects_tutors."lang_spanish" AS tutor_lang_spanish,
      subjects_tutors."lang_french" AS tutor_lang_french,
      subjects_tutors."lang_german" AS tutor_lang_german,
          subjects_tutors."hist_world" AS tutor_hist_world,
          subjects_tutors."hist_us" AS tutor_hist_us,
          subjects_tutors."ap_bio" AS tutor_ap_bio,
          subjects_tutors."ap_chem" AS tutor_ap_chem,
          subjects_tutors."ap_physics" AS tutor_ap_physics,
          subjects_tutors."ap_calc_AB" AS tutor_ap_calc_AB,
          subjects_tutors."ap_calc_BC" AS tutor_ap_calc_BC,
          subjects_tutors."ap_stats" AS tutor_ap_stats,
          subjects_tutors."ap_comp_sci" AS tutor_ap_comp_sci,
          subjects_tutors."ap_english_lit_comp" AS tutor_ap_english_lit_comp,
          subjects_tutors."ap_lang_comp" AS tutor_ap_lang_comp,
          subjects_tutors."ap_macro_econ" AS tutor_ap_macro_econ,
          subjects_tutors."ap_micro_econ" AS tutor_ap_micro_econ,
          subjects_tutors."ap_psyc" AS tutor_ap_psyc,
          subjects_tutors."ap_hist_us" AS tutor_ap_hist_us,
  subjects_tutors."ap_gov_politics_us" AS tutor_ap_gov_politics_us,
  subjects_tutors."ap_human_geog" AS tutor_ap_human_geog,
  subjects_tutors."sat_subject_tests" AS tutor_sat_subject_tests,
  subjects_tutors."sat_prep" AS tutor_sat_prep,
  subjects_tutors."act_prep" AS tutor_act_prep,
  subjects_tutors."other" AS tutor_subject_other,
   language."Arabic" AS tutor_language_Arabic,
   language."Chinese" AS tutor_language_Chinese,
   language."French" AS tutor_language_French,
   language."Hmong" AS tutor_language_Hmong,
   language."Somali" AS tutor_language_Somali,
   language."Tagalog" AS tutor_language_Tagalog,
   language."Vietnamese" AS tutor_language_Vietnamese,
   language."Spanish" AS tutor_language_Spanish,
   language."Other" AS tutor_language_Other,
   submission_timestamp
   FROM tutors
  JOIN subjects_tutors ON tutors.subjects_id = subjects_tutors.id
  JOIN "language" ON tutors.language_tutor_id = "language".id
  JOIN mentoring_grade ON tutors.mentoring_grade_id = mentoring_grade.id
  WHERE tutors.active_tutor = true and tutors.matched = false
  and subjects_tutors."${subject1}" = true
  and subjects_tutors."${subject2}" = true
  and subjects_tutors."${subject3}" = true
  and mentoring_grade."${grade}" = true
  ORDER BY tutor_last_name ASC; `;
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

// match search group B
router.get("/groupB", (req, res) => {
  console.log("in tutors.router/get", req.query);

  // Validate column names to prevent SQL injection
  const { subject1, subject2, subject3, grade } = req.query;
  if (!isValidSubjectColumn(subject1) || !isValidSubjectColumn(subject2) ||
      !isValidSubjectColumn(subject3) || !isValidGradeColumn(grade)) {
    return res.status(400).send("Invalid subject or grade parameter");
  }

  const query = `SELECT
  tutors.id,
  tutor_first_name,
  tutor_last_name,
    pronouns AS tutor_pronouns,
    tutors.phone AS tutor_phone,
tutors.email AS tutor_email,
    grade_level AS tutor_grade,
    school AS tutor_school,
   misc_info AS tutor_miscInfo,
    active_tutor,
    submission_timestamp AS tutor_submission_timestamp,
    "prek_kindergarten" AS mentor_prek_kindergarten,
   "1st" AS mentor_grade_1,
   "2nd" AS mentor_grade_2,
   "3rd" AS mentor_grade_3,
   "4th" AS mentor_grade_4,
   "5th" AS mentor_grade_5,
   "6th" AS mentor_grade_6,
   "7th" AS mentor_grade_7,
   "8th" AS mentor_grade_8,
   "9th" AS mentor_grade_9,
   "10th" AS mentor_grade_10,
   "11th" AS mentor_grade_11,
   "12th" AS mentor_grade_12,
   subjects_tutors."K5_Math" AS tutor_k5_math,
      subjects_tutors."K5_Reading" AS tutor_k5_reading,
      subjects_tutors."K5_English_Writing" AS tutor_k5_english_writing,
      subjects_tutors."K5_Science" AS tutor_k5_science,
      subjects_tutors."K5_social_studies" AS tutor_k5_social_studies,
      subjects_tutors."6th_to_8th_language_arts" AS tutor_6th_to_8th_language_arts,
      subjects_tutors."6th_to_8th_science" AS tutor_6th_to_8th_science,
      subjects_tutors."6th_to_8th_social_studies" AS tutor_6th_to_8th_social_studies,
      subjects_tutors."math_pre_algebra" AS tutor_math_pre_algebra,
      subjects_tutors."math_alg1_linear_alg" AS tutor_math_alg1_linear_alg,
      subjects_tutors."math_alg2" AS tutor_math_alg2,
      subjects_tutors."math_geom" AS tutor_math_geom,
      subjects_tutors."math_precalc_trig" AS tutor_math_precalc_trig,
      subjects_tutors."sci_bio_life" AS tutor_sci_bio_life,
      subjects_tutors."sci_chem" AS tutor_sci_chem,
      subjects_tutors."sci_physics" AS tutor_sci_physics,
      subjects_tutors."sci_comp_sci" AS tutor_sci_comp_sci,
      subjects_tutors."lang_chinese" AS tutor_lang_chinese,
      subjects_tutors."lang_spanish" AS tutor_lang_spanish,
      subjects_tutors."lang_french" AS tutor_lang_french,
      subjects_tutors."lang_german" AS tutor_lang_german,
          subjects_tutors."hist_world" AS tutor_hist_world,
          subjects_tutors."hist_us" AS tutor_hist_us,
          subjects_tutors."ap_bio" AS tutor_ap_bio,
          subjects_tutors."ap_chem" AS tutor_ap_chem,
          subjects_tutors."ap_physics" AS tutor_ap_physics,
          subjects_tutors."ap_calc_AB" AS tutor_ap_calc_AB,
          subjects_tutors."ap_calc_BC" AS tutor_ap_calc_BC,
          subjects_tutors."ap_stats" AS tutor_ap_stats,
          subjects_tutors."ap_comp_sci" AS tutor_ap_comp_sci,
          subjects_tutors."ap_english_lit_comp" AS tutor_ap_english_lit_comp,
          subjects_tutors."ap_lang_comp" AS tutor_ap_lang_comp,
          subjects_tutors."ap_macro_econ" AS tutor_ap_macro_econ,
          subjects_tutors."ap_micro_econ" AS tutor_ap_micro_econ,
          subjects_tutors."ap_psyc" AS tutor_ap_psyc,
          subjects_tutors."ap_hist_us" AS tutor_ap_hist_us,
  subjects_tutors."ap_gov_politics_us" AS tutor_ap_gov_politics_us,
  subjects_tutors."ap_human_geog" AS tutor_ap_human_geog,
  subjects_tutors."sat_subject_tests" AS tutor_sat_subject_tests,
  subjects_tutors."sat_prep" AS tutor_sat_prep,
  subjects_tutors."act_prep" AS tutor_act_prep,
  subjects_tutors."other" AS tutor_subject_other,
   language."Arabic" AS tutor_language_Arabic,
   language."Chinese" AS tutor_language_Chinese,
   language."French" AS tutor_language_French,
   language."Hmong" AS tutor_language_Hmong,
   language."Somali" AS tutor_language_Somali,
   language."Tagalog" AS tutor_language_Tagalog,
   language."Vietnamese" AS tutor_language_Vietnamese,
   language."Spanish" AS tutor_language_Spanish,
   language."Other" AS tutor_language_Other,
   submission_timestamp
    FROM tutors
  JOIN subjects_tutors ON tutors.subjects_id = subjects_tutors.id
  JOIN "language" ON tutors.language_tutor_id = "language".id
  JOIN mentoring_grade ON tutors.mentoring_grade_id = mentoring_grade.id
  WHERE tutors.active_tutor = true and tutors.matched = false
  and subjects_tutors."${subject1}" = true
  and subjects_tutors."${subject2}" = true
  and subjects_tutors."${subject3}" = false
  and mentoring_grade."${grade}" = true
  ORDER BY tutor_last_name ASC; `;
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

// match search group C
router.get("/groupC", (req, res) => {
  console.log("in tutors.router/get", req.query);

  // Validate column names to prevent SQL injection
  const { subject1, subject2, subject3, grade } = req.query;
  if (!isValidSubjectColumn(subject1) || !isValidSubjectColumn(subject2) ||
      !isValidSubjectColumn(subject3) || !isValidGradeColumn(grade)) {
    return res.status(400).send("Invalid subject or grade parameter");
  }

  const query = `SELECT
  tutors.id,
  tutor_first_name,
  tutor_last_name,
    pronouns AS tutor_pronouns,
    tutors.phone AS tutor_phone,
tutors.email AS tutor_email,
    grade_level AS tutor_grade,
    school AS tutor_school,
   misc_info AS tutor_miscInfo,
    active_tutor,
    submission_timestamp AS tutor_submission_timestamp,
    "prek_kindergarten" AS mentor_prek_kindergarten,
   "1st" AS mentor_grade_1,
   "2nd" AS mentor_grade_2,
   "3rd" AS mentor_grade_3,
   "4th" AS mentor_grade_4,
   "5th" AS mentor_grade_5,
   "6th" AS mentor_grade_6,
   "7th" AS mentor_grade_7,
   "8th" AS mentor_grade_8,
   "9th" AS mentor_grade_9,
   "10th" AS mentor_grade_10,
   "11th" AS mentor_grade_11,
   "12th" AS mentor_grade_12,
   subjects_tutors."K5_Math" AS tutor_k5_math,
      subjects_tutors."K5_Reading" AS tutor_k5_reading,
      subjects_tutors."K5_English_Writing" AS tutor_k5_english_writing,
      subjects_tutors."K5_Science" AS tutor_k5_science,
      subjects_tutors."K5_social_studies" AS tutor_k5_social_studies,
      subjects_tutors."6th_to_8th_language_arts" AS tutor_6th_to_8th_language_arts,
      subjects_tutors."6th_to_8th_science" AS tutor_6th_to_8th_science,
      subjects_tutors."6th_to_8th_social_studies" AS tutor_6th_to_8th_social_studies,
      subjects_tutors."math_pre_algebra" AS tutor_math_pre_algebra,
      subjects_tutors."math_alg1_linear_alg" AS tutor_math_alg1_linear_alg,
      subjects_tutors."math_alg2" AS tutor_math_alg2,
      subjects_tutors."math_geom" AS tutor_math_geom,
      subjects_tutors."math_precalc_trig" AS tutor_math_precalc_trig,
      subjects_tutors."sci_bio_life" AS tutor_sci_bio_life,
      subjects_tutors."sci_chem" AS tutor_sci_chem,
      subjects_tutors."sci_physics" AS tutor_sci_physics,
      subjects_tutors."sci_comp_sci" AS tutor_sci_comp_sci,
      subjects_tutors."lang_chinese" AS tutor_lang_chinese,
      subjects_tutors."lang_spanish" AS tutor_lang_spanish,
      subjects_tutors."lang_french" AS tutor_lang_french,
      subjects_tutors."lang_german" AS tutor_lang_german,
          subjects_tutors."hist_world" AS tutor_hist_world,
          subjects_tutors."hist_us" AS tutor_hist_us,
          subjects_tutors."ap_bio" AS tutor_ap_bio,
          subjects_tutors."ap_chem" AS tutor_ap_chem,
          subjects_tutors."ap_physics" AS tutor_ap_physics,
          subjects_tutors."ap_calc_AB" AS tutor_ap_calc_AB,
          subjects_tutors."ap_calc_BC" AS tutor_ap_calc_BC,
          subjects_tutors."ap_stats" AS tutor_ap_stats,
          subjects_tutors."ap_comp_sci" AS tutor_ap_comp_sci,
          subjects_tutors."ap_english_lit_comp" AS tutor_ap_english_lit_comp,
          subjects_tutors."ap_lang_comp" AS tutor_ap_lang_comp,
          subjects_tutors."ap_macro_econ" AS tutor_ap_macro_econ,
          subjects_tutors."ap_micro_econ" AS tutor_ap_micro_econ,
          subjects_tutors."ap_psyc" AS tutor_ap_psyc,
          subjects_tutors."ap_hist_us" AS tutor_ap_hist_us,
  subjects_tutors."ap_gov_politics_us" AS tutor_ap_gov_politics_us,
  subjects_tutors."ap_human_geog" AS tutor_ap_human_geog,
  subjects_tutors."sat_subject_tests" AS tutor_sat_subject_tests,
  subjects_tutors."sat_prep" AS tutor_sat_prep,
  subjects_tutors."act_prep" AS tutor_act_prep,
  subjects_tutors."other" AS tutor_subject_other,
   language."Arabic" AS tutor_language_Arabic,
   language."Chinese" AS tutor_language_Chinese,
   language."French" AS tutor_language_French,
   language."Hmong" AS tutor_language_Hmong,
   language."Somali" AS tutor_language_Somali,
   language."Tagalog" AS tutor_language_Tagalog,
   language."Vietnamese" AS tutor_language_Vietnamese,
   language."Spanish" AS tutor_language_Spanish,
   language."Other" AS tutor_language_Other,
   submission_timestamp
    FROM tutors
  JOIN subjects_tutors ON tutors.subjects_id = subjects_tutors.id
  JOIN "language" ON tutors.language_tutor_id = "language".id
  JOIN mentoring_grade ON tutors.mentoring_grade_id = mentoring_grade.id
  WHERE tutors.active_tutor = true and tutors.matched = false
  and subjects_tutors."${subject1}" = true
  and subjects_tutors."${subject2}" = false
  and subjects_tutors."${subject3}" = true
  and mentoring_grade."${grade}" = true
  ORDER BY tutor_last_name ASC; `;
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

// match search group D
router.get("/groupD", (req, res) => {
  console.log("in tutors.router/get");

  // Validate column names to prevent SQL injection
  const { subject1, subject2, subject3, grade } = req.query;
  if (!isValidSubjectColumn(subject1) || !isValidSubjectColumn(subject2) ||
      !isValidSubjectColumn(subject3) || !isValidGradeColumn(grade)) {
    return res.status(400).send("Invalid subject or grade parameter");
  }

  const query = `SELECT
  tutors.id,
  tutor_first_name,
  tutor_last_name,
    pronouns AS tutor_pronouns,
    tutors.phone AS tutor_phone,
tutors.email AS tutor_email,
    grade_level AS tutor_grade,
    school AS tutor_school,
   misc_info AS tutor_miscInfo,
    active_tutor,
    submission_timestamp AS tutor_submission_timestamp,
    "prek_kindergarten" AS mentor_prek_kindergarten,
   "1st" AS mentor_grade_1,
   "2nd" AS mentor_grade_2,
   "3rd" AS mentor_grade_3,
   "4th" AS mentor_grade_4,
   "5th" AS mentor_grade_5,
   "6th" AS mentor_grade_6,
   "7th" AS mentor_grade_7,
   "8th" AS mentor_grade_8,
   "9th" AS mentor_grade_9,
   "10th" AS mentor_grade_10,
   "11th" AS mentor_grade_11,
   "12th" AS mentor_grade_12,
   subjects_tutors."K5_Math" AS tutor_k5_math,
      subjects_tutors."K5_Reading" AS tutor_k5_reading,
      subjects_tutors."K5_English_Writing" AS tutor_k5_english_writing,
      subjects_tutors."K5_Science" AS tutor_k5_science,
      subjects_tutors."K5_social_studies" AS tutor_k5_social_studies,
      subjects_tutors."6th_to_8th_language_arts" AS tutor_6th_to_8th_language_arts,
      subjects_tutors."6th_to_8th_science" AS tutor_6th_to_8th_science,
      subjects_tutors."6th_to_8th_social_studies" AS tutor_6th_to_8th_social_studies,
      subjects_tutors."math_pre_algebra" AS tutor_math_pre_algebra,
      subjects_tutors."math_alg1_linear_alg" AS tutor_math_alg1_linear_alg,
      subjects_tutors."math_alg2" AS tutor_math_alg2,
      subjects_tutors."math_geom" AS tutor_math_geom,
      subjects_tutors."math_precalc_trig" AS tutor_math_precalc_trig,
      subjects_tutors."sci_bio_life" AS tutor_sci_bio_life,
      subjects_tutors."sci_chem" AS tutor_sci_chem,
      subjects_tutors."sci_physics" AS tutor_sci_physics,
      subjects_tutors."sci_comp_sci" AS tutor_sci_comp_sci,
      subjects_tutors."lang_chinese" AS tutor_lang_chinese,
      subjects_tutors."lang_spanish" AS tutor_lang_spanish,
      subjects_tutors."lang_french" AS tutor_lang_french,
      subjects_tutors."lang_german" AS tutor_lang_german,
          subjects_tutors."hist_world" AS tutor_hist_world,
          subjects_tutors."hist_us" AS tutor_hist_us,
          subjects_tutors."ap_bio" AS tutor_ap_bio,
          subjects_tutors."ap_chem" AS tutor_ap_chem,
          subjects_tutors."ap_physics" AS tutor_ap_physics,
          subjects_tutors."ap_calc_AB" AS tutor_ap_calc_AB,
          subjects_tutors."ap_calc_BC" AS tutor_ap_calc_BC,
          subjects_tutors."ap_stats" AS tutor_ap_stats,
          subjects_tutors."ap_comp_sci" AS tutor_ap_comp_sci,
          subjects_tutors."ap_english_lit_comp" AS tutor_ap_english_lit_comp,
          subjects_tutors."ap_lang_comp" AS tutor_ap_lang_comp,
          subjects_tutors."ap_macro_econ" AS tutor_ap_macro_econ,
          subjects_tutors."ap_micro_econ" AS tutor_ap_micro_econ,
          subjects_tutors."ap_psyc" AS tutor_ap_psyc,
          subjects_tutors."ap_hist_us" AS tutor_ap_hist_us,
  subjects_tutors."ap_gov_politics_us" AS tutor_ap_gov_politics_us,
  subjects_tutors."ap_human_geog" AS tutor_ap_human_geog,
  subjects_tutors."sat_subject_tests" AS tutor_sat_subject_tests,
  subjects_tutors."sat_prep" AS tutor_sat_prep,
  subjects_tutors."act_prep" AS tutor_act_prep,
  subjects_tutors."other" AS tutor_subject_other,
   language."Arabic" AS tutor_language_Arabic,
   language."Chinese" AS tutor_language_Chinese,
   language."French" AS tutor_language_French,
   language."Hmong" AS tutor_language_Hmong,
   language."Somali" AS tutor_language_Somali,
   language."Tagalog" AS tutor_language_Tagalog,
   language."Vietnamese" AS tutor_language_Vietnamese,
   language."Spanish" AS tutor_language_Spanish,
   language."Other" AS tutor_language_Other,
   submission_timestamp

    FROM tutors
  JOIN subjects_tutors ON tutors.subjects_id = subjects_tutors.id
  JOIN "language" ON tutors.language_tutor_id = "language".id
  JOIN mentoring_grade ON tutors.mentoring_grade_id = mentoring_grade.id
  WHERE tutors.active_tutor = true and tutors.matched = false
  and subjects_tutors."${subject1}" = true
  and subjects_tutors."${subject2}" = false
  and subjects_tutors."${subject3}" = false
  and mentoring_grade."${grade}" = true
  ORDER BY tutor_last_name ASC; `;
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
 * POST route template - Manual match with automatic email sending
 */
router.post("/", async (req, res) => {
  console.log("matches.router/post", req.body);
  const submissionTimestamp = new Date(Date.now()).toISOString();
  const queryString = `INSERT INTO "matches" ("tutor_id", "tutee_id", "match_timestamp", "emails_sent", "match_type")
  VALUES ($1, $2, $3, $4, $5)
  RETURNING "id";`;

  let values = [
    req.body.tutor_id,
    req.body.tutee_id,
    submissionTimestamp,
    false, // Will be set to true after emails are sent
    "manual",
  ];

  try {
    const matchResult = await pool.query(queryString, values);
    const matchId = matchResult.rows[0].id;

    // Get tutor and tutee data for email sending
    const tutor = await matchingService.getTutorById(req.body.tutor_id);
    const tutee = await matchingService.getTuteeById(req.body.tutee_id);

    if (tutor && tutee) {
      // Send emails automatically (non-blocking)
      emailService.sendMatchNotifications(matchId, tutor, tutee)
        .then((emailResult) => {
          if (emailResult.success) {
            console.log(`Manual match ${matchId}: Emails sent successfully`);
          } else {
            console.log(`Manual match ${matchId}: Some emails failed:`, emailResult.errors);
          }
        })
        .catch((err) => {
          console.error(`Manual match ${matchId}: Email sending error:`, err.message);
        });
    }

    res.status(201).json({ matchId });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.put("/matchStatus/", (req, res) => {
  console.log("in /MatchStatus - tutor", req.body);
  // Fixed: Using parameterized queries to prevent SQL injection
  const tutorQuery = `UPDATE "tutors" SET matched = true WHERE id = $1;`;
  pool
    .query(tutorQuery, [req.body.tutor_id])
    .then((result) => {
      console.log("in /MatchStatus - tutee", req.body.tutee_id);
      const tuteeQuery = `UPDATE "tutees" SET matched = true WHERE id = $1;`;
      pool
        .query(tuteeQuery, [req.body.tutee_id])
        .then((result) => {
          res.sendStatus(201);
        })
        .catch((err) => {
          console.log("error posting to subject_tutor", err);
          res.sendStatus(500);
        });
    })
    .catch((err) => {
      console.log("changeStatus failed: ", err);
      res.sendStatus(500);
    });
});

/**
 * POST /api/matches/auto-match
 * Run batch auto-matching for all unmatched tutees
 */
router.post("/auto-match", rejectUnauthenticated, async (req, res) => {
  console.log("Running batch auto-matching");
  try {
    const sendEmails = req.body.sendEmails !== false; // Default to true
    const result = await matchingService.runBatchMatching(sendEmails);
    res.status(200).json(result);
  } catch (err) {
    console.error("Batch auto-match error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/matches/auto-match/:tuteeId
 * Auto-match a specific tutee
 */
router.post("/auto-match/:tuteeId", rejectUnauthenticated, async (req, res) => {
  const tuteeId = parseInt(req.params.tuteeId, 10);
  if (isNaN(tuteeId)) {
    return res.status(400).json({ error: "Invalid tutee ID" });
  }

  console.log(`Auto-matching tutee ${tuteeId}`);
  try {
    const sendEmails = req.body.sendEmails !== false; // Default to true
    const result = await matchingService.autoMatchTutee(tuteeId, sendEmails);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(200).json(result); // No match found, but not an error
    }
  } catch (err) {
    console.error(`Auto-match error for tutee ${tuteeId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/matches/:matchId/send-emails
 * Manually trigger emails for an existing match
 */
router.post("/:matchId/send-emails", rejectUnauthenticated, async (req, res) => {
  const matchId = parseInt(req.params.matchId, 10);
  if (isNaN(matchId)) {
    return res.status(400).json({ error: "Invalid match ID" });
  }

  console.log(`Sending emails for match ${matchId}`);
  try {
    // Get match details with tutor and tutee info
    const matchQuery = `
      SELECT
        matches.id,
        tutor_id,
        tutee_id,
        emails_sent,
        tutor_first_name,
        tutor_last_name,
        tutors.phone AS tutor_phone,
        tutors.email AS tutor_email,
        tutors.grade_level AS tutor_grade,
        tutors.school AS tutor_school,
        student_first_name AS tutee_firstname,
        student_last_name AS tutee_lastname,
        student_or_guardian,
        email_guardian,
        email_student,
        tutees.phone AS tutee_phone,
        tutees.grade_level AS tutee_grade,
        tutees.school AS tutee_school,
        tutees.subject_details AS tutee_subject_details,
        tutees.misc_info AS tutee_misc_info,
        Subject1.subject AS subject_1,
        Subject2.subject AS subject_2,
        Subject3.subject AS subject_3
      FROM matches
      JOIN tutors ON matches.tutor_id = tutors.id
      JOIN tutees ON matches.tutee_id = tutees.id
      INNER JOIN subjects_tutees AS Subject1 ON Subject1.id = tutees.subject_1
      INNER JOIN subjects_tutees AS Subject2 ON Subject2.id = tutees.subject_2
      INNER JOIN subjects_tutees AS Subject3 ON Subject3.id = tutees.subject_3
      WHERE matches.id = $1;
    `;

    const matchResult = await pool.query(matchQuery, [matchId]);
    if (matchResult.rows.length === 0) {
      return res.status(404).json({ error: "Match not found" });
    }

    const match = matchResult.rows[0];

    // Format tutor and tutee objects for email service
    const tutor = {
      tutor_first_name: match.tutor_first_name,
      tutor_last_name: match.tutor_last_name,
      tutor_email: match.tutor_email,
      tutor_phone: match.tutor_phone,
      tutor_grade: match.tutor_grade,
      tutor_school: match.tutor_school,
    };

    const tutee = {
      tutee_firstname: match.tutee_firstname,
      tutee_lastname: match.tutee_lastname,
      student_or_guardian: match.student_or_guardian,
      email_guardian: match.email_guardian,
      email_student: match.email_student,
      tutee_phone: match.tutee_phone,
      tutee_grade: match.tutee_grade,
      tutee_school: match.tutee_school,
      tutee_subject_details: match.tutee_subject_details,
      tutee_misc_info: match.tutee_misc_info,
      subject_1: match.subject_1,
      subject_2: match.subject_2,
      subject_3: match.subject_3,
    };

    const emailResult = await emailService.sendMatchNotifications(matchId, tutor, tutee);
    res.status(200).json(emailResult);
  } catch (err) {
    console.error(`Send emails error for match ${matchId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

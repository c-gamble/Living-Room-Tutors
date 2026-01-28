/**
 * Matching Service - Automated tutor-tutee matching algorithm
 *
 * REQUIRED CRITERIA (must both be met):
 * - Grade level match: Tutor can mentor tutee's grade
 * - Subject 1 match: Tutor can teach tutee's primary subject
 *
 * BONUS SCORING (for ranking qualified tutors, max 45 points):
 * - Subject 2 match: 20 points
 * - Subject 3 match: 10 points
 * - Language match: 15 points (shared non-English language)
 *
 * Tie-breaker: Tutor with oldest registration (FIFO)
 */

const pool = require("../modules/pool");
const emailService = require("./emailService");

// Grade level mapping for tutee grades to mentoring_grade column names
const GRADE_COLUMN_MAP = {
  prek_kindergarten: "prek_kindergarten",
  "1st": "1st",
  "2nd": "2nd",
  "3rd": "3rd",
  "4th": "4th",
  "5th": "5th",
  "6th": "6th",
  "7th": "7th",
  "8th": "8th",
  "9th": "9th",
  "10th": "10th",
  "11th": "11th",
  "12th": "12th",
};

// Language columns in the language table
const LANGUAGE_COLUMNS = [
  "Spanish",
  "Somali",
  "Arabic",
  "Chinese",
  "Tagalog",
  "French",
  "Vietnamese",
  "Hmong",
];

// Scoring weights for optional criteria (after required criteria are met)
const SCORING = {
  SUBJECT_2: 20,
  SUBJECT_3: 10,
  LANGUAGE: 15,
};

/**
 * Check if tutor can teach the tutee's first subject (REQUIRED)
 */
function canTeachSubject1(tutor, tutee) {
  if (!tutee.subject_1) return false;
  const key = `tutor_${tutee.subject_1.toLowerCase()}`;
  return tutor[key] === true;
}

/**
 * Check if tutor can mentor the tutee's grade level (REQUIRED)
 */
function canMentorGrade(tutor, tutee) {
  const gradeColumn = GRADE_COLUMN_MAP[tutee.tutee_grade];
  if (!gradeColumn) return false;

  // Handle special case for prek_kindergarten
  if (gradeColumn === "prek_kindergarten") {
    return tutor.mentor_prek_kindergarten === true;
  }

  const mentorGradeKey = `mentor_grade_${gradeColumn.replace(/[^\w]/g, '')}`;
  return tutor[mentorGradeKey] === true;
}

/**
 * Check if tutor meets ALL required criteria
 * Required: Grade level match AND Subject 1 match
 */
function meetsRequirements(tutor, tutee) {
  return canMentorGrade(tutor, tutee) && canTeachSubject1(tutor, tutee);
}

/**
 * Calculate match score between a tutor and tutee
 * Returns -1 if tutor doesn't meet required criteria (grade + subject 1)
 * Otherwise returns bonus score (0-45) for additional matches
 *
 * @param {object} tutor - Tutor data with subjects and mentoring grades
 * @param {object} tutee - Tutee data with subjects and grade level
 * @returns {number} - Match score (-1 if requirements not met, 0-45 for bonus points)
 */
function calculateScore(tutor, tutee) {
  // REQUIRED: Grade level AND Subject 1 must both match
  if (!meetsRequirements(tutor, tutee)) {
    return -1; // Does not meet requirements
  }

  // Base score for meeting requirements
  let score = 0;

  // BONUS: Subject 2 match
  if (tutee.subject_2 && tutor[`tutor_${tutee.subject_2.toLowerCase()}`] === true) {
    score += SCORING.SUBJECT_2;
  }

  // BONUS: Subject 3 match
  if (tutee.subject_3 && tutor[`tutor_${tutee.subject_3.toLowerCase()}`] === true) {
    score += SCORING.SUBJECT_3;
  }

  // BONUS: Language match (shared non-English language)
  for (const lang of LANGUAGE_COLUMNS) {
    const tutorLangKey = `tutor_language_${lang}`;
    const tuteeLangKey = `tutee_language_${lang}`;
    if (tutor[tutorLangKey] === true && tutee[tuteeLangKey] === true) {
      score += SCORING.LANGUAGE;
      break; // Only count language bonus once
    }
  }

  return score;
}

/**
 * Get all available tutors (active and not matched)
 */
async function getAvailableTutors() {
  const query = `
    SELECT
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
      mentoring_grade."prek_kindergarten" AS mentor_prek_kindergarten,
      mentoring_grade."1st" AS mentor_grade_1st,
      mentoring_grade."2nd" AS mentor_grade_2nd,
      mentoring_grade."3rd" AS mentor_grade_3rd,
      mentoring_grade."4th" AS mentor_grade_4th,
      mentoring_grade."5th" AS mentor_grade_5th,
      mentoring_grade."6th" AS mentor_grade_6th,
      mentoring_grade."7th" AS mentor_grade_7th,
      mentoring_grade."8th" AS mentor_grade_8th,
      mentoring_grade."9th" AS mentor_grade_9th,
      mentoring_grade."10th" AS mentor_grade_10th,
      mentoring_grade."11th" AS mentor_grade_11th,
      mentoring_grade."12th" AS mentor_grade_12th,
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
      subjects_tutors."ap_calc_AB" AS tutor_ap_calc_ab,
      subjects_tutors."ap_calc_BC" AS tutor_ap_calc_bc,
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
      language."Other" AS tutor_language_Other
    FROM tutors
    JOIN subjects_tutors ON tutors.subjects_id = subjects_tutors.id
    JOIN "language" ON tutors.language_tutor_id = "language".id
    JOIN mentoring_grade ON tutors.mentoring_grade_id = mentoring_grade.id
    WHERE tutors.active_tutor = true AND tutors.matched = false
    ORDER BY submission_timestamp ASC;
  `;

  const result = await pool.query(query);
  return result.rows;
}

/**
 * Get a single tutee by ID with all necessary data
 */
async function getTuteeById(tuteeId) {
  const query = `
    SELECT
      tutee.id,
      student_first_name AS tutee_firstname,
      student_last_name AS tutee_lastname,
      pronouns AS tutee_pronouns,
      student_or_guardian,
      email_guardian,
      email_student,
      phone AS tutee_phone,
      grade_level AS tutee_grade,
      school AS tutee_school,
      subject_other AS tutee_subject_other,
      subject_details AS tutee_subject_details,
      misc_info AS tutee_misc_info,
      submission_timestamp AS tutee_submission_timestamp,
      active_tutee,
      matched AS tutee_matched,
      Subject1.subject AS subject_1,
      Subject2.subject AS subject_2,
      Subject3.subject AS subject_3,
      language."Arabic" AS tutee_language_Arabic,
      language."Chinese" AS tutee_language_Chinese,
      language."French" AS tutee_language_French,
      language."Hmong" AS tutee_language_Hmong,
      language."Somali" AS tutee_language_Somali,
      language."Tagalog" AS tutee_language_Tagalog,
      language."Vietnamese" AS tutee_language_Vietnamese,
      language."Spanish" AS tutee_language_Spanish,
      language."Other" AS tutee_language_Other
    FROM tutees AS tutee
    INNER JOIN subjects_tutees AS Subject1 ON Subject1.id = tutee.subject_1
    INNER JOIN subjects_tutees AS Subject2 ON Subject2.id = tutee.subject_2
    INNER JOIN subjects_tutees AS Subject3 ON Subject3.id = tutee.subject_3
    JOIN "language" ON tutee.language_tutee_id = "language".id
    WHERE tutee.id = $1;
  `;

  const result = await pool.query(query, [tuteeId]);
  return result.rows[0] || null;
}

/**
 * Get a single tutor by ID with all necessary data
 */
async function getTutorById(tutorId) {
  const query = `
    SELECT
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
      matched AS tutor_matched,
      submission_timestamp AS tutor_submission_timestamp,
      mentoring_grade."prek_kindergarten" AS mentor_prek_kindergarten,
      mentoring_grade."1st" AS mentor_grade_1st,
      mentoring_grade."2nd" AS mentor_grade_2nd,
      mentoring_grade."3rd" AS mentor_grade_3rd,
      mentoring_grade."4th" AS mentor_grade_4th,
      mentoring_grade."5th" AS mentor_grade_5th,
      mentoring_grade."6th" AS mentor_grade_6th,
      mentoring_grade."7th" AS mentor_grade_7th,
      mentoring_grade."8th" AS mentor_grade_8th,
      mentoring_grade."9th" AS mentor_grade_9th,
      mentoring_grade."10th" AS mentor_grade_10th,
      mentoring_grade."11th" AS mentor_grade_11th,
      mentoring_grade."12th" AS mentor_grade_12th,
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
      subjects_tutors."ap_calc_AB" AS tutor_ap_calc_ab,
      subjects_tutors."ap_calc_BC" AS tutor_ap_calc_bc,
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
      language."Other" AS tutor_language_Other
    FROM tutors
    JOIN subjects_tutors ON tutors.subjects_id = subjects_tutors.id
    JOIN "language" ON tutors.language_tutor_id = "language".id
    JOIN mentoring_grade ON tutors.mentoring_grade_id = mentoring_grade.id
    WHERE tutors.id = $1;
  `;

  const result = await pool.query(query, [tutorId]);
  return result.rows[0] || null;
}

/**
 * Get all unmatched active tutees
 */
async function getUnmatchedTutees() {
  const query = `
    SELECT
      tutee.id,
      student_first_name AS tutee_firstname,
      student_last_name AS tutee_lastname,
      pronouns AS tutee_pronouns,
      student_or_guardian,
      email_guardian,
      email_student,
      phone AS tutee_phone,
      grade_level AS tutee_grade,
      school AS tutee_school,
      subject_other AS tutee_subject_other,
      subject_details AS tutee_subject_details,
      misc_info AS tutee_misc_info,
      submission_timestamp AS tutee_submission_timestamp,
      active_tutee,
      matched AS tutee_matched,
      Subject1.subject AS subject_1,
      Subject2.subject AS subject_2,
      Subject3.subject AS subject_3,
      language."Arabic" AS tutee_language_Arabic,
      language."Chinese" AS tutee_language_Chinese,
      language."French" AS tutee_language_French,
      language."Hmong" AS tutee_language_Hmong,
      language."Somali" AS tutee_language_Somali,
      language."Tagalog" AS tutee_language_Tagalog,
      language."Vietnamese" AS tutee_language_Vietnamese,
      language."Spanish" AS tutee_language_Spanish,
      language."Other" AS tutee_language_Other
    FROM tutees AS tutee
    INNER JOIN subjects_tutees AS Subject1 ON Subject1.id = tutee.subject_1
    INNER JOIN subjects_tutees AS Subject2 ON Subject2.id = tutee.subject_2
    INNER JOIN subjects_tutees AS Subject3 ON Subject3.id = tutee.subject_3
    JOIN "language" ON tutee.language_tutee_id = "language".id
    WHERE tutee.active_tutee = true AND tutee.matched = false
    ORDER BY submission_timestamp ASC;
  `;

  const result = await pool.query(query);
  return result.rows;
}

/**
 * Find the best matching tutor for a specific tutee
 * Required criteria: Tutor must be able to teach subject 1 AND mentor tutee's grade
 * Tie-breaker: Higher bonus score, then oldest registration (FIFO)
 *
 * @param {number} tuteeId - The tutee's database ID
 * @returns {object|null} - { tutor, tutee, score } or null if no match found
 */
async function findBestMatch(tuteeId) {
  const tutee = await getTuteeById(tuteeId);
  if (!tutee) {
    console.log(`Tutee ${tuteeId} not found`);
    return null;
  }

  if (tutee.tutee_matched) {
    console.log(`Tutee ${tuteeId} is already matched`);
    return null;
  }

  if (!tutee.active_tutee) {
    console.log(`Tutee ${tuteeId} is not active`);
    return null;
  }

  const availableTutors = await getAvailableTutors();
  if (availableTutors.length === 0) {
    console.log(`No available tutors for tutee ${tuteeId}`);
    return null;
  }

  // Calculate scores for all tutors and filter out those who don't meet requirements
  const qualifiedTutors = availableTutors
    .map((tutor) => ({
      tutor,
      score: calculateScore(tutor, tutee),
    }))
    .filter((item) => item.score >= 0); // Score of -1 means requirements not met

  if (qualifiedTutors.length === 0) {
    console.log(
      `No tutors meet requirements for tutee ${tuteeId} (${tutee.tutee_firstname}) - need grade ${tutee.tutee_grade} and subject ${tutee.subject_1}`
    );
    return null;
  }

  // Sort by score (descending), then by submission timestamp (ascending for FIFO)
  qualifiedTutors.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Tie-breaker: older registration first (FIFO)
    return new Date(a.tutor.tutor_submission_timestamp) - new Date(b.tutor.tutor_submission_timestamp);
  });

  const bestMatch = qualifiedTutors[0];

  console.log(
    `Best match for tutee ${tuteeId} (${tutee.tutee_firstname}): tutor ${bestMatch.tutor.id} (${bestMatch.tutor.tutor_first_name}) with bonus score ${bestMatch.score}`
  );

  return {
    tutor: bestMatch.tutor,
    tutee,
    score: bestMatch.score,
  };
}

/**
 * Create a match record in the database
 * @param {number} tutorId - Tutor ID
 * @param {number} tuteeId - Tutee ID
 * @param {number} score - Match score
 * @param {string} matchType - 'auto' or 'manual'
 * @returns {number} - The new match ID
 */
async function createMatchRecord(tutorId, tuteeId, score, matchType = "auto") {
  const submissionTimestamp = new Date().toISOString();

  const insertQuery = `
    INSERT INTO "matches" ("tutor_id", "tutee_id", "match_timestamp", "emails_sent", "match_type", "match_score")
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING "id";
  `;

  const result = await pool.query(insertQuery, [
    tutorId,
    tuteeId,
    submissionTimestamp,
    false,
    matchType,
    score,
  ]);

  const matchId = result.rows[0].id;

  // Update tutor and tutee matched status
  await pool.query(`UPDATE "tutors" SET matched = true WHERE id = $1`, [tutorId]);
  await pool.query(`UPDATE "tutees" SET matched = true WHERE id = $1`, [tuteeId]);

  return matchId;
}

/**
 * Execute auto-match for a specific tutee, create match record, and send emails
 * @param {number} tuteeId - The tutee's database ID
 * @param {boolean} sendEmails - Whether to send notification emails (default: true)
 * @returns {object} - Match result with status
 */
async function autoMatchTutee(tuteeId, sendEmails = true) {
  const matchResult = await findBestMatch(tuteeId);

  if (!matchResult) {
    return {
      success: false,
      tuteeId,
      reason: "No tutor available who can teach subject 1 AND mentor tutee's grade level",
    };
  }

  const { tutor, tutee, score } = matchResult;

  // Create the match record
  const matchId = await createMatchRecord(tutor.id, tutee.id, score, "auto");

  const result = {
    success: true,
    matchId,
    tutorId: tutor.id,
    tutorName: `${tutor.tutor_first_name} ${tutor.tutor_last_name}`,
    tuteeId: tutee.id,
    tuteeName: `${tutee.tutee_firstname} ${tutee.tutee_lastname}`,
    score,
    matchType: "auto",
  };

  // Send notification emails if requested
  if (sendEmails) {
    try {
      const emailResult = await emailService.sendMatchNotifications(matchId, tutor, tutee);
      result.emailsSent = emailResult.emailsSent;
      result.emailErrors = emailResult.errors;
    } catch (err) {
      console.error(`Failed to send emails for match ${matchId}:`, err.message);
      result.emailsSent = [];
      result.emailErrors = [{ type: "general", message: err.message }];
    }
  }

  return result;
}

/**
 * Run batch auto-matching for all unmatched tutees
 * @param {boolean} sendEmails - Whether to send notification emails (default: true)
 * @returns {object} - { matches: [], needsReview: [] }
 */
async function runBatchMatching(sendEmails = true) {
  const unmatchedTutees = await getUnmatchedTutees();
  const matches = [];
  const needsReview = [];

  console.log(`Starting batch matching for ${unmatchedTutees.length} unmatched tutees`);

  for (const tutee of unmatchedTutees) {
    const result = await autoMatchTutee(tutee.id, sendEmails);

    if (result.success) {
      matches.push(result);
    } else {
      needsReview.push({
        tuteeId: tutee.id,
        tuteeName: `${tutee.tutee_firstname} ${tutee.tutee_lastname}`,
        reason: result.reason,
      });
    }
  }

  console.log(`Batch matching complete: ${matches.length} matches, ${needsReview.length} need review`);

  return {
    matches,
    needsReview,
    totalProcessed: unmatchedTutees.length,
  };
}

/**
 * Find the best matching tutee for a specific tutor
 * This is the reverse of findBestMatch - used when a new tutor registers
 * to match them with a waiting tutee.
 *
 * @param {number} tutorId - The tutor's database ID
 * @returns {object|null} - { tutor, tutee, score } or null if no match found
 */
async function findBestTuteeForTutor(tutorId) {
  const tutor = await getTutorById(tutorId);
  if (!tutor) {
    console.log(`Tutor ${tutorId} not found`);
    return null;
  }

  if (tutor.tutor_matched) {
    console.log(`Tutor ${tutorId} is already matched`);
    return null;
  }

  if (!tutor.active_tutor) {
    console.log(`Tutor ${tutorId} is not active`);
    return null;
  }

  const unmatchedTutees = await getUnmatchedTutees();
  if (unmatchedTutees.length === 0) {
    console.log(`No unmatched tutees available for tutor ${tutorId}`);
    return null;
  }

  // Calculate scores for all tutees and filter out those who don't meet requirements
  const qualifiedTutees = unmatchedTutees
    .map((tutee) => ({
      tutee,
      score: calculateScore(tutor, tutee),
    }))
    .filter((item) => item.score >= 0); // Score of -1 means requirements not met

  if (qualifiedTutees.length === 0) {
    console.log(
      `No tutees match tutor ${tutorId} (${tutor.tutor_first_name})'s subjects/grades`
    );
    return null;
  }

  // Sort by score (descending), then by submission timestamp (ascending for FIFO - oldest tutee first)
  qualifiedTutees.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Tie-breaker: oldest tutee first (FIFO - they've been waiting longest)
    return new Date(a.tutee.tutee_submission_timestamp) - new Date(b.tutee.tutee_submission_timestamp);
  });

  const bestMatch = qualifiedTutees[0];

  console.log(
    `Best tutee for tutor ${tutorId} (${tutor.tutor_first_name}): tutee ${bestMatch.tutee.id} (${bestMatch.tutee.tutee_firstname}) with bonus score ${bestMatch.score}`
  );

  return {
    tutor,
    tutee: bestMatch.tutee,
    score: bestMatch.score,
  };
}

/**
 * Execute auto-match for a specific tutor (find best waiting tutee)
 * Used when a new tutor registers to immediately match them with a waiting tutee
 *
 * @param {number} tutorId - The tutor's database ID
 * @param {boolean} sendEmails - Whether to send notification emails (default: true)
 * @returns {object} - Match result with status
 */
async function autoMatchTutor(tutorId, sendEmails = true) {
  const matchResult = await findBestTuteeForTutor(tutorId);

  if (!matchResult) {
    return {
      success: false,
      tutorId,
      reason: "No waiting tutee matches this tutor's subjects and grade levels",
    };
  }

  const { tutor, tutee, score } = matchResult;

  // Create the match record
  const matchId = await createMatchRecord(tutor.id, tutee.id, score, "auto");

  const result = {
    success: true,
    matchId,
    tutorId: tutor.id,
    tutorName: `${tutor.tutor_first_name} ${tutor.tutor_last_name}`,
    tuteeId: tutee.id,
    tuteeName: `${tutee.tutee_firstname} ${tutee.tutee_lastname}`,
    score,
    matchType: "auto",
  };

  // Send notification emails if requested
  if (sendEmails) {
    try {
      const emailResult = await emailService.sendMatchNotifications(matchId, tutor, tutee);
      result.emailsSent = emailResult.emailsSent;
      result.emailErrors = emailResult.errors;
    } catch (err) {
      console.error(`Failed to send emails for match ${matchId}:`, err.message);
      result.emailsSent = [];
      result.emailErrors = [{ type: "general", message: err.message }];
    }
  }

  return result;
}

module.exports = {
  calculateScore,
  meetsRequirements,
  canTeachSubject1,
  canMentorGrade,
  findBestMatch,
  findBestTuteeForTutor,
  autoMatchTutee,
  autoMatchTutor,
  runBatchMatching,
  createMatchRecord,
  getAvailableTutors,
  getTutorById,
  getTuteeById,
  getUnmatchedTutees,
  SCORING,
};

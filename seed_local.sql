-- Local-friendly seed script with working foreign keys.
-- Usage: psql -d living_room_tutors -f seed_local.sql

-- Optional: clear existing data if you want a clean slate each run.
-- TRUNCATE matches, tutors, tutees, mentoring_grade, subjects_tutors, language, admin RESTART IDENTITY CASCADE;

-- Sample tutors
WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (true, false, false, false, false, false, false, false)
  RETURNING id
), subj AS (
  INSERT INTO "subjects_tutors" ("K5_Math", "K5_Reading", "K5_English_Writing", "K5_social_studies", "K5_Science", "6th_to_8th_language_arts", "6th_to_8th_science", "6th_to_8th_social_studies", "math_pre_algebra", "math_alg1_linear_alg", "math_alg2", "math_geom", "math_precalc_trig", "sci_bio_life", "sci_chem", "sci_physics", "sci_comp_sci", "lang_chinese", "lang_spanish", "lang_french", "lang_german", "hist_world", "hist_us", "ap_bio", "ap_chem", "ap_physics", "ap_calc_AB", "ap_calc_BC", "ap_stats", "ap_comp_sci", "ap_english_lit_comp", "ap_lang_comp", "ap_macro_econ", "ap_micro_econ", "ap_psyc", "ap_hist_us", "ap_gov_politics_us", "ap_human_geog", "sat_subject_tests", "sat_prep", "act_prep")
  VALUES (false, false, false, false, false, false, false, false, true, true, true, true, false, false, false, true, true, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, true, true, false, false)
  RETURNING id
), grade AS (
  INSERT INTO "mentoring_grade" ("prek_kindergarten", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th")
  VALUES (false, false, false, false, false, false, true, true, true, true, true, true, true)
  RETURNING id
)
INSERT INTO "tutors" ("tutor_first_name", "tutor_last_name", "pronouns", "phone", "email", "grade_level", "school", "mentoring_grade_id", "language_tutor_id", "subjects_id", "misc_info", "submission_timestamp", "active_tutor", "matched")
SELECT 'Alex', 'Rivera', 'he/him', '5075174954', 'alex.rivera@example.com', 'In College', 'UMN Twin Cities', grade.id, lang.id, subj.id, 'Enjoys math and physics tutoring', '2022-01-09 15:15:01', true, false FROM lang, subj, grade;

WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (false, false, false, true, false, false, false, false)
  RETURNING id
), subj AS (
  INSERT INTO "subjects_tutors" ("K5_Math", "K5_Reading", "K5_English_Writing", "K5_social_studies", "K5_Science", "6th_to_8th_language_arts", "6th_to_8th_science", "6th_to_8th_social_studies", "math_pre_algebra", "math_alg1_linear_alg", "math_alg2", "math_geom", "math_precalc_trig", "sci_bio_life", "sci_chem", "sci_physics", "sci_comp_sci", "lang_chinese", "lang_spanish", "lang_french", "lang_german", "hist_world", "hist_us", "ap_bio", "ap_chem", "ap_physics", "ap_calc_AB", "ap_calc_BC", "ap_stats", "ap_comp_sci", "ap_english_lit_comp", "ap_lang_comp", "ap_macro_econ", "ap_micro_econ", "ap_psyc", "ap_hist_us", "ap_gov_politics_us", "ap_human_geog", "sat_subject_tests", "sat_prep", "act_prep")
  VALUES (true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false)
  RETURNING id
), grade AS (
  INSERT INTO "mentoring_grade" ("prek_kindergarten", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th")
  VALUES (true, true, true, true, true, true, true, true, false, false, false, false, false)
  RETURNING id
)
INSERT INTO "tutors" ("tutor_first_name", "tutor_last_name", "pronouns", "phone", "email", "grade_level", "school", "mentoring_grade_id", "language_tutor_id", "subjects_id", "misc_info", "submission_timestamp", "active_tutor", "matched")
SELECT 'Bianca', 'Chen', 'she/her', '5075174954', 'bianca.chen@example.com', 'Senior', 'Mayo High School', grade.id, lang.id, subj.id, 'Strong reading/writing support for K-8', '2022-01-09 21:01:04', true, false FROM lang, subj, grade;

WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (true, false, false, false, false, false, false, false)
  RETURNING id
), subj AS (
  INSERT INTO "subjects_tutors" ("K5_Math", "K5_Reading", "K5_English_Writing", "K5_social_studies", "K5_Science", "6th_to_8th_language_arts", "6th_to_8th_science", "6th_to_8th_social_studies", "math_pre_algebra", "math_alg1_linear_alg", "math_alg2", "math_geom", "math_precalc_trig", "sci_bio_life", "sci_chem", "sci_physics", "sci_comp_sci", "lang_chinese", "lang_spanish", "lang_french", "lang_german", "hist_world", "hist_us", "ap_bio", "ap_chem", "ap_physics", "ap_calc_AB", "ap_calc_BC", "ap_stats", "ap_comp_sci", "ap_english_lit_comp", "ap_lang_comp", "ap_macro_econ", "ap_micro_econ", "ap_psyc", "ap_hist_us", "ap_gov_politics_us", "ap_human_geog", "sat_subject_tests", "sat_prep", "act_prep")
  VALUES (false, false, false, false, false, false, false, false, true, true, true, false, false, true, true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, true, true, false)
  RETURNING id
), grade AS (
  INSERT INTO "mentoring_grade" ("prek_kindergarten", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th")
  VALUES (false, false, false, false, false, false, true, true, true, true, true, false, false)
  RETURNING id
)
INSERT INTO "tutors" ("tutor_first_name", "tutor_last_name", "pronouns", "phone", "email", "grade_level", "school", "mentoring_grade_id", "language_tutor_id", "subjects_id", "misc_info", "submission_timestamp", "active_tutor", "matched")
SELECT 'Carlos', 'Mejia', 'he/him', '5075174954', 'carlos.mejia@example.com', 'Junior', 'Woodbury High School', grade.id, lang.id, subj.id, 'Math and AP stats focus', '2021-12-11 00:31:02', true, false FROM lang, subj, grade;

WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (false, false, false, true, false, false, false, false)
  RETURNING id
), subj AS (
  INSERT INTO "subjects_tutors" ("K5_Math", "K5_Reading", "K5_English_Writing", "K5_social_studies", "K5_Science", "6th_to_8th_language_arts", "6th_to_8th_science", "6th_to_8th_social_studies", "math_pre_algebra", "math_alg1_linear_alg", "math_alg2", "math_geom", "math_precalc_trig", "sci_bio_life", "sci_chem", "sci_physics", "sci_comp_sci", "lang_chinese", "lang_spanish", "lang_french", "lang_german", "hist_world", "hist_us", "ap_bio", "ap_chem", "ap_physics", "ap_calc_AB", "ap_calc_BC", "ap_stats", "ap_comp_sci", "ap_english_lit_comp", "ap_lang_comp", "ap_macro_econ", "ap_micro_econ", "ap_psyc", "ap_hist_us", "ap_gov_politics_us", "ap_human_geog", "sat_subject_tests", "sat_prep", "act_prep")
  VALUES (false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, true, false, false, false, false, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false)
  RETURNING id
), grade AS (
  INSERT INTO "mentoring_grade" ("prek_kindergarten", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th")
  VALUES (false, false, false, false, false, false, true, true, true, true, true, true, true)
  RETURNING id
)
INSERT INTO "tutors" ("tutor_first_name", "tutor_last_name", "pronouns", "phone", "email", "grade_level", "school", "mentoring_grade_id", "language_tutor_id", "subjects_id", "misc_info", "submission_timestamp", "active_tutor", "matched")
SELECT 'Dana', 'Liu', 'she/her', '5075174954', 'dana.liu@example.com', 'In College', 'U of M Rochester', grade.id, lang.id, subj.id, 'Chemistry and biology tutor; fluent in Chinese', '2022-01-10 19:09:15', true, false FROM lang, subj, grade;

-- Sample tutees
WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (false, false, true, false, false, false, false, false)
  RETURNING id
)
INSERT INTO "tutees" ("student_first_name", "student_last_name", "pronouns", "student_or_guardian", "email_guardian", "email_student", "phone", "grade_level", "school", "language_tutee_id", "subject_1", "subject_2", "subject_3", "subject_other", "subject_details", "misc_info", "submission_timestamp", "active_tutee", "matched")
SELECT 'Emilis', 'Terrell', 'she/her', 'Student', 'guardian@example.com', 'tutee.lrtmatching@gmail.com', '5075174954', 'Kindergarten', 'Central High School', lang.id, 7, 9, 1, NULL, 'General help', NULL, '2022-01-09 15:15:01', true, false FROM lang;

WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (false, false, false, true, false, false, false, false)
  RETURNING id
)
INSERT INTO "tutees" ("student_first_name", "student_last_name", "pronouns", "student_or_guardian", "email_guardian", "email_student", "phone", "grade_level", "school", "language_tutee_id", "subject_1", "subject_2", "subject_3", "subject_other", "subject_details", "misc_info", "submission_timestamp", "active_tutee", "matched")
SELECT 'Rita', 'Dai', 'she/her', 'Student', 'guardian2@example.com', 'tutee.lrtmatching@gmail.com', '5075174954', '3rd', 'Hoover Elementary', lang.id, 1, 2, 3, NULL, 'Needs math and reading support', NULL, '2022-01-09 15:15:01', true, false FROM lang;

WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (false, false, false, false, false, false, false, false)
  RETURNING id
)
INSERT INTO "tutees" ("student_first_name", "student_last_name", "pronouns", "student_or_guardian", "email_guardian", "email_student", "phone", "grade_level", "school", "language_tutee_id", "subject_1", "subject_2", "subject_3", "subject_other", "subject_details", "misc_info", "submission_timestamp", "active_tutee", "matched")
SELECT 'Demetrius', 'Lambert', 'he/him', 'ParentOrGuardian', 'guardian3@example.com', 'tutee.lrtmatching@gmail.com', '5075174954', '5th', 'Washington Elementary', lang.id, 9, 3, 2, NULL, 'Low in math and reading; weekly help', NULL, '2021-12-13 13:01:32', true, false FROM lang;

WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (false, false, false, false, false, false, false, false)
  RETURNING id
)
INSERT INTO "tutees" ("student_first_name", "student_last_name", "pronouns", "student_or_guardian", "email_guardian", "email_student", "phone", "grade_level", "school", "language_tutee_id", "subject_1", "subject_2", "subject_3", "subject_other", "subject_details", "misc_info", "submission_timestamp", "active_tutee", "matched")
SELECT 'Kyan', 'Patrick', 'he/him', 'Student', 'guardian4@example.com', 'tutee.lrtmatching@gmail.com', '5075174954', '9th', 'Century High School', lang.id, 20, 14, 15, NULL, 'Needs conversation practice for Spanish and science help', NULL, '2021-10-24 17:19:14', true, false FROM lang;

WITH lang AS (
  INSERT INTO "language" ("Spanish", "Somali", "Arabic", "Chinese", "Tagalog", "French", "Vietnamese", "Hmong")
  VALUES (false, false, false, false, false, false, false, false)
  RETURNING id
)
INSERT INTO "tutees" ("student_first_name", "student_last_name", "pronouns", "student_or_guardian", "email_guardian", "email_student", "phone", "grade_level", "school", "language_tutee_id", "subject_1", "subject_2", "subject_3", "subject_other", "subject_details", "misc_info", "submission_timestamp", "active_tutee", "matched")
SELECT 'Isabelle', 'Pearson', 'she/her', 'ParentOrGuardian', 'guardian5@example.com', 'tutee.lrtmatching@gmail.com', '5075174954', '9th', 'Byron High School', lang.id, 10, 9, 11, NULL, 'Algebra I support; currently struggling', NULL, '2021-10-27 13:21:19', true, false FROM lang;

-- Admin seed (username = first_name)
INSERT INTO "admin" ("first_name", "last_name", "email", "phone", "password")
VALUES ('admin', 'User', 'admin@example.com', '0000000000', '$2a$10$CwTycUXWue0Thq9StjUM0uJ8X7ci3CH6fT/59NcCrJOVU0QpK.Ye.');

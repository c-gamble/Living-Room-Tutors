/**
 * Email templates for tutor-tutee matching notifications
 * Extracted from CompleteMatchButton.js frontend component
 */

// Subject mapping for converting database names to display names
const subjects = [
  { name: "K-5 Math", dbname: "K5_Math" },
  { name: "K-5 Reading", dbname: "K5_Reading" },
  { name: "K-5 English/Writing", dbname: "K5_English_Writing" },
  { name: "K-5 Social Studies", dbname: "K5_Science" },
  { name: "K-5 Science", dbname: "K5_social_studies" },
  { name: "6-8th Language Arts", dbname: "6th_to_8th_language_arts" },
  { name: "6-8th Science", dbname: "6th_to_8th_science" },
  { name: "6-8th Social Studies", dbname: "6th_to_8th_social_studies" },
  { name: "Pre-Algebra", dbname: "math_pre_algebra" },
  { name: "Algebra I/ Linear Algebra", dbname: "math_alg1_linear_alg" },
  { name: "Algebra II", dbname: "math_alg2" },
  { name: "Geometry", dbname: "math_geom" },
  { name: "Precalculus/Trigonometry", dbname: "math_precalc_trig" },
  { name: "Biology/Life Sciences", dbname: "sci_bio_life" },
  { name: "Chemistry", dbname: "sci_chem" },
  { name: "Physics", dbname: "sci_physics" },
  { name: "Computer Science", dbname: "sci_comp_sci" },
  { name: "Chinese", dbname: "lang_chinese" },
  { name: "Spanish", dbname: "lang_spanish" },
  { name: "French", dbname: "lang_french" },
  { name: "German", dbname: "lang_german" },
  { name: "World History", dbname: "hist_world" },
  { name: "U.S. History", dbname: "hist_us" },
  { name: "AP/Honors Biology", dbname: "ap_bio" },
  { name: "AP/Honors Chemistry", dbname: "ap_chem" },
  { name: "AP/Honors Physics", dbname: "ap_physics" },
  { name: "AP/Honors Calculus AB", dbname: "ap_calc_AB" },
  { name: "AP/Honors Calculus BC", dbname: "ap_calc_BC" },
  { name: "AP/Honors Statistics", dbname: "ap_stats" },
  { name: "AP/Honors Computer Science", dbname: "ap_comp_sci" },
  { name: "AP/Honors English Literature and Composition", dbname: "ap_english_lit_comp" },
  { name: "AP/Honors Language and Composition", dbname: "ap_lang_comp" },
  { name: "AP/Honors Macroeconomics", dbname: "ap_macro_econ" },
  { name: "AP/Honors Microeconomics", dbname: "ap_micro_econ" },
  { name: "AP/Honors Psychology", dbname: "ap_psyc" },
  { name: "AP/Honors United States History", dbname: "ap_hist_us" },
  { name: "AP/Honors Government and Politics (US)", dbname: "ap_gov_politics_us" },
  { name: "AP/Honors Human Geography", dbname: "ap_human_geog" },
  { name: "SAT Subject Tests", dbname: "sat_subject_tests" },
  { name: "SAT Prep", dbname: "sat_prep" },
  { name: "ACT Prep", dbname: "act_prep" },
];

/**
 * Convert database subject name to display name
 */
function getSubjectDisplayName(dbname) {
  const subject = subjects.find(s => s.dbname === dbname);
  return subject ? subject.name : dbname;
}

/**
 * Format grade level for display
 */
function formatGradeLevel(grade) {
  if (grade === "prek_kindergarten") {
    return "Pre-K/Kindergarten";
  }
  if (grade === "In College") {
    return "College";
  }
  return grade + " grade";
}

/**
 * Generate email to tutor notifying them of their match
 */
function tutorMatchEmail(tutor, tutee) {
  const subject1 = getSubjectDisplayName(tutee.subject_1);
  const subject2 = getSubjectDisplayName(tutee.subject_2);
  const subject3 = getSubjectDisplayName(tutee.subject_3);

  const additionalComments =
    (tutee.tutee_misc_info || tutee.tutee_subject_details)
      ? `Additional comments include: ${tutee.tutee_misc_info || ''} ${tutee.tutee_subject_details || ''}`
      : '';

  const contactInfo = [
    tutee.email_student ? `${tutee.tutee_firstname}'s email: ${tutee.email_student}` : '',
    tutee.email_guardian ? `Guardian's email: ${tutee.email_guardian}` : '',
    `Phone: ${tutee.tutee_phone}`
  ].filter(Boolean).join('\n');

  const html = `
    <div>
      <p>Dear ${tutor.tutor_first_name} ${tutor.tutor_last_name},</p>

      <p>Great News! You have been matched! We are honored to have you join the LRT family as an official Living Room Tutor.</p>

      <p>After careful consideration of your application, we feel that your best tutee match is <b>${tutee.tutee_firstname} ${tutee.tutee_lastname}</b>. ${tutee.tutee_firstname} is in ${formatGradeLevel(tutee.tutee_grade)} and attends <b>${tutee.tutee_school}</b>. Below, you will find ${tutee.tutee_firstname}'s contact information.</p>

      <p>We will also be reaching out to ${tutee.tutee_firstname} with the news, and we will cc you in that email. From there, you may start communication and determine a meeting time with your tutee.</p>

      <p>${tutee.tutee_firstname} needs the most help in: <b>${subject1}, ${subject2}, and ${subject3}.</b></p>

      ${additionalComments ? `<p>${additionalComments}</p>` : ''}

      <p>Don't worry if you cannot help with all of the subjects listed. There will be LRT guide documents linked below. Please review the documents thoroughly. As well as guidelines, expectations, and resources, it contains information about certifying volunteer hours and a tutoring exit form for when you would like to discontinue service with your tutee.</p>

      <p>Note: It is the responsibility of the tutor to initiate communication with the tutee and/or their family. If your tutee does not respond to your message after 7 business days, please contact us. Thank you for giving back to your community; you are making a vital impact on the future of these bright learners. Your influence is truly boundless.</p>

      <p>If you ever have any questions or concerns, do not hesitate to reach out. Email us at team@livingroomtutors.com.</p>

      <p>Our team at LRT wishes you and ${tutee.tutee_firstname} the best!</p>

      <p>Take Care,</p>
      <p><b>Living Room Tutors Team</b></p>

      <p><u>Contact Information:</u><br/>
      ${contactInfo.replace(/\n/g, '<br/>')}</p>

      <p><u>LRT Tutor Documents:</u><br/>
      <a href="https://docs.google.com/document/d/1iLv0qmxogcVK0bEjOEHcaxGSfnyEhC3dsoOwiO88PyQ/edit?usp=sharing">Tutor Guide</a><br/>
      <a href="https://docs.google.com/presentation/d/1P2iS4r5KldjDjzYzU3Wy9FOSiFMSmdZBCegxTdIWzrE/edit?usp=sharing">Tutor Training Modules</a></p>
    </div>
  `;

  const text = `
Dear ${tutor.tutor_first_name} ${tutor.tutor_last_name},

Great News! You have been matched! We are honored to have you join the LRT family as an official Living Room Tutor.

After careful consideration of your application, we feel that your best tutee match is ${tutee.tutee_firstname} ${tutee.tutee_lastname}. ${tutee.tutee_firstname} is in ${formatGradeLevel(tutee.tutee_grade)} and attends ${tutee.tutee_school}. Below, you will find ${tutee.tutee_firstname}'s contact information.

We will also be reaching out to ${tutee.tutee_firstname} with the news, and we will cc you in that email. From there, you may start communication and determine a meeting time with your tutee.

${tutee.tutee_firstname} needs the most help in: ${subject1}, ${subject2}, and ${subject3}.

${additionalComments}

Don't worry if you cannot help with all of the subjects listed. There will be LRT guide documents linked below. Please review the documents thoroughly. As well as guidelines, expectations, and resources, it contains information about certifying volunteer hours and a tutoring exit form for when you would like to discontinue service with your tutee.

Note: It is the responsibility of the tutor to initiate communication with the tutee and/or their family. If your tutee does not respond to your message after 7 business days, please contact us. Thank you for giving back to your community; you are making a vital impact on the future of these bright learners. Your influence is truly boundless.

If you ever have any questions or concerns, do not hesitate to reach out. Email us at team@livingroomtutors.com.

Our team at LRT wishes you and ${tutee.tutee_firstname} the best!

Take Care,
Living Room Tutors Team

Contact Information:
${contactInfo}

LRT Tutor Documents:
Tutor Guide: https://docs.google.com/document/d/1iLv0qmxogcVK0bEjOEHcaxGSfnyEhC3dsoOwiO88PyQ/edit?usp=sharing
Tutor Training Modules: https://docs.google.com/presentation/d/1P2iS4r5KldjDjzYzU3Wy9FOSiFMSmdZBCegxTdIWzrE/edit?usp=sharing
  `.trim();

  return {
    to: tutor.tutor_email,
    subject: "Living Room Tutors Match: Welcome to the LRT Team",
    html,
    text
  };
}

/**
 * Generate email to tutee (student) notifying them of their match
 */
function tuteeMatchEmail(tutor, tutee) {
  const ccList = [tutor.tutor_email];
  if (tutee.email_guardian) {
    ccList.push(tutee.email_guardian);
  }

  const html = `
    <div>
      <p>Dear ${tutee.tutee_firstname} ${tutee.tutee_lastname},</p>

      <p>Congratulations! You have been matched! After careful consideration of your application, we feel your best match is with tutor <b>${tutor.tutor_first_name} ${tutor.tutor_last_name}</b>.</p>

      <p>${tutor.tutor_first_name} is in ${formatGradeLevel(tutor.tutor_grade)} and attends <b>${tutor.tutor_school}</b>. ${tutor.tutor_first_name} is cc'd on this email and will be reaching out to you to schedule a meeting. We will also include ${tutor.tutor_first_name}'s contact information below.</p>

      <p>We recommend using Zoom to conduct the tutoring sessions, however, there are other online conferencing platforms such as Google Meet, or Skype. Please note that Zoom operates best with the Chrome Browser. Please consider either installing Chrome or the Zoom application if you have not done so. We will also attach resources below in case you need assistance joining the meeting.</p>

      <p>If you ever have any questions or concerns, do not hesitate to reach out. Email us at team@livingroomtutors.com. Our team here at LRT understands the difficulty of finding a tutor tailored just for you. Your personalized tutor, ${tutor.tutor_first_name}, is going to be a wonderful resource for you.</p>

      <p>Note: If your tutor does not reach out after 5 business days upon receiving this email, please contact us. There will be an LRT guide document attached below. Please review the document thoroughly.</p>

      <p>Our team at LRT wishes you and ${tutor.tutor_first_name} the best! Thank you for using our service.</p>

      <p>Sincerely,</p>
      <p><b>Living Room Tutors Team</b></p>

      <p><u>${tutor.tutor_first_name}'s Contact Information:</u><br/>
      email: ${tutor.tutor_email}<br/>
      phone: ${tutor.tutor_phone}</p>

      <p><u>LRT Guide Document:</u><br/>
      <a href="https://docs.google.com/document/d/1sOTJKTd0vUQGcOqFKAY_WP57xqhRtukZdYaYKfLxUx4/edit?usp=sharing">Tutee Guide</a></p>
    </div>
  `;

  const text = `
Dear ${tutee.tutee_firstname} ${tutee.tutee_lastname},

Congratulations! You have been matched! After careful consideration of your application, we feel your best match is with tutor ${tutor.tutor_first_name} ${tutor.tutor_last_name}.

${tutor.tutor_first_name} is in ${formatGradeLevel(tutor.tutor_grade)} and attends ${tutor.tutor_school}. ${tutor.tutor_first_name} is cc'd on this email and will be reaching out to you to schedule a meeting. We will also include ${tutor.tutor_first_name}'s contact information below.

We recommend using Zoom to conduct the tutoring sessions, however, there are other online conferencing platforms such as Google Meet, or Skype. Please note that Zoom operates best with the Chrome Browser. Please consider either installing Chrome or the Zoom application if you have not done so. We will also attach resources below in case you need assistance joining the meeting.

If you ever have any questions or concerns, do not hesitate to reach out. Email us at team@livingroomtutors.com. Our team here at LRT understands the difficulty of finding a tutor tailored just for you. Your personalized tutor, ${tutor.tutor_first_name}, is going to be a wonderful resource for you.

Note: If your tutor does not reach out after 5 business days upon receiving this email, please contact us. There will be an LRT guide document attached below. Please review the document thoroughly.

Our team at LRT wishes you and ${tutor.tutor_first_name} the best! Thank you for using our service.

Sincerely,
Living Room Tutors Team

${tutor.tutor_first_name}'s Contact Information:
email: ${tutor.tutor_email}
phone: ${tutor.tutor_phone}

LRT Guide Document:
Tutee Guide: https://docs.google.com/document/d/1sOTJKTd0vUQGcOqFKAY_WP57xqhRtukZdYaYKfLxUx4/edit?usp=sharing
  `.trim();

  return {
    to: tutee.email_student,
    cc: ccList.join(', '),
    subject: "Living Room Tutors Match",
    html,
    text
  };
}

/**
 * Generate email to guardian notifying them of their child's match
 */
function guardianMatchEmail(tutor, tutee) {
  const ccList = [tutor.tutor_email];
  if (tutee.email_student) {
    ccList.push(tutee.email_student);
  }

  const html = `
    <div>
      <p>Dear Parents/Guardians/Teachers of ${tutee.tutee_firstname} ${tutee.tutee_lastname},</p>

      <p>Congratulations! ${tutee.tutee_firstname} has been matched!</p>

      <p>After careful consideration of the application, we feel the best tutor match is <b>${tutor.tutor_first_name} ${tutor.tutor_last_name}</b>. ${tutor.tutor_first_name} is in ${formatGradeLevel(tutor.tutor_grade)} and attends <b>${tutor.tutor_school}</b>. ${tutor.tutor_first_name} is cc'd in this email for your convenience. Feel free to begin communication with your tutor. We will also include ${tutor.tutor_first_name}'s contact information below.</p>

      <p>We recommend using Zoom to conduct the tutoring sessions, however, there are other online conferencing platforms such as Google Meet, or Skype. Please note that Zoom operates best with the Chrome Browser. Please consider either installing Chrome or the Zoom application if you have not done so. We will also attach resources below in case you need assistance joining the meeting.</p>

      <p>If you ever have any questions or concerns, do not hesitate to reach out. Email us at team@livingroomtutors.com. Our team here at LRT understands the difficulty of finding a tutor tailored just for you. Your personalized tutor, ${tutor.tutor_first_name}, is going to be a wonderful resource for ${tutee.tutee_firstname}.</p>

      <p>Note: If your tutor does not reach out after 5 business days upon receiving this email, please contact us. There will be an LRT guide document attached below. Please review the document thoroughly.</p>

      <p>Our team at LRT wishes ${tutee.tutee_firstname} and ${tutor.tutor_first_name} the best! Thank you for using our service.</p>

      <p>Sincerely,</p>
      <p><b>Living Room Tutors Team</b></p>

      <p><u>${tutor.tutor_first_name}'s Contact Information:</u><br/>
      email: ${tutor.tutor_email}<br/>
      phone: ${tutor.tutor_phone}</p>

      <p><u>LRT Guide Document:</u><br/>
      <a href="https://docs.google.com/document/d/1sOTJKTd0vUQGcOqFKAY_WP57xqhRtukZdYaYKfLxUx4/edit?usp=sharing">Tutee Guide</a></p>
    </div>
  `;

  const text = `
Dear Parents/Guardians/Teachers of ${tutee.tutee_firstname} ${tutee.tutee_lastname},

Congratulations! ${tutee.tutee_firstname} has been matched!

After careful consideration of the application, we feel the best tutor match is ${tutor.tutor_first_name} ${tutor.tutor_last_name}. ${tutor.tutor_first_name} is in ${formatGradeLevel(tutor.tutor_grade)} and attends ${tutor.tutor_school}. ${tutor.tutor_first_name} is cc'd in this email for your convenience. Feel free to begin communication with your tutor. We will also include ${tutor.tutor_first_name}'s contact information below.

We recommend using Zoom to conduct the tutoring sessions, however, there are other online conferencing platforms such as Google Meet, or Skype. Please note that Zoom operates best with the Chrome Browser. Please consider either installing Chrome or the Zoom application if you have not done so. We will also attach resources below in case you need assistance joining the meeting.

If you ever have any questions or concerns, do not hesitate to reach out. Email us at team@livingroomtutors.com. Our team here at LRT understands the difficulty of finding a tutor tailored just for you. Your personalized tutor, ${tutor.tutor_first_name}, is going to be a wonderful resource for ${tutee.tutee_firstname}.

Note: If your tutor does not reach out after 5 business days upon receiving this email, please contact us. There will be an LRT guide document attached below. Please review the document thoroughly.

Our team at LRT wishes ${tutee.tutee_firstname} and ${tutor.tutor_first_name} the best! Thank you for using our service.

Sincerely,
Living Room Tutors Team

${tutor.tutor_first_name}'s Contact Information:
email: ${tutor.tutor_email}
phone: ${tutor.tutor_phone}

LRT Guide Document:
Tutee Guide: https://docs.google.com/document/d/1sOTJKTd0vUQGcOqFKAY_WP57xqhRtukZdYaYKfLxUx4/edit?usp=sharing
  `.trim();

  return {
    to: tutee.email_guardian,
    cc: ccList.join(', '),
    subject: "Living Room Tutors Match",
    html,
    text
  };
}

module.exports = {
  tutorMatchEmail,
  tuteeMatchEmail,
  guardianMatchEmail,
  getSubjectDisplayName,
  subjects
};

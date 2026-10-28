/**
 * CampusConnect - Automated Eligibility Engine
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Evaluates candidate student profile against an opportunity's criteria.
 * Returns boolean eligibility and a structured breakdown with granular pass/fail reasons.
 */

function evaluateEligibility(studentProfile, rules) {
  if (!rules || Object.keys(rules).length === 0) {
    return {
      isEligible: true,
      score: 100,
      passedRules: ['No eligibility restrictions set by organizer.'],
      failedRules: []
    };
  }

  const passedRules = [];
  const failedRules = [];

  // 1. Minimum CGPA Check
  if (typeof rules.min_cgpa === 'number') {
    const studentCgpa = parseFloat(studentProfile.cgpa) || 0;
    if (studentCgpa >= rules.min_cgpa) {
      passedRules.push(`CGPA requirement met: ${studentCgpa.toFixed(2)} >= ${rules.min_cgpa.toFixed(2)}`);
    } else {
      failedRules.push(`Requires minimum CGPA of ${rules.min_cgpa.toFixed(2)} (Your CGPA: ${studentCgpa.toFixed(2)})`);
    }
  }

  // 2. Branch / Department Check
  if (Array.isArray(rules.branches) && rules.branches.length > 0) {
    const studentBranch = (studentProfile.branch || '').toUpperCase().trim();
    const allowedBranches = rules.branches.map(b => b.toUpperCase().trim());
    if (allowedBranches.includes(studentBranch) || allowedBranches.includes('ALL')) {
      passedRules.push(`Branch eligible: ${studentBranch} is accepted [${rules.branches.join(', ')}]`);
    } else {
      failedRules.push(`Open only to: ${rules.branches.join(', ')} (Your branch: ${studentBranch || 'Not set'})`);
    }
  }

  // 3. Semester Check
  if (Array.isArray(rules.semesters) && rules.semesters.length > 0) {
    const studentSem = parseInt(studentProfile.semester, 10);
    const allowedSemesters = rules.semesters.map(s => parseInt(s, 10));
    if (allowedSemesters.includes(studentSem)) {
      passedRules.push(`Semester eligible: Semester ${studentSem} is qualified [Sem ${allowedSemesters.join(', ')}]`);
    } else {
      failedRules.push(`Open to semesters: ${allowedSemesters.join(', ')} (Your semester: ${studentSem || 'Not set'})`);
    }
  }

  // 4. Maximum Active Backlogs Check
  if (typeof rules.max_backlogs === 'number') {
    const studentBacklogs = parseInt(studentProfile.backlogs, 10) || 0;
    if (studentBacklogs <= rules.max_backlogs) {
      passedRules.push(`Backlog criterion met: ${studentBacklogs} active backlogs (Maximum allowed: ${rules.max_backlogs})`);
    } else {
      failedRules.push(`Requires at most ${rules.max_backlogs} active backlog(s) (You have ${studentBacklogs})`);
    }
  }

  // 5. Required Technical Skills Check
  if (Array.isArray(rules.required_skills) && rules.required_skills.length > 0) {
    const studentSkills = (studentProfile.skills || []).map(s => s.toLowerCase().trim());
    const missingSkills = [];
    const matchedSkills = [];

    rules.required_skills.forEach(skill => {
      const normalizedReq = skill.toLowerCase().trim();
      const match = studentSkills.some(stSkill => stSkill.includes(normalizedReq) || normalizedReq.includes(stSkill));
      if (match) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    if (missingSkills.length === 0) {
      passedRules.push(`All prerequisite skills verified: ${matchedSkills.join(', ')}`);
    } else {
      failedRules.push(`Missing required skill(s): ${missingSkills.join(', ')} (Matched: ${matchedSkills.length > 0 ? matchedSkills.join(', ') : 'None'})`);
    }
  }

  const isEligible = failedRules.length === 0;
  const totalChecks = passedRules.length + failedRules.length;
  const score = totalChecks > 0 ? Math.round((passedRules.length / totalChecks) * 100) : 100;

  return {
    isEligible,
    score,
    passedRules,
    failedRules
  };
}

module.exports = {
  evaluateEligibility
};


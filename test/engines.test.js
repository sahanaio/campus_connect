/**
 * CampusConnect - Automated Test Suite
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Unit tests verifying:
 * 1. Rule-Based Eligibility Engine
 * 2. Content-Based TF-IDF Recommender Engine
 * 3. Notification & Deadline Scheduler
 */

const assert = require('assert');
const { evaluateEligibility } = require('../server/engines/eligibilityEngine');
const { tokenize, cosineSimilarity, rankRecommendations } = require('../server/engines/recommendationEngine');
const { calculateDaysDifference, notifyEligibleStudentsForNewOpportunity } = require('../server/services/notificationScheduler');
const db = require('../server/database');

console.log('====================================================');
console.log('🧪 RUNNING CAMPUSCONNECT AUTOMATED TEST SUITE');
console.log('   REVA University • Dept. of CSE (AIML)');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// ------------------------------------------------------------------
// 1. ELIGIBILITY ENGINE TESTS
// ------------------------------------------------------------------
console.log('--- 1. Testing Automated Eligibility Engine ---');

const qualifiedStudent = {
  full_name: 'Sahana M',
  branch: 'AIML',
  semester: 6,
  cgpa: 8.85,
  backlogs: 0,
  skills: ['Python', 'Machine Learning', 'TensorFlow', 'React']
};

const unqualifiedStudent = {
  full_name: 'Rahul Sharma',
  branch: 'CSE',
  semester: 4,
  cgpa: 7.20,
  backlogs: 1,
  skills: ['JavaScript', 'HTML', 'CSS']
};

const strictRules = {
  min_cgpa: 8.0,
  semesters: [5, 6, 7, 8],
  branches: ['AIML', 'CSE'],
  max_backlogs: 0,
  required_skills: ['Python', 'Machine Learning']
};

runTest('Qualified student satisfies all 5 criteria (score: 100%)', () => {
  const result = evaluateEligibility(qualifiedStudent, strictRules);
  assert.strictEqual(result.isEligible, true);
  assert.strictEqual(result.score, 100);
  assert.strictEqual(result.failedRules.length, 0);
  assert.strictEqual(result.passedRules.length, 5);
});

runTest('Ineligible student fails with exact breakdown reasons', () => {
  const result = evaluateEligibility(unqualifiedStudent, strictRules);
  assert.strictEqual(result.isEligible, false);
  assert.strictEqual(result.failedRules.length > 0, true);
  // Must fail CGPA, semester, backlogs, and skills
  const failedText = result.failedRules.join(' ');
  assert.match(failedText, /CGPA/);
  assert.match(failedText, /semester/);
  assert.match(failedText, /backlog/);
  assert.match(failedText, /skill/);
});

runTest('Opportunity with no rules is open to all students', () => {
  const result = evaluateEligibility(unqualifiedStudent, {});
  assert.strictEqual(result.isEligible, true);
  assert.strictEqual(result.score, 100);
});

runTest('Boundary CGPA check: student CGPA exactly equals min_cgpa', () => {
  const boundaryStudent = { ...qualifiedStudent, cgpa: 8.00 };
  const result = evaluateEligibility(boundaryStudent, { min_cgpa: 8.00 });
  assert.strictEqual(result.isEligible, true);
});

// ------------------------------------------------------------------
// 2. RECOMMENDATION ENGINE TESTS (TF-IDF & COSINE)
// ------------------------------------------------------------------
console.log('\n--- 2. Testing AIML Recommendation Engine ---');

runTest('Tokenizer extracts meaningful words and strips English stopwords', () => {
  const tokens = tokenize('The student is building an advanced Deep Learning and Python system');
  assert.deepStrictEqual(tokens.includes('the'), false);
  assert.deepStrictEqual(tokens.includes('and'), false);
  assert.strictEqual(tokens.includes('deep'), true);
  assert.strictEqual(tokens.includes('learning'), true);
  assert.strictEqual(tokens.includes('python'), true);
});

runTest('Cosine similarity between identical vectors equals 1.0', () => {
  const vecA = { python: 0.8, ml: 0.6 };
  const sim = cosineSimilarity(vecA, vecA);
  assert.strictEqual(Math.round(sim * 1000) / 1000, 1.0);
});

runTest('Cosine similarity between orthogonal vectors equals 0.0', () => {
  const vecA = { python: 1.0 };
  const vecB = { cooking: 1.0 };
  const sim = cosineSimilarity(vecA, vecB);
  assert.strictEqual(sim, 0.0);
});

runTest('Recommendations prioritize opportunities matching candidate skill tree', () => {
  const opps = [
    { id: '1', title: 'Python AI Deep Learning Intern', tags: ['Python', 'Deep Learning'], description: 'Work on PyTorch' },
    { id: '2', title: 'Content Writing Internship', tags: ['Content', 'Marketing'], description: 'Write blog articles' }
  ];
  const ranked = rankRecommendations(qualifiedStudent, opps);
  assert.strictEqual(ranked[0].id, '1');
  assert.strictEqual(ranked[0].recommendationScore > ranked[1].recommendationScore, true);
  assert.strictEqual(ranked[0].matchedKeywords.includes('python'), true);
});

// ------------------------------------------------------------------
// 3. NOTIFICATION & SCHEDULER TESTS
// ------------------------------------------------------------------
console.log('\n--- 3. Testing Notification & Deadline Scheduler ---');

runTest('calculateDaysDifference calculates accurate remaining days', () => {
  const future = new Date();
  future.setDate(future.getDate() + 3);
  const diff = calculateDaysDifference(future.toISOString().split('T')[0]);
  assert.strictEqual(diff, 3);
});

runTest('notifyEligibleStudentsForNewOpportunity dispatches alerts to matching candidates', () => {
  const testOpp = {
    id: 'test_opp_alert',
    title: 'REVA National AI Hackathon 2026',
    type: 'hackathons',
    organizer: 'REVA University',
    eligibility_rules: {
      min_cgpa: 6.0,
      semesters: [1,2,3,4,5,6,7,8],
      branches: ['CSE', 'AIML'],
      max_backlogs: 2,
      required_skills: []
    }
  };
  const notified = notifyEligibleStudentsForNewOpportunity(testOpp);
  assert.strictEqual(notified >= 1, true);
});

// ------------------------------------------------------------------
// SUMMARY REPORT
// ------------------------------------------------------------------
console.log('\n====================================================');
console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} PASSED`);
if (passedTests === totalTests) {
  console.log('🌟 ALL UNIT TESTS PASSED SUCCESSFULLY! 100% RELIABILITY.');
} else {
  console.error(`⚠️ ${totalTests - passedTests} TEST(S) FAILED.`);
  process.exit(1);
}
console.log('====================================================');


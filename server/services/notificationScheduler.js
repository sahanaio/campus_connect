/**
 * CampusConnect - Notification & Deadline Scheduler
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Implements:
 * 1. Schedule-based checks: Analyzes upcoming opportunity deadlines (7, 3, 1 days).
 * 2. Event-based dispatch: When a new opportunity is created, notifies all eligible students.
 */

const db = require('../database');
const { evaluateEligibility } = require('../engines/eligibilityEngine');

function calculateDaysDifference(targetDateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Run deadline scan for 7, 3, and 1 days
 */
function runDeadlineScan() {
  const opportunities = db.getOpportunities();
  const students = db.getUsers().filter(u => u.role === 'student');
  let alertsGenerated = 0;

  opportunities.forEach(opp => {
    const daysLeft = calculateDaysDifference(opp.deadline);

    // Check target thresholds: 1, 3, or 7 days
    if ([1, 3, 7].includes(daysLeft)) {
      students.forEach(student => {
        // If saved OR eligible
        const isSaved = db.isSaved(student.id, opp.id);
        const { isEligible } = evaluateEligibility(student, opp.eligibility_rules);

        if (isSaved || isEligible) {
          // Check if similar notification already created today
          const existingNotifs = db.getNotifications(student.id);
          const alreadyNotified = existingNotifs.some(n => 
            n.opportunity_id === opp.id && 
            n.type === 'deadline' &&
            n.message.includes(`${daysLeft} day`)
          );

          if (!alreadyNotified) {
            const urgency = daysLeft === 1 ? 'URGENT: 1 Day Left' : `${daysLeft} Days Remaining`;
            db.addNotification({
              student_id: student.id,
              opportunity_id: opp.id,
              type: 'deadline',
              title: `Deadline Alert: ${urgency}!`,
              message: `Deadline for "${opp.title}" (${opp.organizer}) is in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Don't miss this opportunity!`
            });
            alertsGenerated++;
          }
        }
      });
    }
  });

  return { alertsGenerated, timestamp: new Date().toISOString() };
}

/**
 * Event-based: Notify students when an opportunity is newly created
 */
function notifyEligibleStudentsForNewOpportunity(opportunity) {
  const students = db.getUsers().filter(u => u.role === 'student');
  let notifiedCount = 0;

  students.forEach(student => {
    const result = evaluateEligibility(student, opportunity.eligibility_rules);
    if (result.isEligible) {
      db.addNotification({
        student_id: student.id,
        opportunity_id: opportunity.id,
        type: 'new_match',
        title: `New Opportunity: ${opportunity.title}`,
        message: `Great news! A new ${opportunity.type.slice(0, -1)} has been published by ${opportunity.organizer} and you meet all eligibility requirements!`
      });
      notifiedCount++;
    }
  });

  return notifiedCount;
}

module.exports = {
  runDeadlineScan,
  notifyEligibleStudentsForNewOpportunity,
  calculateDaysDifference
};


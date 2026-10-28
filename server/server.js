/**
 * CampusConnect - REST API Server
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Express REST API implementing the System Architecture specification:
 * - Opportunity Management
 * - Rule-Based Eligibility Engine
 * - Content-Based TF-IDF Cosine Similarity Recommender
 * - Real-Time In-App Alerts & Deadline Scheduler
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { evaluateEligibility } = require('./engines/eligibilityEngine');
const { rankRecommendations } = require('./engines/recommendationEngine');
const { runDeadlineScan, notifyEligibleStudentsForNewOpportunity } = require('./services/notificationScheduler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Simulated Auth Session Header Middleware
// In production: Supabase JWT verified via supabase.auth.getUser(token)
// For local demo/viva: defaults to 'usr_sahana', can be switched via header 'x-user-id'
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'] || 'usr_sahana';
  const user = db.getUserById(userId);
  req.currentUser = user || db.getUserById('usr_sahana');
  next();
});

// ==========================================
// 1. AUTH & USER PROFILE ENDPOINTS
// ==========================================

// Get current active user profile
app.get('/api/profile', (req, res) => {
  res.json({
    success: true,
    user: req.currentUser,
    allUsers: db.getUsers().map(u => ({ id: u.id, full_name: u.full_name, role: u.role, branch: u.branch, semester: u.semester, cgpa: u.cgpa }))
  });
});

// Update profile (CGPA, semester, skills, interests, etc.)
app.put('/api/profile', (req, res) => {
  const updates = req.body;
  const updatedUser = db.updateUserProfile(req.currentUser.id, updates);
  if (!updatedUser) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

// Persona Switcher for viva / live presentation
app.post('/api/auth/switch-user', (req, res) => {
  const { userId } = req.body;
  const targetUser = db.getUserById(userId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: 'Invalid user ID' });
  }
  res.json({
    success: true,
    message: `Switched session to ${targetUser.full_name} (${targetUser.role.toUpperCase()})`,
    user: targetUser
  });
});

// Student & Faculty Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  const user = db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Account not found with this REVA email' });
  }
  res.json({
    success: true,
    message: `Welcome back, ${user.full_name}!`,
    user,
    token: 'jwt_mock_token_' + user.id
  });
});

// Student Signup endpoint
app.post('/api/auth/signup', (req, res) => {
  const { email, full_name, role, branch, semester, cgpa, skills, interests } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ success: false, message: 'Email and Full Name are required' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ success: false, message: 'Account already exists with this email' });
  }
  const newUser = db.createUser({
    email,
    full_name,
    role: role || 'student',
    branch: branch || 'AIML',
    semester: parseInt(semester, 10) || 6,
    cgpa: parseFloat(cgpa) || 8.0,
    skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map(s => s.trim()) : ['Python']),
    interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map(i => i.trim()) : ['AI'])
  });
  res.status(201).json({
    success: true,
    message: `Account created successfully for ${newUser.full_name}!`,
    user: newUser,
    token: 'jwt_mock_token_' + newUser.id
  });
});

// ==========================================
// 2. OPPORTUNITY ENDPOINTS
// ==========================================

// List all opportunities with filters (type, search, tag, deadline)
app.get('/api/opportunities', (req, res) => {
  const { type, search, tag } = req.query;
  let opps = db.getOpportunities();

  if (type && type !== 'all') {
    opps = opps.filter(o => o.type.toLowerCase() === type.toLowerCase());
  }

  if (tag) {
    opps = opps.filter(o => o.tags && o.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    opps = opps.filter(o =>
      o.title.toLowerCase().includes(q) ||
      o.organizer.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      (o.tags && o.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // Attach student eligibility status and saved/applied flags for current user
  const enriched = opps.map(o => {
    const eligibility = evaluateEligibility(req.currentUser, o.eligibility_rules);
    const isSaved = db.isSaved(req.currentUser.id, o.id);
    const isApplied = db.isApplied(req.currentUser.id, o.id);
    return {
      ...o,
      eligibility,
      isSaved,
      isApplied
    };
  });

  res.json({
    success: true,
    count: enriched.length,
    opportunities: enriched
  });
});

// List only opportunities the current student qualifies for
app.get('/api/opportunities/eligible', (req, res) => {
  const opps = db.getOpportunities();
  const eligibleOpps = [];

  opps.forEach(o => {
    const eligibility = evaluateEligibility(req.currentUser, o.eligibility_rules);
    if (eligibility.isEligible) {
      eligibleOpps.push({
        ...o,
        eligibility,
        isSaved: db.isSaved(req.currentUser.id, o.id)
      });
    }
  });

  res.json({
    success: true,
    count: eligibleOpps.length,
    student: {
      name: req.currentUser.full_name,
      branch: req.currentUser.branch,
      semester: req.currentUser.semester,
      cgpa: req.currentUser.cgpa
    },
    opportunities: eligibleOpps
  });
});

// Single Opportunity Eligibility Breakdown
app.get('/api/opportunities/:id/eligibility', (req, res) => {
  const opp = db.getOpportunityById(req.params.id);
  if (!opp) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  const result = evaluateEligibility(req.currentUser, opp.eligibility_rules);
  res.json({
    success: true,
    opportunity: {
      id: opp.id,
      title: opp.title,
      organizer: opp.organizer,
      rules: opp.eligibility_rules
    },
    student: {
      name: req.currentUser.full_name,
      branch: req.currentUser.branch,
      semester: req.currentUser.semester,
      cgpa: req.currentUser.cgpa,
      backlogs: req.currentUser.backlogs,
      skills: req.currentUser.skills
    },
    result
  });
});

// ==========================================
// 3. RECOMMENDATIONS ENDPOINT (TF-IDF + COSINE)
// ==========================================

app.get('/api/recommendations', (req, res) => {
  const allOpps = db.getOpportunities();
  
  // Filter for opportunities that are eligible first
  const eligibleOpps = allOpps.filter(o => {
    const evalRes = evaluateEligibility(req.currentUser, o.eligibility_rules);
    return evalRes.isEligible;
  });

  // Rank using Content-Based TF-IDF Cosine Similarity
  const ranked = rankRecommendations(req.currentUser, eligibleOpps);

  // Attach isSaved flag and eligibility details
  const enriched = ranked.map(o => ({
    ...o,
    eligibility: evaluateEligibility(req.currentUser, o.eligibility_rules),
    isSaved: db.isSaved(req.currentUser.id, o.id)
  }));

  res.json({
    success: true,
    count: enriched.length,
    algorithm: 'Content-Based Filtering (TF-IDF Vector Space Model & Cosine Similarity)',
    studentProfile: {
      name: req.currentUser.full_name,
      branch: req.currentUser.branch,
      skills: req.currentUser.skills,
      interests: req.currentUser.interests
    },
    recommendations: enriched
  });
});

// ==========================================
// 4. ADMIN OPPORTUNITY CRUD
// ==========================================

// Create new opportunity (Admin only)
app.post('/api/opportunities', (req, res) => {
  if (req.currentUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  const { title, type, organizer, location, stipend, duration, deadline, link, description, tags, eligibility_rules } = req.body;

  if (!title || !type || !organizer || !deadline) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const newOpp = db.createOpportunity({
    title,
    type,
    organizer,
    location: location || 'REVA University / Bengaluru',
    stipend: stipend || 'Not specified',
    duration: duration || 'Not specified',
    deadline,
    link: link || 'https://reva.edu.in',
    description: description || '',
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    created_by: req.currentUser.id,
    eligibility_rules: eligibility_rules || { min_cgpa: 6.0, semesters: [1,2,3,4,5,6,7,8], branches: ['CSE', 'AIML'], max_backlogs: 2, required_skills: [] }
  });

  // Event-based notification dispatch to eligible students
  const notifiedCount = notifyEligibleStudentsForNewOpportunity(newOpp);

  res.status(201).json({
    success: true,
    message: `Opportunity created successfully! Dispatched alerts to ${notifiedCount} eligible student(s).`,
    opportunity: newOpp,
    notifiedCount
  });
});

// Update opportunity
app.put('/api/opportunities/:id', (req, res) => {
  if (req.currentUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  const updated = db.updateOpportunity(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  res.json({
    success: true,
    message: 'Opportunity updated successfully',
    opportunity: updated
  });
});

// Delete opportunity
app.delete('/api/opportunities/:id', (req, res) => {
  if (req.currentUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
  }

  const deleted = db.deleteOpportunity(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  res.json({
    success: true,
    message: 'Opportunity deleted successfully'
  });
});

// Admin stats
app.get('/api/admin/stats', (req, res) => {
  const opps = db.getOpportunities();
  const students = db.getUsers().filter(u => u.role === 'student');

  const categoryCounts = {};
  opps.forEach(o => {
    categoryCounts[o.type] = (categoryCounts[o.type] || 0) + 1;
  });

  res.json({
    success: true,
    stats: {
      totalOpportunities: opps.length,
      totalStudents: students.length,
      categories: categoryCounts,
      upcomingDeadlines: opps.filter(o => {
        const d = new Date(o.deadline);
        const diff = (d - new Date()) / (1000 * 3600 * 24);
        return diff >= 0 && diff <= 7;
      }).length
    }
  });
});

// ==========================================
// 5. SAVED / BOOKMARKS ENDPOINTS
// ==========================================

// List saved opportunities
app.get('/api/saved', (req, res) => {
  const saved = db.getSaved(req.currentUser.id);
  const opps = saved.map(s => {
    const opp = db.getOpportunityById(s.opportunity_id);
    if (!opp) return null;
    return {
      ...opp,
      savedAt: s.created_at,
      eligibility: evaluateEligibility(req.currentUser, opp.eligibility_rules),
      isSaved: true
    };
  }).filter(Boolean);

  res.json({
    success: true,
    count: opps.length,
    savedOpportunities: opps
  });
});

// Toggle save
app.post('/api/saved/:id', (req, res) => {
  const opp = db.getOpportunityById(req.params.id);
  if (!opp) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  const result = db.toggleSave(req.currentUser.id, req.params.id);
  res.json({
    success: true,
    saved: result.saved,
    message: result.saved ? 'Opportunity bookmarked' : 'Opportunity removed from bookmarks'
  });
});

// ==========================================
// 5B. APPLICATIONS & TRACKER ENDPOINTS
// ==========================================

// List student applications
app.get('/api/applications', (req, res) => {
  const applications = db.getApplied(req.currentUser.id);
  const enriched = applications.map(appRecord => {
    const opp = db.getOpportunityById(appRecord.opportunity_id);
    if (!opp) return null;
    return {
      ...appRecord,
      opportunity: {
        ...opp,
        eligibility: evaluateEligibility(req.currentUser, opp.eligibility_rules),
        isSaved: db.isSaved(req.currentUser.id, opp.id),
        isApplied: true
      }
    };
  }).filter(Boolean);

  res.json({
    success: true,
    count: enriched.length,
    applications: enriched
  });
});

// Submit application
app.post('/api/applications/:id', (req, res) => {
  const opp = db.getOpportunityById(req.params.id);
  if (!opp) {
    return res.status(404).json({ success: false, message: 'Opportunity not found' });
  }

  const result = db.applyOpportunity(req.currentUser.id, req.params.id);

  // Send a confirmation notification
  db.addNotification({
    student_id: req.currentUser.id,
    opportunity_id: opp.id,
    type: 'new_match',
    title: `Application Confirmed: ${opp.title}`,
    message: `Your application to ${opp.organizer} for "${opp.title}" has been successfully logged with status: Under Review.`
  });

  res.json({
    success: true,
    alreadyApplied: result.alreadyApplied,
    message: result.alreadyApplied ? 'Application already on file' : 'Application recorded successfully!',
    application: result.application
  });
});

// ==========================================
// 6. NOTIFICATION ENDPOINTS
// ==========================================

// Get student notifications
app.get('/api/notifications', (req, res) => {
  const notifs = db.getNotifications(req.currentUser.id);
  const unreadCount = notifs.filter(n => !n.is_read).length;

  res.json({
    success: true,
    unreadCount,
    notifications: notifs
  });
});

// Mark one notification as read
app.patch('/api/notifications/:id/read', (req, res) => {
  const updated = db.markNotificationRead(req.currentUser.id, req.params.id);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  res.json({
    success: true,
    notification: updated
  });
});

// Mark all notifications read
app.post('/api/notifications/read-all', (req, res) => {
  db.markAllNotificationsRead(req.currentUser.id);
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Manually trigger deadline scheduler scan (for demonstration during exam viva)
app.post('/api/scheduler/trigger-deadlines', (req, res) => {
  const scanResult = runDeadlineScan();
  res.json({
    success: true,
    message: `Deadline scan executed: ${scanResult.alertsGenerated} alert(s) generated for approaching deadlines (7, 3, 1 days).`,
    scanResult
  });
});

// Root catch-all for single-page app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CampusConnect - REVA University (AIML / CSE)`);
    console.log(` REST API & Web Server running on http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;

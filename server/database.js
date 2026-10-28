/**
 * CampusConnect - Database Service & Seed Data
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Provides in-memory / persistent schema matching Supabase PostgreSQL tables:
 * - profiles
 * - opportunities
 * - eligibility_rules
 * - saved_opportunities
 * - notifications
 */

// Helper to create dates relative to now
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const users = [
  {
    id: 'usr_sahana',
    email: 'sahana.m@reva.edu.in',
    full_name: 'Sahana M',
    role: 'student',
    branch: 'AIML',
    semester: 6,
    cgpa: 8.85,
    backlogs: 0,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'React', 'SQL', 'Deep Learning'],
    interests: ['Artificial Intelligence', 'Open Source', 'Hackathons', 'Cloud Computing'],
    bio: 'AIML 6th semester undergraduate at REVA University passionate about computer vision and applied deep learning.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'usr_rahul',
    email: 'rahul.s@reva.edu.in',
    full_name: 'Rahul Sharma',
    role: 'student',
    branch: 'CSE',
    semester: 4,
    cgpa: 7.20,
    backlogs: 1,
    skills: ['JavaScript', 'HTML', 'CSS', 'Node.js', 'Python'],
    interests: ['Web Development', 'UI/UX', 'Workshops'],
    bio: 'CSE 4th semester student enthusiastic about full-stack web applications and college hackathons.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'usr_ananya',
    email: 'ananya.r@reva.edu.in',
    full_name: 'Ananya Rao',
    role: 'student',
    branch: 'AIML',
    semester: 8,
    cgpa: 9.30,
    backlogs: 0,
    skills: ['Python', 'PyTorch', 'NLP', 'Data Science', 'Docker', 'FastAPI'],
    interests: ['Research', 'Scholarships', 'Internships', 'NLP'],
    bio: 'Final year AIML researcher with published papers and high academic track record at REVA.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'usr_admin',
    email: 'c.ramesh@reva.edu.in',
    full_name: 'Dr. C. Ramesh',
    role: 'admin',
    branch: 'AIML',
    semester: null,
    cgpa: null,
    backlogs: null,
    skills: ['Curriculum Design', 'AI Research', 'Placement Coordination'],
    interests: ['Student Guidance', 'Industry Tie-ups'],
    bio: 'Professor & Placement Coordinator, Dept. of CSE (AIML), REVA University.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'
  }
];

let opportunities = [
  {
    id: 'opp_1',
    type: 'internships',
    title: 'AI & Deep Learning Research Intern',
    organizer: 'Robert Bosch Center for AI & REVA Research Park',
    location: 'Bengaluru (Hybrid)',
    stipend: '₹35,000 / month',
    duration: '6 Months',
    deadline: addDays(3), // Approaching deadline: 3 days
    link: 'https://careers.bosch.in/ai-research-intern',
    description: 'Work alongside doctoral researchers on computer vision, generative AI models, and real-time inference on edge devices. Opportunity to publish top-tier conference papers and transition to full-time engineering roles.',
    tags: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Computer Vision'],
    created_by: 'usr_admin',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    eligibility_rules: {
      min_cgpa: 8.0,
      semesters: [5, 6, 7, 8],
      branches: ['AIML', 'CSE'],
      max_backlogs: 0,
      required_skills: ['Python', 'Machine Learning']
    }
  },
  {
    id: 'opp_2',
    type: 'hackathons',
    title: 'REVA HACK 4.0 - Annual National Hackathon',
    organizer: 'School of C&IT, REVA University',
    location: 'Kuvempu Auditorium, REVA Campus',
    stipend: '₹2,50,000 Prize Pool',
    duration: '36 Hours Offline',
    deadline: addDays(7), // Approaching deadline: 7 days
    link: 'https://revahack.devpost.com',
    description: 'The premier national student hackathon hosted on the REVA University campus. Tracks include AI for Healthcare, FinTech, Smart Campus IoT, and Open Innovation. Mentored by leaders from Google, Microsoft, and Swiggy.',
    tags: ['Hackathons', 'Python', 'React', 'Web Development', 'AI', 'IoT'],
    created_by: 'usr_admin',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    eligibility_rules: {
      min_cgpa: 6.0,
      semesters: [1, 2, 3, 4, 5, 6, 7, 8],
      branches: ['CSE', 'AIML', 'ECE', 'ISE'],
      max_backlogs: 2,
      required_skills: []
    }
  },
  {
    id: 'opp_3',
    type: 'workshops',
    title: 'Hands-on Generative AI & LLM Fine-Tuning Bootcamp',
    organizer: 'IEEE Student Branch & REVA ACM Chapter',
    location: 'Lab 402, Swami Vivekananda Block, REVA University',
    stipend: 'Free Hands-on Certificate + Cloud Credits',
    duration: '2 Days (Weekend)',
    deadline: addDays(1), // Urgent deadline: 1 day!
    link: 'https://reva.edu.in/workshops/genai-2026',
    description: 'Comprehensive practical training on LangChain, Hugging Face Transformers, LoRA fine-tuning, and retrieval-augmented generation (RAG). Every participant builds an end-to-end campus assistant bot.',
    tags: ['Python', 'Machine Learning', 'NLP', 'TensorFlow', 'Workshops'],
    created_by: 'usr_admin',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    eligibility_rules: {
      min_cgpa: 6.5,
      semesters: [3, 4, 5, 6, 7, 8],
      branches: ['AIML', 'CSE'],
      max_backlogs: 1,
      required_skills: ['Python']
    }
  },
  {
    id: 'opp_4',
    type: 'certifications',
    title: 'AWS Certified Cloud Practitioner - 100% Exam Voucher Sponsorship',
    organizer: 'REVA Cloud Excellence Academy & Amazon Web Services',
    location: 'Online Examination',
    stipend: '100% Fee Waiver ($100 value)',
    duration: 'Self-Paced (Exam within 30 days)',
    deadline: addDays(10),
    link: 'https://aws.amazon.com/certification/certified-cloud-practitioner',
    description: 'Sponsored by the Department of CSE (AIML) for high-achieving students seeking industry cloud credentialing. Covers cloud economics, architecture principles, core AWS compute, storage, and security.',
    tags: ['Cloud Computing', 'AWS', 'Certifications', 'Security'],
    created_by: 'usr_admin',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    eligibility_rules: {
      min_cgpa: 7.5,
      semesters: [4, 5, 6, 7, 8],
      branches: ['CSE', 'AIML'],
      max_backlogs: 0,
      required_skills: []
    }
  },
  {
    id: 'opp_5',
    type: 'scholarships',
    title: 'REVA University Chancellor Merit Scholarship 2026',
    organizer: 'Office of the Registrar, REVA University',
    location: 'REVA Administrative Block',
    stipend: '₹50,000 Tuition Fee Grant',
    duration: 'Academic Year 2026-27',
    deadline: addDays(14),
    link: 'https://reva.edu.in/scholarships/merit-2026',
    description: 'Merit scholarship awarded to top academic performers of REVA University in engineering disciplines who have maintained pristine academic records with zero active backlogs.',
    tags: ['Scholarships', 'Merit', 'Academic Grant', 'REVA'],
    created_by: 'usr_admin',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    eligibility_rules: {
      min_cgpa: 8.5,
      semesters: [3, 4, 5, 6, 7, 8],
      branches: ['CSE', 'AIML'],
      max_backlogs: 0,
      required_skills: []
    }
  },
  {
    id: 'opp_6',
    type: 'part-time',
    title: 'REVA AI Labs - Student Technical Assistant',
    organizer: 'Centre for Artificial Intelligence & Robotics, REVA',
    location: 'Sir M. Visvesvaraya Block, REVA Campus',
    stipend: '₹8,000 / month (10 hrs/week)',
    duration: 'Ongoing Semester',
    deadline: addDays(5),
    link: 'https://reva.edu.in/cair/student-assistant',
    description: 'Assist professors with managing GPU cluster workloads, guiding junior 2nd-year students in Python and Data Structures lab sessions, and maintaining AI project repositories.',
    tags: ['Python', 'SQL', 'Mentorship', 'Part-time', 'Lab Assistant'],
    created_by: 'usr_admin',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    eligibility_rules: {
      min_cgpa: 7.0,
      semesters: [5, 6, 7, 8],
      branches: ['AIML', 'CSE'],
      max_backlogs: 0,
      required_skills: ['Python']
    }
  },
  {
    id: 'opp_7',
    type: 'internships',
    title: 'Full Stack Web Developer Intern',
    organizer: 'Swiggy Bengaluru Tech Hub',
    location: 'Bellandur, Bengaluru',
    stipend: '₹40,000 / month',
    duration: '3 Months (Summer)',
    deadline: addDays(8),
    link: 'https://swiggy.careers/internships',
    description: 'Join the consumer web experience squad. Architect high-throughput responsive web components using React, Node.js, and microservices.',
    tags: ['React', 'JavaScript', 'Node.js', 'HTML', 'CSS', 'SQL'],
    created_by: 'usr_admin',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    eligibility_rules: {
      min_cgpa: 7.0,
      semesters: [5, 6, 7, 8],
      branches: ['CSE', 'AIML', 'ISE'],
      max_backlogs: 0,
      required_skills: ['JavaScript', 'React']
    }
  },
  {
    id: 'opp_8',
    type: 'hackathons',
    title: 'Smart India Hackathon (SIH) 2026 - College Internal Screening',
    organizer: 'Ministry of Education & REVA Innovation Council',
    location: 'REVA University Campus',
    stipend: '₹1,00,000 National Grand Prize',
    duration: 'Internal Pitch',
    deadline: addDays(2),
    link: 'https://www.sih.gov.in',
    description: 'Internal hackathon round to select top 30 teams representing REVA University at the National Smart India Hackathon 2026. Hardware and Software problem statements from Central Ministries.',
    tags: ['Hackathons', 'Innovation', 'Python', 'Machine Learning', 'Web Development'],
    created_by: 'usr_admin',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    eligibility_rules: {
      min_cgpa: 6.0,
      semesters: [3, 4, 5, 6, 7, 8],
      branches: ['CSE', 'AIML', 'ECE'],
      max_backlogs: 1,
      required_skills: []
    }
  }
];

let savedOpportunities = [
  { id: 'sav_1', student_id: 'usr_sahana', opportunity_id: 'opp_1', created_at: new Date().toISOString() },
  { id: 'sav_2', student_id: 'usr_sahana', opportunity_id: 'opp_2', created_at: new Date().toISOString() },
  { id: 'sav_3', student_id: 'usr_sahana', opportunity_id: 'opp_3', created_at: new Date().toISOString() }
];

let appliedOpportunities = [
  { id: 'app_1', student_id: 'usr_sahana', opportunity_id: 'opp_1', status: 'Applied', applied_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'app_2', student_id: 'usr_sahana', opportunity_id: 'opp_2', status: 'Under Review', applied_at: new Date(Date.now() - 86400000).toISOString() }
];

let notifications = [
  {
    id: 'notif_1',
    student_id: 'usr_sahana',
    opportunity_id: 'opp_3',
    type: 'deadline',
    title: 'Urgent Deadline: 1 Day Remaining!',
    message: 'The deadline for "Hands-on Generative AI & LLM Fine-Tuning Bootcamp" is tomorrow. Make sure your seat is secured!',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'notif_2',
    student_id: 'usr_sahana',
    opportunity_id: 'opp_1',
    type: 'deadline',
    title: 'Upcoming Deadline Alert (3 Days)',
    message: 'Bosch AI & REVA Research Park "AI & Deep Learning Research Intern" application closes in 3 days.',
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    id: 'notif_3',
    student_id: 'usr_sahana',
    opportunity_id: 'opp_2',
    type: 'new_match',
    title: 'New Matching Hackathon Posted!',
    message: 'You meet 100% of the eligibility criteria for "REVA HACK 4.0 - Annual National Hackathon".',
    is_read: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// Helper methods
const db = {
  getUsers: () => users,
  getUserById: (id) => users.find(u => u.id === id),
  getUserByEmail: (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  updateUserProfile: (id, updates) => {
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      return users[idx];
    }
    return null;
  },

  getOpportunities: () => [...opportunities],
  getOpportunityById: (id) => opportunities.find(o => o.id === id),
  createOpportunity: (oppData) => {
    const newOpp = {
      id: 'opp_' + Date.now(),
      created_at: new Date().toISOString(),
      ...oppData
    };
    opportunities.unshift(newOpp);
    return newOpp;
  },
  updateOpportunity: (id, updates) => {
    const idx = opportunities.findIndex(o => o.id === id);
    if (idx !== -1) {
      opportunities[idx] = { ...opportunities[idx], ...updates };
      return opportunities[idx];
    }
    return null;
  },
  deleteOpportunity: (id) => {
    const prevLen = opportunities.length;
    opportunities = opportunities.filter(o => o.id !== id);
    savedOpportunities = savedOpportunities.filter(s => s.opportunity_id !== id);
    return opportunities.length < prevLen;
  },

  getSaved: (studentId) => savedOpportunities.filter(s => s.student_id === studentId),
  isSaved: (studentId, oppId) => savedOpportunities.some(s => s.student_id === studentId && s.opportunity_id === oppId),
  toggleSave: (studentId, oppId) => {
    const idx = savedOpportunities.findIndex(s => s.student_id === studentId && s.opportunity_id === oppId);
    if (idx !== -1) {
      savedOpportunities.splice(idx, 1);
      return { saved: false };
    } else {
      savedOpportunities.push({
        id: 'sav_' + Date.now(),
        student_id: studentId,
        opportunity_id: oppId,
        created_at: new Date().toISOString()
      });
      return { saved: true };
    }
  },

  getApplied: (studentId) => appliedOpportunities.filter(a => a.student_id === studentId),
  isApplied: (studentId, oppId) => appliedOpportunities.some(a => a.student_id === studentId && a.opportunity_id === oppId),
  applyOpportunity: (studentId, oppId) => {
    const existing = appliedOpportunities.find(a => a.student_id === studentId && a.opportunity_id === oppId);
    if (existing) {
      return { alreadyApplied: true, application: existing };
    }
    const newApp = {
      id: 'app_' + Date.now(),
      student_id: studentId,
      opportunity_id: oppId,
      status: 'Applied',
      applied_at: new Date().toISOString()
    };
    appliedOpportunities.unshift(newApp);
    return { alreadyApplied: false, application: newApp };
  },

  createUser: (userData) => {
    const newUser = {
      id: 'usr_' + Date.now(),
      created_at: new Date().toISOString(),
      role: 'student',
      branch: 'AIML',
      semester: 6,
      cgpa: 8.0,
      backlogs: 0,
      skills: ['Python', 'Problem Solving'],
      interests: ['Artificial Intelligence'],
      bio: 'REVA University undergraduate student.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      ...userData
    };
    users.push(newUser);
    return newUser;
  },

  getNotifications: (studentId) => {
    return notifications
      .filter(n => n.student_id === studentId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },
  addNotification: (notif) => {
    const newNotif = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      created_at: new Date().toISOString(),
      is_read: false,
      ...notif
    };
    notifications.unshift(newNotif);
    return newNotif;
  },
  markNotificationRead: (studentId, notifId) => {
    const notif = notifications.find(n => n.id === notifId && n.student_id === studentId);
    if (notif) {
      notif.is_read = true;
      return notif;
    }
    return null;
  },
  markAllNotificationsRead: (studentId) => {
    notifications.forEach(n => {
      if (n.student_id === studentId) n.is_read = true;
    });
    return true;
  }
};

module.exports = db;


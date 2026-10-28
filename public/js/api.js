/**
 * CampusConnect - Client API Layer & Data Service
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Communicates with the Express REST API backend with automatic fallback to
 * client-side state when running in local offline/file mode.
 */

class CampusAPI {
  constructor() {
    this.currentUserId = localStorage.getItem('campus_active_user') || 'usr_sahana';
    this.isServerAvailable = false;
    this.baseUrl = window.location.origin.includes('http') ? window.location.origin : 'http://localhost:5000';
    this.initFallbackData();
  }

  // Initialize initial fallback data if accessed directly via file://
  initFallbackData() {
    this.localUsers = [
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

    const addDays = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    this.localOpportunities = [
      {
        id: 'opp_1',
        type: 'internships',
        title: 'AI & Deep Learning Research Intern',
        organizer: 'Robert Bosch Center for AI & REVA Research Park',
        location: 'Bengaluru (Hybrid)',
        stipend: '₹35,000 / month',
        duration: '6 Months',
        deadline: addDays(3),
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
        deadline: addDays(7),
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
        deadline: addDays(1),
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

    this.localSaved = ['opp_1', 'opp_2', 'opp_3'];
    this.localApplied = [
      { id: 'app_1', opportunity_id: 'opp_1', status: 'Applied', applied_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'app_2', opportunity_id: 'opp_2', status: 'Under Review', applied_at: new Date(Date.now() - 86400000).toISOString() }
    ];
    this.localNotifications = [
      {
        id: 'notif_1',
        opportunity_id: 'opp_3',
        type: 'deadline',
        title: 'Urgent Deadline: 1 Day Remaining!',
        message: 'The registration deadline for "Hands-on Generative AI & LLM Fine-Tuning Bootcamp" is tomorrow. Secure your seat!',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      },
      {
        id: 'notif_2',
        opportunity_id: 'opp_1',
        type: 'deadline',
        title: 'Upcoming Deadline Alert (3 Days)',
        message: 'Bosch AI & REVA Research Park "AI & Deep Learning Research Intern" application closes in 3 days.',
        is_read: false,
        created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      },
      {
        id: 'notif_3',
        opportunity_id: 'opp_2',
        type: 'new_match',
        title: 'New Matching Hackathon Posted!',
        message: 'You meet 100% of the eligibility criteria for "REVA HACK 4.0 - Annual National Hackathon".',
        is_read: true,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ];
  }

  getCurrentUser() {
    return this.localUsers.find(u => u.id === this.currentUserId) || this.localUsers[0];
  }

  setUserId(id) {
    this.currentUserId = id;
    localStorage.setItem('campus_active_user', id);
  }

  async checkServerHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/api/profile`, {
        headers: { 'x-user-id': this.currentUserId }
      });
      if (res.ok) {
        this.isServerAvailable = true;
        return true;
      }
    } catch (e) {
      this.isServerAvailable = false;
    }
    return false;
  }

  async getProfile() {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/profile`, {
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return data.user;
      } catch (e) {
        console.warn('Falling back to local profile');
      }
    }
    return this.getCurrentUser();
  }

  async updateProfile(updates) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': this.currentUserId
          },
          body: JSON.stringify(updates)
        });
        const data = await res.json();
        return data.user;
      } catch (e) {
        console.warn('Falling back to local profile update');
      }
    }
    const user = this.getCurrentUser();
    Object.assign(user, updates);
    return user;
  }

  async getOpportunities(filterType = 'all', searchQuery = '') {
    if (this.isServerAvailable) {
      try {
        let url = `${this.baseUrl}/api/opportunities?type=${filterType}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url, {
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return data.opportunities;
      } catch (e) {
        console.warn('Falling back to local opportunities');
      }
    }

    const user = this.getCurrentUser();
    let opps = [...this.localOpportunities];

    if (filterType !== 'all') {
      opps = opps.filter(o => o.type.toLowerCase() === filterType.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      opps = opps.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.organizer.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        (o.tags && o.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return opps.map(o => ({
      ...o,
      eligibility: window.CampusEngines ? window.CampusEngines.evaluateEligibility(user, o.eligibility_rules) : { isEligible: true, score: 100, passedRules: [], failedRules: [] },
      isSaved: this.localSaved.includes(o.id)
    }));
  }

  async getEligibleOpportunities() {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/opportunities/eligible`, {
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return data.opportunities;
      } catch (e) {
        console.warn('Falling back to local eligible calculation');
      }
    }

    const all = await this.getOpportunities('all');
    return all.filter(o => o.eligibility && o.eligibility.isEligible);
  }

  async getRecommendations() {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/recommendations`, {
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return data.recommendations;
      } catch (e) {
        console.warn('Falling back to local recommendation engine');
      }
    }

    const eligible = await this.getEligibleOpportunities();
    const user = this.getCurrentUser();
    return window.CampusEngines.rankRecommendations(user, eligible);
  }

  async toggleSave(opportunityId) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/saved/${opportunityId}`, {
          method: 'POST',
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return data.saved;
      } catch (e) {
        console.warn('Falling back to local toggleSave');
      }
    }

    const idx = this.localSaved.indexOf(opportunityId);
    if (idx !== -1) {
      this.localSaved.splice(idx, 1);
      return false;
    } else {
      this.localSaved.push(opportunityId);
      return true;
    }
  }

  async getSavedOpportunities() {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/saved`, {
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return data.savedOpportunities;
      } catch (e) {
        console.warn('Falling back to local saved');
      }
    }

    const all = await this.getOpportunities('all');
    return all.filter(o => this.localSaved.includes(o.id));
  }

  async getAppliedOpportunities() {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/applications`, {
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return (data.applications || []).map(a => ({
          ...a.opportunity,
          applicationStatus: a.status,
          appliedAt: a.applied_at
        }));
      } catch (e) {
        console.warn('Falling back to local applied');
      }
    }

    const all = await this.getOpportunities('all');
    const appliedMap = new Map(this.localApplied.map(a => [a.opportunity_id, a]));
    return all.filter(o => appliedMap.has(o.id)).map(o => ({
      ...o,
      applicationStatus: appliedMap.get(o.id).status,
      appliedAt: appliedMap.get(o.id).applied_at
    }));
  }

  async applyOpportunity(opportunityId) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/applications/${opportunityId}`, {
          method: 'POST',
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return data;
      } catch (e) {
        console.warn('Falling back to local applyOpportunity');
      }
    }

    const existing = this.localApplied.find(a => a.opportunity_id === opportunityId);
    if (existing) {
      return { success: true, alreadyApplied: true, message: 'Already applied' };
    }

    const newApp = {
      id: 'app_' + Date.now(),
      opportunity_id: opportunityId,
      status: 'Applied',
      applied_at: new Date().toISOString()
    };
    this.localApplied.unshift(newApp);

    this.localNotifications.unshift({
      id: 'notif_app_' + Date.now(),
      opportunity_id: opportunityId,
      type: 'system',
      title: 'Application Recorded',
      message: 'Your application has been received and logged under review.',
      is_read: false,
      created_at: new Date().toISOString()
    });

    return { success: true, alreadyApplied: false, message: 'Application submitted successfully!' };
  }

  async login(email) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success && data.user) {
          this.setUserId(data.user.id);
          return data;
        }
      } catch (e) {}
    }

    const user = this.localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      this.setUserId(user.id);
      return { success: true, user, message: `Welcome back, ${user.full_name}!` };
    }
    return { success: false, message: 'User not found with this REVA email' };
  }

  async signup(userData) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        if (data.success && data.user) {
          this.setUserId(data.user.id);
          return data;
        }
      } catch (e) {}
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      created_at: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: 'student',
      ...userData
    };
    this.localUsers.push(newUser);
    this.setUserId(newUser.id);
    return { success: true, user: newUser, message: `Account created for ${newUser.full_name}!` };
  }

  async getNotifications() {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/notifications`, {
          headers: { 'x-user-id': this.currentUserId }
        });
        const data = await res.json();
        return data;
      } catch (e) {
        console.warn('Falling back to local notifications');
      }
    }

    const notifs = [...this.localNotifications];
    return {
      unreadCount: notifs.filter(n => !n.is_read).length,
      notifications: notifs
    };
  }

  async markNotificationRead(id) {
    if (this.isServerAvailable) {
      try {
        await fetch(`${this.baseUrl}/api/notifications/${id}/read`, {
          method: 'PATCH',
          headers: { 'x-user-id': this.currentUserId }
        });
      } catch (e) {}
    }
    const notif = this.localNotifications.find(n => n.id === id);
    if (notif) notif.is_read = true;
  }

  async markAllNotificationsRead() {
    if (this.isServerAvailable) {
      try {
        await fetch(`${this.baseUrl}/api/notifications/read-all`, {
          method: 'POST',
          headers: { 'x-user-id': this.currentUserId }
        });
      } catch (e) {}
    }
    this.localNotifications.forEach(n => n.is_read = true);
  }

  async triggerDeadlineScheduler() {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/scheduler/trigger-deadlines`, {
          method: 'POST',
          headers: { 'x-user-id': this.currentUserId }
        });
        return await res.json();
      } catch (e) {}
    }

    // Local simulation
    const newNotif = {
      id: 'notif_sim_' + Date.now(),
      opportunity_id: 'opp_3',
      type: 'deadline',
      title: 'Automated Cron Alert: Deadline in 24 Hours!',
      message: 'node-cron scheduler triggered daily check: "Hands-on Generative AI Bootcamp" deadline ends tomorrow!',
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.localNotifications.unshift(newNotif);
    return { success: true, message: 'Cron scan executed successfully! 1 alert generated.' };
  }

  async createOpportunity(oppData) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/opportunities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': this.currentUserId
          },
          body: JSON.stringify(oppData)
        });
        return await res.json();
      } catch (e) {}
    }

    const newOpp = {
      id: 'opp_' + Date.now(),
      created_at: new Date().toISOString(),
      created_by: this.currentUserId,
      ...oppData
    };
    this.localOpportunities.unshift(newOpp);

    // Event-based notification for local mode
    this.localNotifications.unshift({
      id: 'notif_' + Date.now(),
      opportunity_id: newOpp.id,
      type: 'new_match',
      title: `New Opportunity: ${newOpp.title}`,
      message: `A new ${newOpp.type} has been posted by ${newOpp.organizer}. Check your eligibility!`,
      is_read: false,
      created_at: new Date().toISOString()
    });

    return { success: true, opportunity: newOpp };
  }

  async deleteOpportunity(id) {
    if (this.isServerAvailable) {
      try {
        const res = await fetch(`${this.baseUrl}/api/opportunities/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-id': this.currentUserId }
        });
        return await res.json();
      } catch (e) {}
    }

    this.localOpportunities = this.localOpportunities.filter(o => o.id !== id);
    return { success: true };
  }
}

window.apiService = new CampusAPI();


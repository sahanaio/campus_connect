# CampusConnect – Student Opportunities Platform
### REVA University, Bengaluru | Dept. of CSE (Artificial Intelligence & Machine Learning)
**Semester-End Capstone Project**

---

## 🚀 Overview
**CampusConnect** is a centralized web platform designed specifically for students of **REVA University** (AIML / CSE) that unifies all available academic and career opportunities:
- 💼 **Internships** (Research, Summer, Full-stack)
- ⚡ **Hackathons** (Smart India Hackathon, REVA Hack 4.0, Devpost)
- 🛠️ **Workshops** (Generative AI, Cloud DevOps, IEEE/ACM bootcamps)
- 📜 **Certifications** (AWS Cloud, Google TensorFlow, NPTEL)
- 🎓 **Scholarships** (REVA Chancellor Merit, SSP Karnataka)
- ⏱️ **Part-time Campus Opportunities** (REVA AI Lab Assistant, Peer Tutors)

### Core Highlights
1. **Automated Eligibility Engine**: Performs deterministic constraint checks on CGPA, semester, branch, active backlogs, and technical skills before a student applies.
2. **AIML Recommendation Engine**: Computes content-based **TF-IDF vector weights** and **Cosine Similarity** to rank opportunities according to each student's skills and interests.
3. **Automated Deadline & Event Notifications**: Sends event-based alerts when new opportunities match a student's profile, and schedule-based reminders for deadlines approaching in **7, 3, or 1 days**.
4. **Mandatory Stack Compliance**: Built with clean, standard-compliant **HTML5**, modern **CSS3** (custom design system), **JavaScript (ES6+)**, **Node.js + Express REST API**, and **Supabase / PostgreSQL**.

---

## 🛠️ Technology Stack
- **Frontend**: Semantic HTML5, CSS3 (Custom Variables, Flexbox, CSS Grid, Glassmorphic UI), Modern Vanilla JavaScript (ES6+ Fetch API, DOM Controller).
- **Backend**: Node.js, Express.js REST API.
- **Algorithms**:
  - Deterministic Rule-Based Evaluator (`eligibilityEngine.js`)
  - Vector Space Model with TF-IDF + Cosine Similarity (`recommendationEngine.js`)
- **Database & Services**: Supabase PostgreSQL Schema with Row Level Security (RLS), node-cron deadline scheduler simulation.

---

## 🏁 Quick Start Instructions

### 1. Start the Express Web Server
Open a terminal in the project directory:
```bash
npm start
```
The server will start at:
👉 **`http://localhost:5000`**

Open your browser and navigate to `http://localhost:5000`.

*(Note: The frontend also contains an automatic offline/standalone fallback mode in `api.js` if double-clicking `public/index.html` directly).*

---

## 🎯 How to Demonstrate to Examiners During the Viva

### 1. Test the Dynamic Eligibility Engine
- Look at the **"Persona" selector** in the top navigation bar.
- Switch to **Sahana M (AIML Sem 6 | 8.85 CGPA | 0 Backlogs)**:
  - She qualifies for the prestigious **Robert Bosch AI Research Intern** (Requires CGPA $\ge 8.0$, Sem 5–8, 0 backlogs, Python & ML).
  - Click **"Eligibility Breakdown"** on any card to show the green checkmarks checklist.
- Switch to **Rahul Sharma (CSE Sem 4 | 7.20 CGPA | 1 Backlog)**:
  - The dashboard updates in real-time!
  - Notice the Bosch AI card turns into **"⚠️ Criteria Partial (20%)"** with the Apply button disabled.
  - Click **"Eligibility Breakdown"** to show the examiner the exact failed criteria:
    - *Requires minimum CGPA 8.00 (Current: 7.20)*
    - *Requires Semesters 5, 6, 7, 8 (Current: Sem 4)*
    - *Requires at most 0 backlogs (Current: 1)*

### 2. Test the AIML Recommender Engine
- Click the **"✨ AI Recommendations"** tab in the navigation bar.
- Notice the **"✨ X% AI Skill Match"** badges and highlighted tags (e.g. `Python`, `Machine Learning`, `React`).
- Click the **"🧠 Recommender Math Breakdown (TF-IDF)"** button in the header:
  - Displays the KaTeX mathematical formulas:
    $$\text{TF}(t, d) = \frac{\text{count}(t, d)}{\text{total words}}$$
    $$\text{IDF}(t) = \ln\left(\frac{1 + N}{1 + \text{DF}(t)}\right) + 1$$
    $$\text{CosSim}(\mathbf{A}, \mathbf{B}) = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$$
  - Shows the student's extracted feature vector and the ranked Cosine Similarity score matrix.

### 3. Test the Deadline Alert Cron Scheduler
- Click the **"⚡ Run Deadline Cron Scan"** button in the top banner or inside the notification drawer.
- The system executes the cron job, identifies events expiring within 7, 3, or 1 days (e.g., *GenAI Bootcamp - 1 day left*), and creates urgent notifications with sound/toast alerts!
- Click the 🔔 notification bell to open the drawer and review unread notifications.

### 4. Test the Admin & Faculty Portal
- In the persona dropdown, switch to **Dr. C. Ramesh (Faculty Admin)** or click the **"⚙️ Admin Portal"** tab.
- Click **"➕ Post New Opportunity"**:
  - Fill in event details and use the interactive **Eligibility Rule Builder** (set min CGPA, target semesters, target branches, and required skills).
  - Submit the form. The system stores the opportunity and **instantly dispatches real-time alerts to all students who meet the criteria**!

---

## 📁 Project Directory Structure
```
campus_connect/
├── public/                       # Frontend Presentation Layer (Mandatory HTML, CSS, JS)
│   ├── index.html                # Semantic HTML5 Application Portal
│   ├── css/
│   │   ├── style.css             # REVA University Palette, Layouts & Themes
│   │   └── components.css        # Cards, Badges, Modals, Drawers & Forms
│   └── js/
│       ├── api.js                # API Client with Server Detection & Fallback
│       ├── engines.js            # Client-Side Eligibility & TF-IDF Vector Math
│       └── app.js                # State Controller, Tabs, Live Search & UI Events
├── server/                       # Backend Application Layer
│   ├── server.js                 # Express REST API & Routing
│   ├── database.js               # Supabase Schema & Seed Data (REVA Specific)
│   ├── engines/
│   │   ├── eligibilityEngine.js  # Automated Multi-Rule Constraint Evaluator
│   │   └── recommendationEngine.js # Content-Based TF-IDF Recommender
│   └── services/
│       └── notificationScheduler.js # Automated Deadline & Event Alert Dispatcher
├── docs/
│   └── ARCHITECTURE.md           # Comprehensive System Architecture Document
├── package.json                  # Dependencies & Start Scripts
└── README.md                     # Project Documentation & Viva Guide
```

---
*Created for Semester-End Project Evaluation at REVA University, Bengaluru.*


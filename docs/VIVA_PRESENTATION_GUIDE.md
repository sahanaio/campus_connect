# CampusConnect – Semester-End Project Defense & Viva Guide
### REVA University, Bengaluru
**Department of Computer Science and Engineering (AIML & CSE)**

---

## 🎓 1. Project Title & Presentation Outline

### Title
**CampusConnect: An Automated Eligibility Verification & Content-Based Recommendation Platform for University Student Opportunities**

### Team Members
- **Department**: CSE (AI & ML) / Computer Science and Engineering
- **Institution**: REVA University, Bengaluru

---

## 📽️ 2. Recommended 7-Slide Presentation Deck Structure

### Slide 1: Title & Introduction
- **Project Name**: CampusConnect
- **College/Dept**: REVA University, Bengaluru – Dept. of CSE (AIML)
- **Tagline**: Centralized student opportunities platform with automated constraint verification and AI recommendation ranking.

### Slide 2: Problem Statement & Motivation
- **Scattered Information**: Events posted on WhatsApp, Telegram, noticeboards, emails lead to missed deadlines.
- **Ineligible Submissions**: Students waste hours applying for internships or hackathons only to be rejected due to CGPA, branch, semester, or backlog criteria.
- **Information Overload**: 3rd/4th-year students receive irrelevant notifications that don't match their skills (e.g. NLP, Computer Vision, Cloud).

### Slide 3: Proposed Architecture
- **Layered 4-Tier Architecture**:
  1. *Presentation Layer*: HTML5, CSS3, JavaScript (ES6+).
  2. *Application Layer*: Node.js & Express REST API with Rule Evaluator and ML Recommender.
  3. *Data Layer*: Supabase PostgreSQL with Row Level Security (RLS).
  4. *External Layer*: Background Cron Scheduler & SMTP Email.
- Present the system architecture diagram from `docs/ARCHITECTURE.md`.

### Slide 4: Algorithmic Innovation 1 – Automated Eligibility Engine
- Multi-factor constraint checking in structured JSON:
  - CGPA Check ($\ge \text{min\_cgpa}$)
  - Semester Check ($\in \text{semesters}$)
  - Branch Check ($\in \text{branches}$)
  - Active Backlogs Check ($\le \text{max\_backlogs}$)
  - Prerequisite Skills Check ($\forall k \in \text{skills}$)
- Deterministic feedback: provides human-readable explanations of failed criteria rather than a generic rejection.

### Slide 5: Algorithmic Innovation 2 – Content-Based Recommender (AIML)
- **Vector Space Model (VSM)**:
  - $\text{TF}(t, d) = \frac{f_{t, d}}{\sum f}$
  - $\text{IDF}(t, D) = \ln\left(\frac{1 + |D|}{1 + \text{DF}(t)}\right) + 1$
  - $\text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\|\mathbf{A}\| \|\mathbf{B}\|}$
- Ranks qualified listings and produces a personalized Match Percentage (e.g. `✨ 92% AI Match`).

### Slide 6: Database Design & Security
- 5 Relational Tables: `profiles`, `opportunities`, `eligibility_rules`, `saved_opportunities`, `notifications`.
- Security: Supabase Row Level Security (RLS) ensures students access only their bookmarks and alerts; admin role gates create/delete operations.

### Slide 7: Live Demonstration & Results
- Demonstrate student vs faculty roles, live eligibility failure, recommendation ranking, and cron deadline scan.

---

## 🎬 3. Live Demonstration Walkthrough Script (3-Minute Viva Pitch)

### Step 1: Open the Application
Navigate to `http://localhost:5000`. Show the clean, responsive REVA University gold and navy interface.

> *"Respected examiners, CampusConnect brings together all student opportunities across six categories: Internships, Hackathons, Workshops, Certifications, Scholarships, and Part-time jobs."*

### Step 2: Show Successful Eligibility
Ensure the Persona selector is set to **Sahana M (AIML Sem 6 | 8.85 CGPA | 0 Backlogs)**.
- Scroll to the **Robert Bosch AI Research Intern** card.
- Point out the **"✅ Fully Eligible (100%)"** pill and active "Apply Now ↗" button.
- Click **"Eligibility Breakdown"**:
  > *"Here you can see our multi-factor engine evaluating 5 separate criteria: CGPA, Branch, Semester, Backlog count, and Prerequisite technical skills. All 5 pass."*

### Step 3: Show Dynamic Ineligibility Failure
Switch the Persona dropdown to **Rahul Sharma (CSE Sem 4 | 7.20 CGPA | 1 Backlog)**.
- Notice the same opportunity immediately updates to **"⚠️ Criteria Partial (20%)"** and disables the Apply button!
- Click **"Eligibility Breakdown"**:
  > *"Notice how the system informs Rahul with granular reasons: Requires minimum CGPA 8.00 (he has 7.20), open to semesters 5-8 (he is in sem 4), and requires 0 backlogs (he has 1). This prevents false submissions."*

### Step 4: Show the AIML Recommender (TF-IDF)
Click the **"✨ AI Recommendations"** tab.
- Click **"🧠 Recommender Math Breakdown (TF-IDF)"**:
  > *"Because our branch is CSE (AI & ML), we implemented a content-based recommendation engine. It extracts skills and interests from the student profile, computes TF-IDF weights, and calculates Cosine Similarity against opportunity descriptions."*

### Step 5: Trigger the Automated Deadline Scheduler
Click the top banner button **"⚡ Run Deadline Cron Scan"**.
- A toast notification appears, and the unread notification badge increments.
- Click the 🔔 bell to open the drawer:
  > *"Our node-cron background scheduler scans upcoming deadlines daily. Items expiring in 7, 3, or 1 days automatically trigger high-priority alerts for students."*

### Step 6: Show the Admin Opportunity Creator
Switch persona to **Dr. C. Ramesh (Faculty Coordinator)** and click **"⚙️ Admin Portal"** $\rightarrow$ **"➕ Post New Opportunity"**.
- Fill in a new listing and set rules using the interactive rule builder.
- Click **"Publish"**:
  > *"As soon as an opportunity is posted, the engine scans the student database and dispatches notifications immediately to all students who meet the criteria."*

---

## 💡 4. Top Examiner Viva Questions & Model Answers

### Q1: Why did you choose HTML, CSS, and JavaScript for the frontend instead of an opaque compiled framework?
**Answer**:
> "HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<dialog>`, `<article>`) ensure high accessibility and standards compliance. Using CSS3 variables and vanilla ES6+ allows us to demonstrate core DOM manipulation, asynchronous Fetch API handling, and modular architecture with zero build latency, while ensuring transparent inspectability during lab evaluations."

### Q2: How does your recommendation system handle new students who haven't saved any opportunities yet (Cold Start Problem)?
**Answer**:
> "Because we use **Content-Based Filtering** with TF-IDF rather than purely collaborative filtering, we do not suffer from the user cold-start problem. As soon as a student creates a profile with their technical skills and interests, our engine immediately projects their profile into the vector space and computes cosine similarity with opportunity listings."

### Q3: How do you verify eligibility if an opportunity doesn't specify all rules?
**Answer**:
> "The eligibility engine evaluates each rule conditionally. If an organizer leaves backlogs or skills unrestricted (empty array or undefined), those checks automatically pass with full weight. Only explicitly declared constraints are evaluated as restrictive predicates."

### Q4: How is data protected between students?
**Answer**:
> "Security is enforced at two layers:
> 1. Application Layer: Auth middleware validates Supabase JWTs and restricts admin-only endpoints (`POST /api/opportunities`, `DELETE`).
> 2. Database Layer: Supabase PostgreSQL Row Level Security (RLS) ensures students can only read and mutate their own bookmarks, profiles, and notifications."

### Q5: Have you tested the reliability of your algorithms?
**Answer**:
> "Yes, we wrote an automated test suite with unit tests in `test/engines.test.js` covering boundary conditions, stopword filtering, vector orthogonality, and deadline calculations. Running `npm test` executes and validates all test cases with a 100% pass rate."

---
*REVA University, Bengaluru • Dept. of CSE (AIML)*


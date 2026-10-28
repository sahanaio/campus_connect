/**
 * CampusConnect - Client-Side Engine Utilities
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Includes:
 * 1. Rule-Based Eligibility Engine
 * 2. TF-IDF & Cosine Similarity Content-Based Recommender
 */

const CampusEngines = {
  // Evaluates student profile against an opportunity's criteria
  evaluateEligibility(student, rules) {
    if (!rules || Object.keys(rules).length === 0) {
      return {
        isEligible: true,
        score: 100,
        passedRules: ['No specific restrictions defined by organizer.'],
        failedRules: []
      };
    }

    const passedRules = [];
    const failedRules = [];

    // 1. CGPA check
    if (typeof rules.min_cgpa === 'number') {
      const studentCgpa = parseFloat(student.cgpa) || 0;
      if (studentCgpa >= rules.min_cgpa) {
        passedRules.push(`CGPA requirement met: ${studentCgpa.toFixed(2)} ≥ ${rules.min_cgpa.toFixed(2)}`);
      } else {
        failedRules.push(`Requires minimum CGPA of ${rules.min_cgpa.toFixed(2)} (Your CGPA: ${studentCgpa.toFixed(2)})`);
      }
    }

    // 2. Branch check
    if (Array.isArray(rules.branches) && rules.branches.length > 0) {
      const studentBranch = (student.branch || '').toUpperCase().trim();
      const allowed = rules.branches.map(b => b.toUpperCase().trim());
      if (allowed.includes(studentBranch) || allowed.includes('ALL')) {
        passedRules.push(`Branch eligible: ${studentBranch} is permitted [${rules.branches.join(', ')}]`);
      } else {
        failedRules.push(`Open only to: ${rules.branches.join(', ')} (Your branch: ${studentBranch || 'Not set'})`);
      }
    }

    // 3. Semester check
    if (Array.isArray(rules.semesters) && rules.semesters.length > 0) {
      const studentSem = parseInt(student.semester, 10);
      const allowed = rules.semesters.map(s => parseInt(s, 10));
      if (allowed.includes(studentSem)) {
        passedRules.push(`Semester eligible: Semester ${studentSem} [Allowed: Sem ${allowed.join(', ')}]`);
      } else {
        failedRules.push(`Open to semesters: ${allowed.join(', ')} (Your semester: ${studentSem || 'Not set'})`);
      }
    }

    // 4. Backlog check
    if (typeof rules.max_backlogs === 'number') {
      const studentBacklogs = parseInt(student.backlogs, 10) || 0;
      if (studentBacklogs <= rules.max_backlogs) {
        passedRules.push(`Backlogs met: ${studentBacklogs} active backlogs (Max allowed: ${rules.max_backlogs})`);
      } else {
        failedRules.push(`Requires at most ${rules.max_backlogs} active backlog(s) (You have ${studentBacklogs})`);
      }
    }

    // 5. Skills check
    if (Array.isArray(rules.required_skills) && rules.required_skills.length > 0) {
      const studentSkills = (student.skills || []).map(s => s.toLowerCase().trim());
      const missing = [];
      const matched = [];

      rules.required_skills.forEach(skill => {
        const req = skill.toLowerCase().trim();
        const match = studentSkills.some(st => st.includes(req) || req.includes(st));
        if (match) matched.push(skill);
        else missing.push(skill);
      });

      if (missing.length === 0) {
        passedRules.push(`Required skills verified: ${matched.join(', ')}`);
      } else {
        failedRules.push(`Missing skill(s): ${missing.join(', ')} (Matched: ${matched.length > 0 ? matched.join(', ') : 'None'})`);
      }
    }

    const isEligible = failedRules.length === 0;
    const total = passedRules.length + failedRules.length;
    const score = total > 0 ? Math.round((passedRules.length / total) * 100) : 100;

    return {
      isEligible,
      score,
      passedRules,
      failedRules
    };
  },

  // Tokenizer & Stopword filter
  tokenize(text) {
    if (!text) return [];
    const stopWords = new Set([
      'a','about','above','after','again','all','am','an','and','any','are','as','at','be','because',
      'been','before','being','below','both','but','by','can','did','do','does','for','from','had',
      'has','have','he','her','here','him','his','how','i','if','in','into','is','it','its','me','more',
      'most','my','no','nor','not','now','of','off','on','once','only','or','other','our','out','over',
      'so','some','such','than','that','the','their','them','then','there','these','they','this','those',
      'through','to','too','under','until','up','very','was','we','were','what','when','where','which',
      'while','who','whom','why','will','with','you','your'
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 1 && !stopWords.has(w));
  },

  computeTF(tokens) {
    const tf = {};
    if (tokens.length === 0) return tf;
    tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
    for (const t in tf) tf[t] = tf[t] / tokens.length;
    return tf;
  },

  computeIDF(corpus) {
    const N = corpus.length;
    const df = {};
    corpus.forEach(doc => {
      const unique = new Set(doc);
      unique.forEach(t => { df[t] = (df[t] || 0) + 1; });
    });
    const idf = {};
    for (const t in df) {
      idf[t] = Math.log((1 + N) / (1 + df[t])) + 1;
    }
    return idf;
  },

  cosineSimilarity(vecA, vecB) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    keys.forEach(k => {
      const a = vecA[k] || 0;
      const b = vecB[k] || 0;
      dot += a * b;
      normA += a * a;
      normB += b * b;
    });
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  // Calculate TF-IDF ranking with explanation metrics
  rankRecommendations(student, opportunities) {
    if (!opportunities || opportunities.length === 0) return [];

    const studentText = `${(student.skills || []).join(' ')} ${(student.skills || []).join(' ')} ${(student.interests || []).join(' ')} ${student.branch || ''} ${student.bio || ''}`;
    const studentTokens = this.tokenize(studentText);

    const docTokensList = opportunities.map(opp => {
      const oppText = `${opp.title} ${opp.title} ${(opp.tags || []).join(' ')} ${(opp.tags || []).join(' ')} ${opp.type} ${opp.organizer} ${opp.description}`;
      return this.tokenize(oppText);
    });

    const corpus = [studentTokens, ...docTokensList];
    const idf = this.computeIDF(corpus);

    const studentTF = this.computeTF(studentTokens);
    const studentVec = {};
    for (const t in studentTF) {
      studentVec[t] = studentTF[t] * (idf[t] || 1);
    }

    const scored = opportunities.map((opp, idx) => {
      const oppTokens = docTokensList[idx];
      const oppTF = this.computeTF(oppTokens);
      const oppVec = {};
      for (const t in oppTF) {
        oppVec[t] = oppTF[t] * (idf[t] || 1);
      }

      const similarity = this.cosineSimilarity(studentVec, oppVec);

      // Find overlapping keywords for explainability in UI
      const oppTextLower = `${opp.title} ${(opp.tags || []).join(' ')} ${opp.description}`.toLowerCase();
      const matchedKeywords = [];
      const studentTerms = [...(student.skills || []), ...(student.interests || [])];
      studentTerms.forEach(term => {
        if (term && oppTextLower.includes(term.toLowerCase()) && !matchedKeywords.includes(term)) {
          matchedKeywords.push(term);
        }
      });

      const matchPercentage = Math.min(100, Math.round(similarity * 140));

      return {
        ...opp,
        recommendationScore: similarity,
        matchPercentage: Math.max(matchPercentage, matchedKeywords.length > 0 ? 50 + matchedKeywords.length * 10 : 25),
        matchedKeywords: matchedKeywords.slice(0, 5)
      };
    });

    return scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }
};

window.CampusEngines = CampusEngines;


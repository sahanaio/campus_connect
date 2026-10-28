/**
 * CampusConnect - Machine Learning Recommendation Engine
 * Department of Computer Science & Engineering (AIML), REVA University
 * 
 * Algorithm: Content-Based Filtering using TF-IDF (Term Frequency - Inverse Document Frequency)
 * and Cosine Similarity metric to rank eligible opportunities according to the student's profile.
 */

// Common English & domain stopwords to filter out noise
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
  'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 's', 'same', 'she', 'should', 'so', 'some', 'such', 't', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this',
  'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'you', 'your', 'yours', 'yourself',
  'yourselves'
]);

/**
 * Tokenize, clean, and extract n-grams/keywords
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length > 1 && !STOPWORDS.has(w));
}

/**
 * Compute Term Frequency (TF) for a document
 * TF(t, d) = count(t in d) / total_words(d)
 */
function computeTF(tokens) {
  const tf = {};
  if (tokens.length === 0) return tf;

  tokens.forEach(token => {
    tf[token] = (tf[token] || 0) + 1;
  });

  for (const token in tf) {
    tf[token] = tf[token] / tokens.length;
  }
  return tf;
}

/**
 * Compute Inverse Document Frequency (IDF) across a corpus of documents
 * IDF(t) = log( (1 + Total Documents) / (1 + Documents containing t) ) + 1
 */
function computeIDF(corpusTokensList) {
  const N = corpusTokensList.length;
  const df = {};

  corpusTokensList.forEach(tokens => {
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach(token => {
      df[token] = (df[token] || 0) + 1;
    });
  });

  const idf = {};
  for (const token in df) {
    idf[token] = Math.log((1 + N) / (1 + df[token])) + 1;
  }
  return idf;
}

/**
 * Compute Cosine Similarity between two TF-IDF vectors
 * CosSim(A, B) = (A . B) / (||A|| * ||B||)
 */
function cosineSimilarity(vectorA, vectorB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allKeys = new Set([...Object.keys(vectorA), ...Object.keys(vectorB)]);

  allKeys.forEach(key => {
    const valA = vectorA[key] || 0;
    const valB = vectorB[key] || 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Build rich textual representation of a student profile
 */
function buildStudentText(student) {
  const skillsText = (student.skills || []).join(' ');
  const interestsText = (student.interests || []).join(' ');
  const bio = student.bio || '';
  const branch = student.branch || '';
  // Repeat high-priority skills and interests for weight boosting
  return `${skillsText} ${skillsText} ${interestsText} ${interestsText} ${branch} ${bio}`;
}

/**
 * Build rich textual representation of an opportunity
 */
function buildOpportunityText(opportunity) {
  const tagsText = (opportunity.tags || []).join(' ');
  const title = opportunity.title || '';
  const type = opportunity.type || '';
  const desc = opportunity.description || '';
  const org = opportunity.organizer || '';
  // Repeat title and tags for higher relevance weight
  return `${title} ${title} ${tagsText} ${tagsText} ${type} ${org} ${desc}`;
}

/**
 * Rank opportunities using Content-Based TF-IDF + Cosine Similarity
 */
function rankRecommendations(studentProfile, opportunities) {
  if (!opportunities || opportunities.length === 0) return [];

  const studentTokens = tokenize(buildStudentText(studentProfile));
  const oppsTokensList = opportunities.map(opp => tokenize(buildOpportunityText(opp)));

  // Combine student tokens and opportunity tokens to form corpus
  const corpus = [studentTokens, ...oppsTokensList];
  const idf = computeIDF(corpus);

  // Compute student TF-IDF vector
  const studentTF = computeTF(studentTokens);
  const studentVector = {};
  for (const token in studentTF) {
    studentVector[token] = studentTF[token] * (idf[token] || 1);
  }

  // Calculate similarity for each opportunity
  const scoredOpportunities = opportunities.map((opp, idx) => {
    const oppTokens = oppsTokensList[idx];
    const oppTF = computeTF(oppTokens);
    const oppVector = {};

    for (const token in oppTF) {
      oppVector[token] = oppTF[token] * (idf[token] || 1);
    }

    const similarity = cosineSimilarity(studentVector, oppVector);

    // Identify matched highlight keywords
    const matchedKeywords = [];
    const studentSkillTokens = (studentProfile.skills || []).map(s => s.toLowerCase());
    const studentInterestTokens = (studentProfile.interests || []).map(i => i.toLowerCase());

    const oppTextLower = buildOpportunityText(opp).toLowerCase();
    [...studentSkillTokens, ...studentInterestTokens].forEach(term => {
      if (term && oppTextLower.includes(term) && !matchedKeywords.includes(term)) {
        matchedKeywords.push(term);
      }
    });

    // Score normalized to percentage (scaling small cosine ranges)
    const matchPercentage = Math.min(100, Math.round(similarity * 140));

    return {
      ...opp,
      recommendationScore: similarity,
      matchPercentage: Math.max(matchPercentage, matchedKeywords.length > 0 ? 45 + matchedKeywords.length * 10 : 20),
      matchedKeywords: matchedKeywords.slice(0, 5)
    };
  });

  // Sort descending by recommendation score
  return scoredOpportunities.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

module.exports = {
  rankRecommendations,
  tokenize,
  cosineSimilarity
};


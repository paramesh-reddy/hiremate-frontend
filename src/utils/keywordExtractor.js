/**
 * Client-side keyword extraction from a job description.
 * Fast, zero-latency — runs in the browser before any API call.
 * For higher-quality extraction use extractKeywordsAPI (server-side LLM).
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
  'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very',
  'just', 'about', 'above', 'after', 'also', 'into', 'its', 'our', 'their',
  'this', 'that', 'these', 'those', 'your', 'you', 'we', 'they', 'who',
  'what', 'which', 'when', 'where', 'how', 'all', 'any', 'while', 'work',
  'team', 'role', 'position', 'company', 'skills', 'experience', 'strong',
  'ability', 'knowledge', 'understanding', 'passionate', 'collaborate',
  'support', 'ensure', 'provide', 'develop', 'build', 'create', 'manage',
]);

// Well-known tech terms always included even if freq=1
const TECH_TERMS = new Set([
  'react', 'typescript', 'javascript', 'python', 'java', 'golang', 'rust',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'k8s', 'terraform',
  'postgresql', 'postgres', 'mongodb', 'redis', 'elasticsearch', 'kafka',
  'graphql', 'rest', 'grpc', 'fastapi', 'django', 'flask', 'express',
  'node', 'nodejs', 'nextjs', 'vue', 'angular', 'svelte',
  'ci/cd', 'agile', 'scrum', 'git', 'github', 'gitlab',
  'sql', 'nosql', 'linux', 'bash', 'spark', 'airflow', 'dbt',
  'pytorch', 'tensorflow', 'langchain', 'openai', 'llm', 'ml', 'ai',
  'tailwind', 'figma', 'jira', 'confluence',
]);

/**
 * Extract the top ~30 keywords from a job description string.
 * Returns an array of lowercase keyword strings.
 *
 * @param {string} jd
 * @returns {string[]}
 */
export function extractKeywords(jd) {
  if (!jd || typeof jd !== 'string') return [];

  // Normalise: keep letters, digits, +, #, . (for C#, C++, .NET)
  const normalized = jd.toLowerCase().replace(/[^\w\s+#./-]/g, ' ');

  // Tokenise on whitespace
  const tokens = normalized.split(/\s+/).filter(
    (w) => w.length > 2 && !STOP_WORDS.has(w)
  );

  // Frequency map
  const freq = new Map();
  for (const w of tokens) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  // Tech terms found in the JD (guaranteed inclusion)
  const techFound = [...new Set(tokens.filter((w) => TECH_TERMS.has(w)))];

  // Top words by frequency (excluding stop words already filtered)
  const topByFreq = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
    .map(([w]) => w);

  // Merge: tech terms first, then freq-ranked, deduplicated
  return [...new Set([...techFound, ...topByFreq])].slice(0, 30);
}

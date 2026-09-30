// ==============================================================================
// Modern Matrix AI Interview Monitoring System - Role-Based Weighting Engine
// Configures dynamic Text-Based (Whisper) vs. Acoustic-Based (Audio) weights by Job Role
// ==============================================================================

/**
 * Standard default weight presets by job role category
 */
export const DEFAULT_ROLE_WEIGHTS = {
  'Software Engineer': {
    textWeight: 70,
    acousticWeight: 30,
    category: 'Engineering & Technology',
    focus: 'Technical problem-solving, code syntax, algorithms, and system design logic.',
  },
  'Full Stack Developer': {
    textWeight: 70,
    acousticWeight: 30,
    category: 'Engineering & Technology',
    focus: 'Full-stack paradigms, API design, database schemas, and implementation rigor.',
  },
  'AI Specialist': {
    textWeight: 75,
    acousticWeight: 25,
    category: 'Data Science & Machine Learning',
    focus: 'Algorithmic depth, mathematical understanding, and model optimization.',
  },
  'Data Analyst': {
    textWeight: 65,
    acousticWeight: 35,
    category: 'Data Science & Analytics',
    focus: 'SQL queries, data modeling, statistical rigor, and business metrics.',
  },
  'Cloud Architect': {
    textWeight: 65,
    acousticWeight: 35,
    category: 'Infrastructure & DevOps',
    focus: 'Distributed systems, high-availability architecture, and incident response.',
  },
  'DevOps Engineer': {
    textWeight: 65,
    acousticWeight: 35,
    category: 'Infrastructure & DevOps',
    focus: 'CI/CD pipelines, container orchestration, automation, and infrastructure.',
  },
  'UX Designer': {
    textWeight: 45,
    acousticWeight: 55,
    category: 'Design & Creative',
    focus: 'User empathy, design critique, visual systems, and user journey reasoning.',
  },
  'Product Manager': {
    textWeight: 50,
    acousticWeight: 50,
    category: 'Product & Leadership',
    focus: 'Balanced technical strategy, product roadmap reasoning, and cross-functional leadership.',
  },
  'Marketing Manager': {
    textWeight: 40,
    acousticWeight: 60,
    category: 'Marketing & Brand Strategy',
    focus: 'Brand positioning, creative messaging, market analytics, and persuasive speech.',
  },
  'HR Coordinator': {
    textWeight: 30,
    acousticWeight: 70,
    category: 'Human Resources & People Ops',
    focus: 'Interpersonal empathy, active listening, cultural alignment, and emotional composure.',
  },
  'HR Specialist': {
    textWeight: 30,
    acousticWeight: 70,
    category: 'Human Resources & People Ops',
    focus: 'Conversational tone, mediation composure, candidate engagement, and verbal warmth.',
  },
  'Sales Executive': {
    textWeight: 35,
    acousticWeight: 65,
    category: 'Sales & Client Relations',
    focus: 'Persuasive inflection, vocal confidence, cadence stability, and rapport building.',
  },
  'Default': {
    textWeight: 60,
    acousticWeight: 40,
    category: 'General Assessment Profile',
    focus: 'Balanced standard assessment weighting text content and acoustic delivery.',
  },
};

/**
 * Retrieves custom overrides map from localStorage
 */
function getCustomMap() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mm_custom_role_weights');
      if (stored) {
        return JSON.parse(stored) || {};
      }
    } catch (_) {}
  }
  return {};
}

/**
 * Retrieves the configured weights for a given job position.
 * Checks localStorage for custom override first; falls back to default preset.
 *
 * @param {string} position
 * @returns {{ textWeight: number, acousticWeight: number, focus?: string, category?: string, isCustom?: boolean }}
 */
export function getRoleWeights(position) {
  if (!position) return { ...DEFAULT_ROLE_WEIGHTS['Default'], isCustom: false };

  // 1. Check custom overrides saved in localStorage
  const customMap = getCustomMap();
  if (customMap[position]) {
    return { ...customMap[position], isCustom: true };
  }

  // 2. Exact match in default presets
  if (DEFAULT_ROLE_WEIGHTS[position]) {
    return { ...DEFAULT_ROLE_WEIGHTS[position], isCustom: false };
  }

  // 3. Fuzzy match by keyword
  const norm = position.toLowerCase();
  for (const [key, preset] of Object.entries(DEFAULT_ROLE_WEIGHTS)) {
    if (key === 'Default') continue;
    const keyNorm = key.toLowerCase();
    if (norm.includes(keyNorm) || keyNorm.includes(norm)) {
      return { ...preset, isCustom: false };
    }
  }

  if (norm.includes('engineer') || norm.includes('developer') || norm.includes('architect') || norm.includes('tech')) {
    return { ...DEFAULT_ROLE_WEIGHTS['Software Engineer'], isCustom: false };
  }
  if (norm.includes('manager') || norm.includes('lead') || norm.includes('product')) {
    return { ...DEFAULT_ROLE_WEIGHTS['Product Manager'], isCustom: false };
  }
  if (norm.includes('hr') || norm.includes('talent') || norm.includes('people') || norm.includes('sales')) {
    return { ...DEFAULT_ROLE_WEIGHTS['HR Coordinator'], isCustom: false };
  }
  if (norm.includes('data') || norm.includes('analyst')) {
    return { ...DEFAULT_ROLE_WEIGHTS['Data Analyst'], isCustom: false };
  }

  return { ...DEFAULT_ROLE_WEIGHTS['Default'], isCustom: false };
}

/**
 * Saves custom weights for a specific role
 * @param {string} position
 * @param {number} textWeight
 * @param {number} acousticWeight
 * @param {string} [category]
 */
export function saveRoleWeights(position, textWeight, acousticWeight, category = 'Custom Configuration') {
  if (!position) return;
  const safeText = Math.max(0, Math.min(100, Math.round(Number(textWeight) || 0)));
  const safeAcoustic = 100 - safeText;

  if (typeof window !== 'undefined') {
    try {
      const stored = getCustomMap();
      stored[position] = {
        textWeight: safeText,
        acousticWeight: safeAcoustic,
        category: stored[position]?.category || category,
        focus: `Configured: ${safeText}% Text Linguistic / ${safeAcoustic}% Acoustic Demeanor`,
      };
      localStorage.setItem('mm_custom_role_weights', JSON.stringify(stored));
    } catch (e) {
      console.warn('Failed to save custom role weights:', e);
    }
  }
}

/**
 * Returns all configured role weights (merging defaults and custom overrides)
 * @returns {Array<{ position: string, textWeight: number, acousticWeight: number, category: string, focus: string, isCustom: boolean }>}
 */
export function getAllRoleWeights() {
  const customMap = getCustomMap();
  const allRoles = new Map();

  // Load defaults first
  for (const [position, config] of Object.entries(DEFAULT_ROLE_WEIGHTS)) {
    if (position === 'Default') continue;
    allRoles.set(position, {
      position,
      textWeight: config.textWeight,
      acousticWeight: config.acousticWeight,
      category: config.category,
      focus: config.focus,
      isCustom: false,
    });
  }

  // Merge custom overrides
  for (const [position, config] of Object.entries(customMap)) {
    allRoles.set(position, {
      position,
      textWeight: config.textWeight,
      acousticWeight: config.acousticWeight,
      category: config.category || 'Custom Configuration',
      focus: config.focus || `Configured: ${config.textWeight}% Text / ${config.acousticWeight}% Acoustic`,
      isCustom: true,
    });
  }

  return Array.from(allRoles.values());
}

/**
 * Deletes or resets a custom role weight override
 * @param {string} position
 */
export function resetRoleWeight(position) {
  if (typeof window !== 'undefined') {
    try {
      const stored = getCustomMap();
      delete stored[position];
      localStorage.setItem('mm_custom_role_weights', JSON.stringify(stored));
    } catch (e) {
      console.warn('Failed to reset role weight:', e);
    }
  }
}

/**
 * Computes the Composite Final Score combining Text Score and Acoustic Score
 *
 * @param {object} params
 * @param {number} params.textScore - 0 to 100%
 * @param {number} params.acousticScore - 0 to 100%
 * @param {number} params.textWeight - 0 to 100%
 * @param {number} params.acousticWeight - 0 to 100%
 * @returns {number} Composite Score (0 to 100%)
 */
export function calculateCompositeFinalScore({
  textScore = 80,
  acousticScore = 80,
  textWeight = 60,
  acousticWeight = 40,
}) {
  const t = Math.max(0, Math.min(100, Number(textScore) || 0));
  const a = Math.max(0, Math.min(100, Number(acousticScore) || 0));
  const tw = Math.max(0, Math.min(100, Number(textWeight) || 0)) / 100;
  const aw = Math.max(0, Math.min(100, Number(acousticWeight) || 0)) / 100;

  return Math.round((t * tw) + (a * aw));
}

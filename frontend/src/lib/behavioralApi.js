// ============================================================
// Modern Matrix — Behavioral Evaluation Model API Client
// Implements Acoustic Behavioral Analysis & Scoring
// Calls the trained model hosted via Cloudflare Tunnel (Colab)
//
// API Request: POST /predict with FormData { file: audioBlob }
// Expected API Response:
// {
//   "confidence":       7.0,     // raw score (1-10 scale)
//   "attitude":         7.0,     // raw score (1-10 scale)
//   "transparency":     7.0,     // raw score (1-10 scale)
//   "confidence_100":   100.0,   // percentage (0-100)
//   "attitude_100":     100.0,   // percentage (0-100)
//   "transparency_100": 100.0,   // percentage (0-100)
//   "overall_100":      100.0,   // overall percentage (0-100)
//   "audio_seconds":    16.5,
//   "processing_seconds": 33.9
// }
// ============================================================

const BEHAVIORAL_API_URL = import.meta.env.VITE_BEHAVIORAL_API_URL;

/**
 * Checks if the Behavioral API URL is configured.
 * @returns {boolean}
 */
export function isBehavioralApiConfigured() {
  return !!(BEHAVIORAL_API_URL && !BEHAVIORAL_API_URL.includes('your-') && BEHAVIORAL_API_URL.trim().length > 0);
}

/**
 * Sends an audio blob to the Behavioral Evaluation model API.
 * @param {Blob} audioBlob - Audio blob (WAV preferred, WebM also accepted)
 * @param {string} [filename='interview_audio.wav'] - Filename to send with the request
 * @returns {Promise<Object>} Raw API response
 */
export async function callBehavioralAPI(audioBlob, filename = 'interview_audio.wav') {
  if (!isBehavioralApiConfigured()) {
    throw new Error('Behavioral API URL is not configured. Set VITE_BEHAVIORAL_API_URL in .env.local');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, filename);

  const response = await fetch(`${BEHAVIORAL_API_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.error || errorMsg;
    } catch (_) {
      errorMsg = await response.text().catch(() => errorMsg);
    }
    throw new Error(`Behavioral API error: ${errorMsg}`);
  }

  return await response.json();
}

/**
 * Maps the raw API response to the 3 behavioral score categories + overall.
 * Normalizes 0-10 or 0-100 scales into clean 0-100 percentages.
 *
 * @param {Object} apiResult - Raw API response
 * @returns {{
 *   confidence: number,
 *   attitude: number,
 *   transparency: number,
 *   honesty: number,
 *   overall: number,
 *   audioSeconds: number,
 *   processingSeconds: number,
 *   raw: Object
 * }}
 */
export function mapToBehavioralScores(apiResult) {
  if (!apiResult) {
    return {
      confidence: 80,
      attitude: 85,
      transparency: 80,
      honesty: 80,
      overall: 82,
      audioSeconds: 0,
      processingSeconds: 0,
      raw: {},
    };
  }

  const parseScore = (val100, valRaw) => {
    if (val100 != null && !isNaN(val100)) {
      return Math.max(0, Math.min(100, Math.round(Number(val100))));
    }
    if (valRaw != null && !isNaN(valRaw)) {
      const num = Number(valRaw);
      return Math.max(0, Math.min(100, Math.round(num <= 10 ? num * 10 : num)));
    }
    return 80;
  };

  const confidence = parseScore(apiResult.confidence_100, apiResult.confidence);
  const attitude = parseScore(apiResult.attitude_100, apiResult.attitude);
  const transparency = parseScore(
    apiResult.transparency_100 ?? apiResult.honesty_100,
    apiResult.transparency ?? apiResult.honesty
  );

  const overall = apiResult.overall_100 != null && !isNaN(apiResult.overall_100)
    ? Math.max(0, Math.min(100, Math.round(Number(apiResult.overall_100))))
    : Math.round((confidence + attitude + transparency) / 3);

  return {
    confidence,
    attitude,
    transparency,
    honesty: transparency,
    overall,
    audioSeconds: Number(apiResult.audio_seconds) || 0,
    processingSeconds: Number(apiResult.processing_seconds) || 0,
    raw: apiResult,
  };
}

// ============================================================
// Modern Matrix — Behavioral Evaluation Model API Client
// Implements FR-12: Behavioral Analysis & Scoring
// Calls the trained model hosted via Cloudflare Tunnel (Colab)
//
// API Request: POST /predict with FormData { file: audioBlob }
// API Response Format:
// {
//   "confidence":       5.908,   // raw score (1-10 scale)
//   "attitude":         6.925,   // raw score (1-10 scale)
//   "transparency":     5.286,   // raw score (1-10 scale)
//   "confidence_100":  81.8,    // percentage (0-100)
//   "attitude_100":    98.8,    // percentage (0-100)
//   "transparency_100":71.4,    // percentage (0-100)
//   "overall_100":     84,      // overall percentage (0-100)
//   "audio_seconds":   16.5,    // audio duration processed
//   "processing_seconds": 33.9  // server processing time
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
 * @throws {Error} if the API URL is not configured, or the request fails
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
 * All values are percentages (0-100), directly from the API's _100 fields.
 *
 * @param {Object} apiResult - Raw API response
 * @returns {{
 *   confidence: number,
 *   attitude: number,
 *   transparency: number,
 *   overall: number,
 *   audioSeconds: number,
 *   processingSeconds: number
 * }}
 */
export function mapToBehavioralScores(apiResult) {
  return {
    confidence:        Math.round(apiResult.confidence_100  ?? 0),
    attitude:          Math.round(apiResult.attitude_100    ?? 0),
    transparency:      Math.round(apiResult.transparency_100 ?? 0),
    overall:           Math.round(apiResult.overall_100     ?? 0),
    audioSeconds:      apiResult.audio_seconds              ?? 0,
    processingSeconds: apiResult.processing_seconds         ?? 0,
  };
}

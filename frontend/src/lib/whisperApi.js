// ============================================================
// Modern Matrix — Whisper ASR Model API Client
// Implements Transcription & Linguistic Scoring Engine
// Calls the trained Whisper model hosted via Cloudflare Tunnel
//
// Expected API Response Formats:
// {
//   "filename": "P5.wav",
//   "transcript": "So please tell me about yourself...",
//   "is_relevant": true,
//   "similarity_score": 0.5526,   // 0.0 - 1.0 (or 0 - 100)
//   "predicted_score": 4.73       // 1.0 - 10.0 (or 0 - 100)
// }
// ============================================================

const WHISPER_API_URL = import.meta.env.VITE_WHISPER_API_URL;

/**
 * Sends an audio blob to the trained Whisper ASR model API.
 * @param {Blob} wavBlob - A 16kHz Mono PCM WAV blob
 * @returns {Promise<{
 *   success: boolean,
 *   filename: string,
 *   transcript: string,
 *   is_relevant: boolean,
 *   similarity_score: number,
 *   predicted_score: number
 * }>}
 */
export async function callWhisperAPI(wavBlob) {
  if (!WHISPER_API_URL || WHISPER_API_URL.includes('your-cloudflare-link')) {
    throw new Error('Whisper API URL is not configured. Please set VITE_WHISPER_API_URL in your .env.local file.');
  }

  const formData = new FormData();
  formData.append('file', wavBlob, 'interview_audio.wav');

  const response = await fetch(WHISPER_API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let errorText = `HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      errorText = errJson.detail || errJson.error || errorText;
    } catch (_) {
      errorText = await response.text().catch(() => errorText);
    }
    throw new Error(`Whisper API error: ${errorText}`);
  }

  const result = await response.json();

  if (result.success === false) {
    throw new Error(`Whisper API reported failure: ${JSON.stringify(result)}`);
  }

  // Robust field normalization
  const transcript = result.transcript ?? result.text ?? result.transcription ?? '';
  let predictedScore = result.predicted_score ?? result.score ?? result.prediction ?? null;
  let similarityScore = result.similarity_score ?? result.similarity ?? result.relevance_score ?? null;
  let isRelevant = result.is_relevant ?? result.relevant ?? null;

  if (predictedScore != null) {
    predictedScore = Number(predictedScore);
  }
  if (similarityScore != null) {
    similarityScore = Number(similarityScore);
    // If similarity_score is returned on 0-100 scale, normalize to 0.0-1.0
    if (similarityScore > 1 && similarityScore <= 100) {
      similarityScore = similarityScore / 100;
    }
  }

  if (isRelevant === null) {
    isRelevant = similarityScore != null ? similarityScore >= 0.45 : true;
  }

  return {
    success: true,
    filename: result.filename || 'interview_audio.wav',
    transcript: transcript.trim(),
    predicted_score: predictedScore,
    similarity_score: similarityScore,
    is_relevant: Boolean(isRelevant),
    raw: result,
  };
}

/**
 * Returns the score tier based on predicted_score (1-10 scale)
 * @param {number} score
 * @returns {'green' | 'amber' | 'red'}
 */
export function getScoreColor(score) {
  if (score >= 7) return 'green';
  if (score >= 5) return 'amber';
  return 'red';
}

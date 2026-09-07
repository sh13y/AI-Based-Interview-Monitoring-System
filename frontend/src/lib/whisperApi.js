// ============================================================
// Modern Matrix — Whisper ASR Model API Client
// Implements FR-12: Transcription Engine
// Calls the trained Whisper model hosted via Cloudflare Tunnel
//
// API Response Format:
// {
//   success: true,
//   filename: "P5.wav",
//   transcript: "So please tell me about yourself...",
//   is_relevant: true,
//   similarity_score: 0.5526,   // 0.0 - 1.0
//   predicted_score: 4.73       // 1.0 - 10.0
// }
// ============================================================

const WHISPER_API_URL = import.meta.env.VITE_WHISPER_API_URL;

/**
 * Sends a WAV audio blob to the trained Whisper ASR model API.
 * @param {Blob} wavBlob - A 16kHz Mono PCM WAV blob (output of preprocessAudioToWav)
 * @returns {Promise<{ success: boolean, filename: string, transcript: string, is_relevant: boolean, similarity_score: number, predicted_score: number }>}
 * @throws {Error} if the API URL is not configured, the network request fails, or the API returns a non-OK status
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
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Whisper API returned HTTP ${response.status}: ${errorText}`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(`Whisper API reported failure: ${JSON.stringify(result)}`);
  }

  return result;
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

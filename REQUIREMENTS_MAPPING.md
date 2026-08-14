# Modern Matrix — AI Based Automated Interview Monitoring System
## Functional Requirements Traceability Matrix (EC04 Phase I)

**Project Title**: AI Based Automated Interview Monitoring System  
**Team Name**: Modern Matrix  
**Institution**: Rajarata University of Sri Lanka — Faculty of Applied Sciences, Department of Computing  
**Course Code**: ICT 3411 / COM 3405  
**Supervisor**: Ms. A K N L Aththanagoda  

---

### 1. Codebase Requirement Mapping Index

| File Path | Implemented Functional Requirements | Key Tagged Modules & Functions |
|---|---|---|
| [`frontend/src/App.jsx`](./frontend/src/App.jsx) | **`[FR-01, FR-02, FR-03, FR-04, FR-06 – FR-21]`** | Route definitions, `AdminRoute` & `ProtectedRoute` RBAC wrappers. |
| [`frontend/src/context/AuthContext.jsx`](./frontend/src/context/AuthContext.jsx) | **`[FR-01, FR-02, FR-19, FR-21]`** | `login()`, `signup()`, `logout()`, `switchRole()`, audit logging. |
| [`frontend/src/pages/Candidates.jsx`](./frontend/src/pages/Candidates.jsx) | **`[FR-03, FR-02, FR-21]`** | `handleAddCandidate()`, `handleEditCandidate()`, `handleDeleteCandidate()`, search and filters. |
| [`frontend/src/components/Modals/AddCandidateModal.jsx`](./frontend/src/components/Modals/AddCandidateModal.jsx) | **`[FR-03]`** | Candidate registration & PDF resume upload with Base64 encoding. |
| [`frontend/src/components/Modals/EditCandidateModal.jsx`](./frontend/src/components/Modals/EditCandidateModal.jsx) | **`[FR-03]`** | Candidate profile editing & CV file replacement. |
| [`frontend/src/components/Modals/CandidateDetailModal.jsx`](./frontend/src/components/Modals/CandidateDetailModal.jsx) | **`[FR-03]`** | Candidate profile inspection, **Actual Embedded Native PDF Viewer**, and `.pdf` download. |
| [`frontend/src/pages/QuestionBank.jsx`](./frontend/src/pages/QuestionBank.jsx) | **`[FR-04, FR-02, FR-21]`** | `handleAddQuestion()`, `handleEditQuestion()`, `handleDeleteQuestion()`, duplicate validation. |
| [`frontend/src/components/Modals/AddQuestionModal.jsx`](./frontend/src/components/Modals/AddQuestionModal.jsx) | **`[FR-04]`** | Question creation, category selection, difficulty levels, and AI scoring weights. |
| [`frontend/src/pages/LiveInterview.jsx`](./frontend/src/pages/LiveInterview.jsx) | **`[FR-06, FR-07, FR-08, FR-09, FR-10, FR-12, FR-15, FR-18, FR-21]`** | Real microphone capture, 60 FPS Canvas dynamic visualizer, 5s auto-checkpoint recovery, 16kHz mono WAV conversion, 60 dB noise meter, Whisper ASR output, question tracker, and completed session audio playback. |
| [`frontend/src/lib/audioProcessor.js`](./frontend/src/lib/audioProcessor.js) | **`[FR-09]`** | Browser-native 16-bit Linear PCM 16kHz Mono WAV encoder and volume peak normalizer. |
| [`frontend/src/lib/pdfGenerator.js`](./frontend/src/lib/pdfGenerator.js) | **`[FR-03]`** | Standardized A4 PDF generation engine and direct `.pdf` download handler. |
| [`frontend/src/pages/InterviewSessions.jsx`](./frontend/src/pages/InterviewSessions.jsx) | **`[FR-18, FR-06]`** | Session history list, candidate/evaluator search, status filter, and live session launcher. |
| [`frontend/src/pages/CandidateReport.jsx`](./frontend/src/pages/CandidateReport.jsx) | **`[FR-03, FR-10, FR-12]`** | Behavioral radar evaluation, Whisper transcript WER/CER validation, and native PDF preview/download. |
| [`frontend/src/pages/Settings.jsx`](./frontend/src/pages/Settings.jsx) | **`[FR-19, FR-21]`** | User profile management, password update validation, and security audit logging. |
| [`frontend/src/pages/SystemMaintenance.jsx`](./frontend/src/pages/SystemMaintenance.jsx) | **`[FR-02, FR-20, FR-21]`** | Admin system diagnostics, 30-day automated purge trigger, and real-time audit log viewer. |
| [`frontend/src/components/Modals/ManageUsersModal.jsx`](./frontend/src/components/Modals/ManageUsersModal.jsx) | **`[FR-02, FR-18, FR-21]`** | Admin HR Manager deletion, account locking/unlocking, interview session logs, and login/auth history tracking. |
| [`frontend/src/lib/supabase.js`](./frontend/src/lib/supabase.js) | **`[FR-20, FR-21]`** | Supabase client setup, PostgreSQL RPC data purge execution, and immutable audit log storage. |
| [`database/supabase_migration.sql`](./database/supabase_migration.sql) | **`[FR-01 – FR-21]`** | Relational tables (`users`, `candidates`, `question_bank`, `interview_sessions`, `transcripts`, `behavioral_scores`, `audit_logs`) and `purge_expired_records()` RPC function. |

---

### 2. Functional Requirements Detailed Specification

| Requirement ID | Requirement Name | Description | Status | Implementation Details |
|---|---|---|---|---|
| **FR-01** | User Login | Authenticate users with email / User ID and password, session tokens, and input validation. | ✅ Completed | `Login.jsx`, `Signup.jsx`, `AuthContext.jsx` |
| **FR-02** | Role-Based Access Control (RBAC) | Restrict administrative operations (system maintenance, deleting candidates/questions/users) to Admins only. | ✅ Completed | `App.jsx` (`AdminRoute`), `ManageUsersModal.jsx`, `Candidates.jsx`, `QuestionBank.jsx` |
| **FR-03** | Candidate Data Management | Create, view, update, search, delete candidate profiles with PDF CV attachment preview and download. | ✅ Completed | `Candidates.jsx`, `AddCandidateModal.jsx`, `CandidateDetailModal.jsx`, `pdfGenerator.js` |
| **FR-04** | Question Bank Management | Add, search, filter, edit, and delete interview questions with duplicate prevention, categories, difficulty, and AI weights. | ✅ Completed | `QuestionBank.jsx`, `AddQuestionModal.jsx` |
| **FR-06** | Audio Stream Capture | Capture continuous microphone audio input using Web Audio API / `MediaRecorder`. | ✅ Completed | `LiveInterview.jsx`, `InterviewSessions.jsx` |
| **FR-07** | Signal Feedback | Provide real-time dynamic visualizer at 60 FPS (waveform and frequency equalizer) during live recording. | ✅ Completed | `LiveInterview.jsx` (Canvas HTML5 API) |
| **FR-08** | Session Interruption Recovery | Periodically save interview state every 5 seconds to `localStorage` to recover active sessions on unexpected refresh. | ✅ Completed | `LiveInterview.jsx` (`CHECKPOINT_INTERVAL_MS = 5000`) |
| **FR-09** | Format Pre-processing | Resample audio to 16kHz mono, 16-bit Linear PCM WAV format, volume normalizer (-0.9 dB peak), and speech filter. | ✅ Completed | `audioProcessor.js`, `LiveInterview.jsx` |
| **FR-10** | Noise Level Validation | Measure ambient background decibels and trigger warning banner when noise exceeds 60 dB threshold. | ✅ Completed | `LiveInterview.jsx` (`NOISE_THRESHOLD_DB = 60`) |
| **FR-12** | Transcription Engine | Output speech-to-text transcript using OpenAI Whisper format with WER 5.06% and CER 3.10% benchmarks. | ✅ Completed | `LiveInterview.jsx`, `CandidateReport.jsx` |
| **FR-15** | Progress Tracking | Display active question counter, interactive progress bar, and next question navigation controls. | ✅ Completed | `LiveInterview.jsx` |
| **FR-18** | Session History | Search and filter past sessions, review evaluator names, inspect timestamps, and listen to recorded WAV audio from 00:00. | ✅ Completed | `InterviewSessions.jsx`, `LiveInterview.jsx`, `ManageUsersModal.jsx` |
| **FR-19** | Profile Management | Allow users to update their name, email, and password with validation rules. | ✅ Completed | `Settings.jsx`, `AuthContext.jsx` |
| **FR-20** | Automated Data Purge | Execute 30-day data retention policy via PostgreSQL RPC `purge_expired_records()` to remove outdated records. | ✅ Completed | `SystemMaintenance.jsx`, `supabase.js`, `supabase_migration.sql` |
| **FR-21** | System Audit Logging | Record timestamped immutable audit logs for all security, authentication, candidate, question, and session actions. | ✅ Completed | `supabase.js`, `SystemMaintenance.jsx`, `ManageUsersModal.jsx` |

---

### 3. Database Schema Mapping (Supabase PostgreSQL)

| Table Name | Associated Functional Requirements | Key Columns |
|---|---|---|
| `public.users` | **FR-01, FR-02, FR-19** | `id`, `email`, `role`, `user_id_field`, `profile_picture_url`, `created_at` |
| `public.candidates` | **FR-03** | `id`, `full_name`, `email`, `position`, `status`, `resume_url`, `resume_name`, `resume_size_kb`, `score`, `keywords`, `notes` |
| `public.question_bank` | **FR-04** | `id`, `question_text`, `category`, `difficulty`, `keywords`, `ai_scoring_enabled`, `weights` |
| `public.interview_sessions` | **FR-06, FR-08, FR-09, FR-10, FR-18** | `id`, `candidate_id`, `evaluator_id`, `session_date`, `status`, `audio_url`, `audio_format`, `audio_size_kb`, `sample_rate` |
| `public.transcripts` | **FR-12** | `id`, `session_id`, `raw_text`, `wer_score`, `cer_score`, `model_name` |
| `public.behavioral_scores` | **FR-12, FR-18** | `id`, `session_id`, `honesty`, `attitude`, `confidence`, `relevance`, `overall` |
| `public.audit_logs` | **FR-21** | `id`, `timestamp`, `action`, `entity_type`, `entity_id`, `user_email`, `details` |

---

### 4. Build & Verification Status
- **Build Tool**: Vite v8.0.8 / React 19 / Tailwind CSS
- **Verification Result**: `npm run build` completed with **0 errors** (2054 modules transformed).
- **Document Date**: August 2026

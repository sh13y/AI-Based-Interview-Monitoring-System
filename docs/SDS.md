M. Modern Matrix 

# **ABSTRACT** 

The System Design Specification (SDS) for the AI-Based Automated Interview Monitoring System provides a comprehensive overview of the design and functionality of an objective, data-driven recruitment evaluation tool. In the contemporary hiring landscape, traditional interviews often face challenges due to human subjectivity and cognitive bias. There is a significant need to introduce an automated mechanism that quantifies behavioural traits to ensure a standardized and fair selection process. 

The system design detailed in this study involves a robust Three-Tier Architecture, incorporating the MVC (Model-View-Controller) pattern and SCRUM process models. It outlines the specific tools and techniques utilized for multimodal feature extraction, the conceptual and physical data designs, and a user interface optimized for HR professional workflows. Special attention is given to the User Experience (UX) through real-time audio diagnostics and high-fidelity data visualizations. 

The major considerations of this study centre on the AI Evaluation Engine, which utilizes a weighted fusion of acoustic and semantic features to generate high-precision scores for Honesty, Attitude, Confidence, and Answer Relevance. The document further details the critical security frameworks implemented, including AES-256 encryption and a 30-day automated data purge cycle, ensuring the system remains compliant with data privacy standards. 

Furthermore, the SDS addresses the implementation of the HR Management Dashboard, which serves as the primary deliverable for centralized interview monitoring and batch-wise candidate analytics. 

# **ACKNOWLEDGEMENT** 

This study was the final project during our third year at the Faculty of Applied Sciences, Rajarata University of Sri Lanka. Completing this AI-Based Automated Interview Monitoring System would not have been possible without the support of various individuals and organizations. 

We are especially thankful to our supervisor, Ms. A KNL Aththanagoda, for guiding and supporting us throughout the project. We are also grateful to the scholars who conducted research in the related fields of AI and behavioural analysis and allowed the public to use their findings. 

Our appreciation extends to all the lecturers and staff members of the Information and Communication Technology program at the Department of Computing, Faculty of Applied Sciences, Rajarata University of Sri Lanka. We also want to thank our group members—USS S Sankalpa, DMUK Dissanayake, KGSM Chamikara, AWKD Jayarathne, and RPIPP Gotabhaya—for their hard work and cooperation in meeting the project milestones. 

We hope this study proves useful to others interested in the field of recruitment technology, and we appreciate your interest in our work and its further improvements. 

ii 

# Contents 

|**CHAPTER 01: INTRODUCTION ......................................................................................... 1**|
|---|
|1.1 Problem to be addressed .................................................................................................. 1|
|1.2 Objectives of the Project .................................................................................................. 1|
|1.3 Project Deliverables ......................................................................................................... 1|
|1.4 System design approach ................................................................................................... 2|
|1.4.1 The Product Backlog (PB) items .............................................................................. 2|
|1.5 Standards to be followed .................................................................................................. 6|
|1.5.1 Coding Standards ...................................................................................................... 6|
|1.5.2 Documentation Standards ......................................................................................... 7|
|1.5.3 Standards for Presentations ....................................................................................... 7|
|1.6 Organization of the SDS .................................................................................................. 8|
|**CHAPTER 02: ARCHITECTURAL DESIGN ..................................................................... 9**|
|2.1 The System Architecture .................................................................................................. 9|
|2.2 Objects and Communication .......................................................................................... 10|
|2.2.1 UC-01: Authenticate User (with Lockout Warning) ............................................... 10|
|2.2.2 UC-02: Manage Candidate Profile.......................................................................... 11|
|2.2.3 UC-03: Manage Question Bank .............................................................................. 12|
|2.2.4 UC-04: Configure AI Benchmarks ......................................................................... 12|
|2.2.5 UC-05: Manage Interview Session ......................................................................... 13|
|2.2.6 UC-06: Perform AI Analysis (Multimodal Hub) .................................................... 14|
|2.2.7 UC-07: View Evaluation Report ............................................................................. 15|
|2.2.8 UC-08: View Interview History .............................................................................. 15|
|2.2.9 UC-09: Manage User Profile .................................................................................. 16|
|2.2.10 UC-10: Manage Data Retention (Auto-Purge) ..................................................... 17|
|2.2.11 Class Diagram of the System ................................................................................ 18|
|2.3 Deployment of the System ............................................................................................. 19|
|2.4 State Machines ............................................................................................................... 19|
|2.4.1 User Account State .................................................................................................. 19|
|2.4.2 Interview Session State ........................................................................................... 20|
|2.4.3 AI Evaluation Status ............................................................................................... 20|
|2.4.4 Audio Data Security Lifecycle ................................................................................ 20|
|2.5 Processes and Special Algorithms ................................................................................. 20|



iii 

|2.5.1 Acoustic Feature Extraction: FFT and Spectral Centroid ....................................... 20|
|---|
|2.5.2 Jitter and Shimmer (Acoustic Honesty Markers).................................................... 20|
|2.5.3 Semantic Cosine Similarity (Answer Relevance) ................................................... 21|
|2.5.4 Multi-modal Weighted Fusion Logic ...................................................................... 21|
|2.6 Tools, Techniques, and Implementation Environment ................................................... 21|
|**CHAPTER 03: UI DESIGN .................................................................................................. 22**|
|3.1 PACT Analysis ............................................................................................................... 22|
|3.1.1 People ...................................................................................................................... 24|
|3.1.2 Activities ................................................................................................................. 24|
|3.1.3 Context .................................................................................................................... 25|
|3.1.4 Technologies ........................................................................................................... 25|
|3.2 UI Design Considerations and Approaches ................................................................... 25|
|3.3 Design Tools, Techniques and Templates ...................................................................... 26|
|3.3.1 Design Tools ........................................................................................................... 26|
|3.3.2 Design Techniques .................................................................................................. 26|
|3.3.3 Design Template ..................................................................................................... 26|
|3.4 Input Design Aspects ..................................................................................................... 28|
|3.5 Output Design Aspects ................................................................................................... 32|
|3.6 Dialogue Design Aspects ............................................................................................... 34|
|3.7 Hosting/ Installation Environment ................................................................................. 34|
|**CHAPTER 04: DATA MANAGEMENT ............................................................................. 35**|
|4.1 Data Requirement .......................................................................................................... 35|
|4.2 Design Tools and Techniques ......................................................................................... 35|
|4.3 Conceptual Database Design ......................................................................................... 36|
|4.4 Logical Database Design ............................................................................................... 36|
|4.4.1 Map Regular Entities .............................................................................................. 36|
|4.4.2 Map Weak Entities .................................................................................................. 39|
|4.4.3 Binary Relationships ............................................................................................... 39|
|4.4.4 Unary Relationships ................................................................................................ 42|
|4.4.5 Map ternary (and n-ary) relationships ..................................................................... 42|
|4.4.6 Map Supertype/Subtype Relationships ................................................................... 42|
|4.4.7 Map Aggregation .................................................................................................... 43|
|4.5 Schema Refinement ....................................................................................................... 43|
|4.6 Physical database design ................................................................................................ 47|



iv 

|4.6.1 Data types..............................................................................................................|.. 47|
|---|---|
|4.6.2 Query Example .....................................................................................................|.. 49|
|4.7 Security design .............................................................................................................|.. 50|
|**CHAPTER 05: HARDWARE DESIGN ............................................................................**|**.. 51**|
|**CHAPTER 06: RESEARCH DESIGN ..............................................................................**|**.. 52**|
|6.1 Study objectives based on literature review.................................................................|.. 52|
|6.1.1 Pre-Processing and Feature Extraction .................................................................|.. 52|
|6.1.2 Behavioural Analysis and Scored Modelling ........................................................|.. 52|
|6.1.3 Evaluating the Quality of Generated Output ........................................................|.. 53|
|6.1.4 Visualizing and Presenting Results .......................................................................|.. 53|
|6.2 Formalizing high-level implementation components ..................................................|.. 53|
|6.2.1 Preprocessing Algorithm .......................................................................................|.. 53|
|6.2.2 Temporal and Semantic Segmentation ..................................................................|.. 54|
|6.2.3 The Deep Learning Model ....................................................................................|.. 54|
|6.3 Data Extractions, Test datasets and Training datasets ..................................................|.. 55|
|6.3.1 Data Extractions ....................................................................................................|.. 55|
|6.3.2 Training Datasets ..................................................................................................|.. 56|
|6.3.3 Test Datasets .........................................................................................................|.. 56|
|6.4 Non-functional aspects.................................................................................................|.. 57|
|6.4.1 Performance and Latency .....................................................................................|.. 57|
|To maintain the flow of standard HR workflows, the system must process complex<br>multimodal data with minimal delay: ............................................................................|.. 57|
|6.4.2 Security and Data Privacy .....................................................................................|.. 57|
|6.4.3 Reliability and Accuracy .......................................................................................|.. 58|
|6.4.4 Scalability and Availability ...................................................................................|.. 58|
|6.4.5 Ethical Fairness (Anti-Bias) ..................................................................................|.. 58|
|6.5 Proposed validation methods and measurements ........................................................|.. 58|
|6.5.1 Accuracy and Reliability Metrics..........................................................................|.. 58|
|6.5.2 Language and Transcription Validation ................................................................|.. 59|
|6.5.3 Qualitative Expert Validation ................................................................................|.. 59|
|6.5.4 Consistency and Bias Testing ...............................................................................|.. 59|
|**CHAPTER 07: APPROVAL ...............................................................................................**|**.. 61**|
|7.1. Signature of the team members: .................................................................................|.. 61|
|7.2. Recommendation of the supervisor(s) ........................................................................|.. 61|



v 

## **LIST OF TABLES** 

|Table 1: Functional Requirements of the proposed project ....................................................... 3|
|---|
|Table 2: Scrum model for the proposed project – Implementation 01 (30 Days) ...................... 4|
|Table 3: Scrum model for the proposed project – Implementation 02 (30 Days) ...................... 5|
|Table 4: Scrum model for the proposed project – Implementation 03 (30 Days) ...................... 6|
|Table 5: Tools, Techniques, and Implementation Environment ............................................... 21|
|Table 6: The PACT Analysis .................................................................................................... 23|
|Table 7: USER Table ................................................................................................................ 45|
|Table 8: CANDIDATE Table ................................................................................................... 45|
|Table 9: QUESTION_BANK Table ........................................................................................ 45|
|Table 10: INTERVIEW_SESSION Table ................................................................................ 46|
|Table 11: BEHAVIORAL_SCORE Table ................................................................................ 46|
|Table 12: TRANSCRIPT Table................................................................................................ 47|
|Table 13:query example 1 ........................................................................................................ 49|
|Table 14:query example 2 ........................................................................................................ 50|



vi 

# **List of Figures** 

|Figure 1: System Architecture ................................................................................................... 9|
|---|
|Figure 2:  Sequence diagram for Authenticate User ................................................................ 10|
|Figure 3 : Sequence diagram for Manage Candidate Profile ................................................... 11|
|Figure 4: Sequence diagram for Manage Question Bank ........................................................ 12|
|Figure 5:Sequence diagram for Configure AI Benchmarks ..................................................... 12|
|Figure 6: Sequence diagram for Manage Interview Session ................................................... 13|
|Figure 7: Sequence diagram for Perform AI Analysis (Multimodal Hub)............................... 14|
|Figure 8: Sequence diagram for View Evaluation Report ....................................................... 15|
|Figure 9: Sequence diagram for View Interview History ........................................................ 16|
|Figure 10: Sequence diagram for Manage User Profile ........................................................... 16|
|Figure 11: Sequence diagram for Manage Data Retention (Auto-Purge) ................................ 17|
|<br>Figure 12: Class diagram of the system ................................................................................... 18|
|Figure 13: Deployment of the System ..................................................................................... 19|
|Figure 14: User Account State ................................................................................................. 19|
|Figure 15: Interview Session State .......................................................................................... 20|
|Figure 16: AI Evaluation Status ............................................................................................... 20|
|Figure 17: Audio Data Security Lifecycle ............................................................................... 20|
|Figure 18: Admin Panel in the dedicated Web view ................................................................ 27|
|Figure 19:Settings Screen ........................................................................................................ 27|
|Figure 20: Login Screen........................................................................................................... 28|
|Figure 21: Candidate Registration Screen ............................................................................... 29|
|Figure 22: Question Bank Screen ............................................................................................ 30|
|Figure 23:Create Account Screen ............................................................................................ 31|
|Figure 24: Live Recording Screen ........................................................................................... 32|
|Figure 25: Processed Radar Chart Result Screen .................................................................... 32|
|Figure 26:Candidate List Screen .............................................................................................. 33|
|Figure 27: Interview History Screen ........................................................................................ 33|
|Figure 28: User navigation....................................................................................................... 34|
|Figure 29: The EER Diagram of the proposed AI Interview System ...................................... 36|
|Figure 30:User entity ............................................................................................................... 36|
|Figure 31:Candidate entity ....................................................................................................... 37|
|<br>Figure 32:Interview Session entity .......................................................................................... 37|
|Figure 33:Behavioural scoring entity....................................................................................... 38|
|Figure 34: Transcript entity ...................................................................................................... 38|
|Figure 35:question bank entity................................................................................................. 39|
|Figure 36:User and Interview_Session relation ....................................................................... 40|
|Figure 37:Candidate and Interview_Session relation .............................................................. 40|
|Figure 38:Question_Bank and Interview_Session relation ...................................................... 41|
|Figure 39:InterviewSession and BehaviouralScoring relation ............................................ 41|
|_  _<br>Figure 40: Interview_Session and Transcript relation ............................................................. 42|
|<br>Figure 41: Supertype/Subtype Relationships ........................................................................... 42|
|Figure 42:Relational Database Schema ................................................................................... 44|
|Figure 43:example query result ............................................................................................... 49|
|Figure 44:example query result ............................................................................................... 50|



vii 

# **CHAPTER 01: INTRODUCTION** 

Human resource recruitment and the initial screening of candidates is a critical area among many corporate organizations. A recruitment screening task may be considered a complex activity, since the process should ensure the selection of candidates with the correct psychological, professional, and behavioural traits. Evaluating candidate soft skills—such as honesty, attitude, and confidence—is an area heavily reliant on physical, face-to-face interviews. In the current corporate landscape, these evaluation methods are subject to cognitive bias, inconsistency, and fatigue. However, manual evaluation presents some challenges, notably the considerable time cost, ensuring unbiased decision quality, and the demand for specialized psychological observation skills. 

## **1.1 Problem to be addressed** 

When evaluating candidates with the support of traditional, manual screening methods, there is a high probability of misjudging these individuals due to subjective human biases or a lack of specialized evaluation skills. With the challenges that must be dealt with in physical interview methods, there is a need for an automated evaluation method that involves less bias and subjectivity, while ensuring the screening quality at a lower possible cost. Such a method will be a valuable support for HR Managers and recruitment professionals, especially when shortlisting high-volume applicant pools for critical corporate positions. 

## **1.2 Objectives of the Project** 

In our study, we propose a multimodal AI-based automated interview monitoring system to address the problem above. The objectives of the proposed study are; 

- To develop a multimodal feature extraction algorithm that considers both acoustic (vocal) and semantic (NLP) data from an audio input. 

- To develop an automated scoring method to evaluate Honesty, Attitude, Confidence, and Answer Relevance. 

- To develop a secure local data management system that incorporates a 30-day automated data purge mechanism for privacy compliance. 

- To develop a web-based dashboard tool to visualize the radar charts and leaderboard results processed by the AI models to the end user. 

## **1.3 Project Deliverables** 

Project deliverables mentioned below are the outcomes that are expected to be achieved as the results of this study. 

1. The AI Evaluation Engine for behavioural prediction. 

2. The web-based HR Management Dashboard. 

3. The secure local database and automated audio retention script. 

4. The technical report (SDS and SRS). 

1 

## **1.4 System design approach** 

The Agile methodology is a flexible and iterative approach to project management, particularly popular in software development but applicable to various industries. It prioritizes adaptability and collaboration, aiming to deliver small, incremental improvements in short iterations rather than one large product release. 

SCRUM is a popular framework for implementing the agile methodology in a project, particularly in software development projects. It emphasizes collaboration, transparency, and iterative progress. 

To obtain the expected outcome of this study, we expect to utilize a Scrum framework as our system design approach. To implement such a framework, here is how we might apply Agile principles, particularly using the Scrum framework in three implementation stages. 

In Implementation 01, our focus will be on addressing 70% of the functional requirements as addressed on the Software Requirements Specification (SRS) document and developing a working UI prototype that includes the basic dashboard components. Following this, Implementation 02 will involve completing the remaining 30% of functional requirements, integrating the AI models, and conducting unit testing. Finally, in Implementation 03, we will concentrate on integration and integration testing, acceptance testing, and evaluating the research components. 

## **1.4.1 The Product Backlog (PB) items** 

The product backlog items encompass the tasks necessary to achieve the objectives outlined in our project. Functional requirements, and the Database creation is considered as backlog items, along with integration and testing tasks. 

|PB item Number|Functional Requirement|
|---|---|
|1|Submit HR Manager Registration|
|2|Validate Registration form details|
|3|Check for Email existence|
|4|Create user account|
|5|DB Driver load and Connection creation|
|6|Submit Login|
|7|Validate Login credentials|
|8|Trigger 3-Strike Lockout logic on failure|
|9|Submit Candidate Registration data|
|10|Validate CSV Bulk Upload for candidates|



2 

|PB item Number|Functional Requirement|
|---|---|
|11|Create and manage Interview Question Bank|
|12|Configure AI weighted benchmarks|
|13|Pre-interview microphone hardware diagnostic|
|14|Start, Pause, and End Audio Recording|
|15|Real-time Noise Level measurement (>60dB alert)|
|16|Audio normalization and FFT extraction|
|17|Acoustic analysis for Pitch and Jitter|
|18|NLP text transcription (Speech-to-Text)|
|19|Semantic sentiment and relevance analysis|
|20|Calculate Weighted Average Fusion scores|
|21|Generate Individual Radar Chart report|
|22|Generate Batch Leaderboard table|
|23|Store encrypted .wav files locally|
|24|Execute 30-day automated data purge|



_Table 1: Functional Requirements of the proposed project_ 

3 

Implementation 01: Core development 

- Total Points: 24 Points 

- Estimated Velocity: 06 Points 

- Time Sprints Required: 04 Sprints (7.5 Days per Sprint) 

|Product Backlog Items (PB Items)|Sprint 01|Sprint 02|Sprint 03|Sprint 04|
|---|---|---|---|---|
|70% of Functional Requirements|25%|25%|25%|25%|
|Database Creation (MySQL/AES-256)|40%|30%|30%|-|
|Dashboard UI Prototype (React)|20%|30%|30%|20%|
|Audio Capture Module|20%|30%|30%|20%|
|Basic API Setup (FastAPI)|10%|20%|30%|40%|



_Table 2: Scrum model for the proposed project – Implementation 01 (30 Days)_ 

4 

Implementation 02: AI Engine & System Integration 

- Total Points: 24 Points 

- Estimated Velocity: 06 Points 

- Time Sprints Required: 04 Sprints (7.5 Days per Sprint) 

|Product Backlog Items (PB Items)|Sprint 01|Sprint 02|Sprint 03|Sprint 04|
|---|---|---|---|---|
|30% of Functional Requirements|25%|25%|25%|25%|
|Experimental Setup: Acoustic Model|40%|40%|20%|-|
|Experimental Setup: NLP Model<br>(SBERT)|30%|40%|30%|-|
|Multimodal Fusion Logic|-|30%|40%|30%|
|Integrate AI Models with Dashboard|-|-|50%|50%|



_Table 3: Scrum model for the proposed project – Implementation 02 (30 Days)_ 

5 

Implementation 03: Testing and Evaluation 

- Total Points: 18 Points 

- Estimated Velocity: 06 Points 

- Time Sprints Required: 03 Sprints (10 Days per Sprint) 

|Product Backlog Items (PB Items)|Sprint 01|Sprint 02|Sprint 03|
|---|---|---|---|
|Unit Testing & Error Logging|40%|30%|30%|
|Full System Integration Testing|50%|50%|-|
|Evaluate Research Components (Pearson 0.88)|-|50%|50%|
|Acceptance Testing & Security Validation|-|40%|60%|



_Table 4: Scrum model for the proposed project – Implementation 03 (30 Days)_ 

## **1.5 Standards to be followed** 

To achieve the objectives in this study in an efficient way, a well-organized set of standards are expected to be followed in this study. Here the study is expected to follow standards in two different aspects. 

## **1.5.1 Coding Standards** 

## a. PEP 8 Compliance 

Follow the Python Enhancement Proposal (PEP) 8 guidelines for Python code used in the FastAPI AI engine. This includes conventions for naming, indentation, spacing, and commenting. 

## b. Modular Design 

Organize the source code into modular components or modules utilizing the MVC pattern. This promotes code reusability, maintainability, and separation of concerns between the React UI and the backend. 

6 

## c. Version Control 

Use a version control system like Git to track changes to the codebase. Follow best practices for branching, committing, and merging code changes. Collaborate with team members effectively using pull requests and code reviews. 

## d. Error Handling 

Provide informative error messages and log errors for troubleshooting and debugging purposes, particularly for hardware exceptions like missing microphones. 

## e. Security 

Follow security best practices to protect sensitive data and prevent vulnerabilities. Sanitize input data to prevent injection attacks, implement the 3-strike lockout rule, and utilize AES-256 for local file encryption. 

## f. Code Reviews 

Conduct regular code reviews with team members to ensure code quality, consistency, and adherence to coding standards. 

## **1.5.2 Documentation Standards** 

## a. IEEE standards for documentation 

IEEE provides standards and guidelines for various aspects of technical documentation, including citations and references, figures and tables, equations and formulas, and abbreviations and acronyms. These are expected to be followed in the study documentation. 

## **1.5.3 Standards for Presentations** 

## a. Clarity and Conciseness 

Clearly define the purpose and objectives of the presentation to ensure focus and coherence while keeping slides concise. 

- b. Consistent Design 

Maintain a consistent design theme throughout the presentation, including fonts, colours, and layout, to reinforce the Modern Matrix visual identity. 

- c. Practice and Rehearsal 

Practice delivering the presentation multiple times to ensure fluency, confidence, and smooth transitions between slides. 

7 

## **1.6 Organization of the SDS** 

The rest of the SDS Document will be organized as follows; 

## Architectural Design 

The architectural design section outlines the system's architecture, including its objects, communications, processes, and specialized algorithms. In the subsequent section of this chapter, we will provide a brief overview of state machines, tools, techniques, libraries, thirdparty tools, and the implementation environment. 

## UI Design 

The third chapter will continue with a description of the PACT (People, Activities, Contexts, and Technologies) analysis, followed by an exploration of UI design considerations and approaches. In the middle part of the chapter, we will delve into design tools, techniques, and templates. Additionally, we will address input, output, and dialogue design aspects. Finally, the chapter will conclude with a discussion on the hosting and installation environment. 

## Data Management 

The fourth chapter will commence with a discussion on data requirements. Following this, we will explore the design tools and techniques utilized throughout the project. Subsequently, we will delve into conceptual, logical, and physical database designs. Finally, the chapter will conclude with a discussion on schema refinement and database security mechanisms. 

## Research Design 

In the sixth chapter, we begin by examining the objectives derived from our literature review and formalizing high-level implementation components. As we progress through the chapter, we focus on the extraction of data, sample design, and the creation of testing and training data sets. Towards the middle of the chapter, we address non-functional aspects, while proposing validation methods and measurements towards the end. 

8 



<!-- Start of picture text -->
2.1 The System Architecture<br>The Al-Based Automated Interview Monitoring System<br>Presentation Layer<br>React-Based Web Interface<br>—_.<br>User Interface & Audio Visualization React Frontend<br>Application Layer<br>FastAPI Application Server<br>HHSa ~ Oe Er@- Altkss, .<br>Acoustic Extraction Task Orchestration Semantic Transcription<br>Engine & Al Processing Engine<br>Secure Local Data Vault<br>fa) Secure<br>¢ | Data Storage<br>——=,<br>Encrypted Biometric Audio Data<br>Internal File-System Access<br><!-- End of picture text -->



<!-- Start of picture text -->
HR<br>Manager<br>Login Interface Lockout Manager Database Handler Status Controller<br>/\<br>Enter Credentials| ' ' ' H<br>Submit Login Data i ' '<br>alt [Credentials Valid] H<br>te ' Grant Access (Dashboard) | '<br>Credentials Invalid] '<br>\ Failure i ¢<br>' Increment Fail_Count) H :<br>: [Fail_Count >= 3] |i<br>' ‘Trigger Lockout! Lyk<br>' Display “Account Frozen (15 min)" ! :<br><!-- End of picture text -->



<!-- Start of picture text -->
HR<br>Manager<br>Select "Add Candidate" : : :<br>alt [Manual|Entry]<br>Input metadata | |<br>[Bulk Upload] 3 |<br>Upload CSV File 3 :<br>Validate CSV | :<br>_..... Malidation Success |<br>Submit Data 3 |<br>Save Profiles |<br><!-- End of picture text -->



<!-- Start of picture text -->
HR<br>Manager<br>Question Ul Question Controller Database Handler<br>Add/Update Question \ \ \<br>Submit Question & Keywords \ \<br>Update QUESTION_BANK<br>Success 7<br>Refresh List<br><!-- End of picture text -->



<!-- Start of picture text -->
HR<br>Manager<br>Settings Ul Benchmark Controller Al Benchmark Object<br>Adjust Sensitivity Sliders '<br>Submit Thresholds '<br>Re-calibrate Scoring<br>Confirmation<br>Success Alert<br><!-- End of picture text -->



<!-- Start of picture text -->
HR<br>Manager<br>Recording UI Hardware Diagnostic Audio Acquisition Noise Detector<br>Run Calibration ' H<br>[Real-time Diagnostic] ' '<br>Check Noise Level '<br>Current 4B<br>opt [Noise > 60dB] ' '<br>a ' '<br>Click "Start Recording” \ !<br>Initialize Capture | '<br><!-- End of picture text -->

|AudioAcquisition<br>NLP Engine<br>Fusion Engine<br>Database Handler|
|---|
|Stream Vocal Data<br>'<br>'<br>'|
|StreamTextData<br>;|
|par,<br>[ParallelAnalysis]<br>'|
|CalculateAcoustic Score<br>\<br>|<br>|<br>:<br>SemanticAnalysis<br>'<br><br> <br>|
||<br>Return Features<br>'<br><br><br><br>|
|'<br>|<br>ReturnVectors<br>'<br>Apply Fusion Formula<br>'<br>'<br>Save $_total<br>'<br>'<br>Success|





<!-- Start of picture text -->
HR<br>Manager<br>Dashboard Evaluation Handler Database Handler<br>Select Candidate<br>Request Metrics<br>Query Scores<br>Return Scores 1<br>Push Radar Chart<br>opt [Export PDF]<br>Click "Export" '<br>Generate POF<br><!-- End of picture text -->



<!-- Start of picture text -->
HR<br>Manager<br>fo<br>|<br>History Screen Reporting Engine Database Handler<br>Search History ‘<br>Query History<br>Fetch Records<br>Retum List 7<br>Display Table<br><!-- End of picture text -->



<!-- Start of picture text -->
HR<br>Manager<br>ifi. ~<br>Settings Ul Profile Controller Database Handler<br>Update Settings H H H<br>Submit Changes i H<br>Update USER Table<br>Success T<br>‘Confirmation i<br><!-- End of picture text -->



<!-- Start of picture text -->
System Clack Purge Handler File System Database Handler<br>Trigger Daily Purge<br>SEE<br>Identify Old Sessions<br>JA .$©2R€€—_—+<br>Retum SessioniDs<br>Hil << ee ee ee ee tee ee ee ee ee eee eee eee eee ee eee<br>loop [For Each Session]<br>—.Sj}Delete Audio File<br>Deleted<br>Hi - << ee ee eee ee ee eee eee ee ee eee eed<br>——.—_ sa Clear Database Record<br>Cleared<br>Hi << ee er ee ne ee ee ee eee ee ee ee ee ee ee ee ee eee eee ee eed<br>Log Purge Activity<br>OhrH<br><!-- End of picture text -->



<!-- Start of picture text -->
-int userID<br>string username<br>-string password<br>+login()<br>1<br>+manageQuestions()<br>+viewReports()<br>1<br>manages<br>-int candidatelD<br>string name<br>creates ~string email<br>+register()<br>+viewFeedback()<br>1<br>participates in<br>u<br>-int sessionID<br>-dateTime startTime 5<br>-dateTime retentionExpiryDate<br>*captureAudio() .<br>+executeAutoPurge() ae<br>1 uses for storage<br>QuestionBank <<Objective 1: Multimodal Extraction>><br>AudioProcessor <<Objective 3: Secure Management>><br>-int questioniD DatabaseManager<br>-float samplingRate<br>string category<br>-string idealAnswer +extractAcousticF eatures()<br>+saveEncryptedAudio()<br>+addQuestion() +transcribeToText()<br>+fetchSecureData()<br>+getQuestionsByCategory() +extractSemanticFeatures()<br>q<br>‘sends features<br><<Objective 2: Automated Scoring>><br>ScoringEngine<br>+calculateHonesty()<br>+calculateAttitude()<br>+calculateConfidence()<br>+generateFusionScore()<br>1<br>generates<br>4 <<Objective 4: Visualization>> A<br>EvaluationReport<br>-float finalScore<br>-json radarChartData<br><!-- End of picture text -->



<!-- Start of picture text -->
Cloud Infrastructure (AWS/ Azure Region)<br>Zo ZG<br>Web / API Server Al Inference Engine<br>Node.js Express API Deep Learning Models<br>Zi —————— ReceuterClient<br>Secure Data Storage Audio / Encrypted Storage —_—_<br>Se HR Dashboard<br>- cron_job: apply_30_day_purge)MySQL Database J Encrypted30_day_purge_policy Audio Files y<br>ZO<br>MySQL —_<br>Database<br>- cron_job: apply 30_cay.purge()<br><!-- End of picture text -->



<!-- Start of picture text -->
Failed Logins > 3<br>Fs ie<br>[-<br>aif<br>e Registration Email/Admin Verification Reset Password / Admin Unlock<br>facta Deleted {@)<br><!-- End of picture text -->



<!-- Start of picture text -->
[Noise > 6048} Warming<br>Notse Stabilized.<br>e 4+ +ieeeS eel oe siSecere core remot] come f- (@)<br><!-- End of picture text -->



<!-- Start of picture text -->
Va ——————— ———<br>Unprocessed (Raw Audio) Acoustic Analysis Done Partial NLP Analysis Done Processed Multimodal Fusion Applied Finalized<br>L )<br><!-- End of picture text -->



<!-- Start of picture text -->
@session Start Buffer ession End (AES-256) Stored Esin MySQLncrypted/ Cloud [Current Date > 30 Days] Purged (@)<br><!-- End of picture text -->





|~~es~~<br>~~eeee~~<br>~~re~~<br>~~re~~<br>~~i~~<br>~~a~~<br>~~ee eee~~<br>~~ee~~<br>~~es~~<br>~~eee eee~~<br>~~i~~<br>~~a~~|
|---|



# **CHAPTER 03: UI DESIGN** 

User Interface (UI) design is a critical component of software design, focusing on the visual and interactive aspects of the application. It involves the development of the application's interface with particular attention to layout, typography, colour schemes, and graphical elements like icons and charts. This section aims to outline the UI design specifications that will guide the aesthetic and functional aspects of the HR Management Dashboard to ensure it is both professional and user-friendly. 

The UI design process will adhere to best practices in usability, accessibility, and user experience (UX) to ensure the software is intuitive for all users, specifically HR Managers. These specifications will be developed through a series of stages including wireframing, prototyping, and iterative testing. These steps are essential to refine the user interactions and optimize the overall usability of the software. 

A well-executed UI design not only enhances user satisfaction but also promotes better engagement and interaction with the complex AI evaluation data. Following the guidelines detailed in this specification will ensure that the UI design supports efficient and effective use of the software. 

## **3.1 PACT Analysis** 

PACT Analysis is an integral framework used in the initial stages of software design to ensure that the solution aligns effectively with the user requirements and operational context. The abbreviation PACT stands for People, Activities, Context, and Technologies - each representing critical dimensions to be analysed for informed decision-making in the design process. 

|Screen Name|People (Attributes)|Activities (Nature<br>of Task)|Context<br>(Environment)|Technologies<br>(Modality)|
|---|---|---|---|---|
|Login Screen|Recruiters/Admins:<br>High professional<br>accountability.|Authentication:<br>Low data entry;<br>quick verification.|Office/Remote:<br>networks required.|Input: Keyboard.<br>Output: Visual UI<br>(React).|
|Candidate<br>Management|HR Personnel:<br>Managing sensitive<br>candidate data.|Bulk Processing:<br>High accuracy<br>needed for CSV<br>uploads.|Corporate Office:<br>Multi-tasking<br>environment.|Navigation:<br>Sidebar/Breadcrumbs<br>for fast switching.|



22 

|Screen Name|People (Attributes)|Activities (Nature<br>of Task)|Context<br>(Environment)|Technologies<br>(Modality)|
|---|---|---|---|---|
|Question<br>Bank|Subject Experts Hr<br>specialists: Creating<br>structured interview<br>paths.|Content Creation:<br>High cognitive<br>load; complex text<br>entry.|Dedicated<br>Workspace:<br>Focused, long-<br>duration activity.|Navigation: Folder-<br>based categorization;|
|Hardware<br>Test|Candidate: Potentially<br>stressed or anxious<br>persona.|Diagnostics: Step-<br>by-step wizard;<br>Microphone<br>calibration.|Variable: Requires<br>silence (Noise<br><60dB check).|Comm: WebRTC audio<br>stream; Visual volume<br>meter.|
|Live<br>Interview|Candidate: High-<br>pressure performance<br>task.|Engagement:<br>Real-time audio<br>recording;<br>Reading prompts.|Remote Setting:<br>High dependency<br>on stable internet.|Input: High-fidelity<br>microphone. Output:<br>Timer/Prompt.|
|Radar Chart|Decision Makers:<br>Comparing<br>behavioural metrics.|Synthesis: Visual<br>analysis of<br>behavioural<br>scorings|Meeting Rooms:<br>High-stakes hiring<br>discussions.|Output: SVG/Canvas<br>data visualization<br>charts.|
|Leaderboard|HR Managers:<br>Ranking multiple<br>candidates.|Evaluation: Data<br>sorting, filtering,<br>and comparison.|Desktop/Laptop:<br>Widescreen for<br>data density.|Navigation: Sortable<br>tables; Export to PDF<br>functionality.|
|Profile<br>Settings|System User:<br>Maintaining account<br>integrity.|Maintenance:<br>Updating<br>passwords and<br>settings.|Private Context:<br>High<br>security/Privacy<br>requirement.|Input: Form validation;<br>Masked password<br>fields.|
|Admin Panel|Super-Admin:<br>Managing system-<br>wide health.|Auditing:<br>Overseeing 30-<br>day purge logs<br>and security.|Secure Server<br>Room: Backend<br>monitoring focus.|Comm: API status logs;<br>Database status<br>indicators.|



_Table 6: The PACT Analysis_ 

23 

## **3.1.1 People** 

Understanding user characteristics, behaviours, and needs is key in our PACT analysis for software design. This section examines user demographics, goals, preferences, and skills to ensure our software interface meets their expectations. 

- Professional Nature: Users (HR Managers and Recruiters) expect a high level of accuracy and data visualization due to their backgrounds in corporate recruitment. The app should provide comprehensive behavioural metrics in an accessible format. 

- Language (English): The primary language of the web dashboard is English. We aim for clear and straightforward text to ensure technical AI terms (like "Semantic Relevance") are understandable. 

- Interaction Level (Simple): The system is meant to be easy to use for HR professionals who may not have a technical AI background. The interface should be straightforward but allow for deeper engagement when reviewing detailed candidate scores. 

- Usage: The system is designed to be versatile, useful in high-volume hiring phases or detailed executive interviews. The design adapts to these settings, supporting users effectively. 

## **3.1.2 Activities** 

Activities in our software encompass the specific tasks and workflows that users perform within the interface. Our focus includes key activities such as entering candidate data, managing questions, capturing audio, and analysing AI results. 

- Data Entry: Users are prompted to enter information such as candidate metadata and question bank keywords. This process should be straightforward, utilizing bulk CSV imports for efficiency. 

- Selecting Options: Users can choose specific candidates, question sets, or adjust AI sensitivity benchmarks (sliders). 

- Navigation: It is crucial that users can fluidly transition between the dashboard, live sessions, and history logs effortlessly. 

- Microphone Use: This function allows the system to capture real-time audio of the candidate. Integrating this capability with clear visual feedback (waveforms) will improve the user experience. 

- Analysis: This essential activity involves the processing of audio and text to predict Honesty, Confidence, Attitude, and Relevance, visualizing them through Radar Charts. 

24 

## **3.1.3 Context** 

The context in which our software is used plays a pivotal role in shaping the design and implementation of the technology. Understanding these contexts is crucial to ensure that our software is adaptable. 

- Corporate HR Departments: These environments are primary places where the dashboard will be used. The interface should be clean, professional, and optimized for desktop monitors. 

- Dedicated Interview Rooms: During active sessions, the interface must not distract the interviewer or candidate. It should feature a focused "Recording Mode" with clear visual noise alerts. 

- Remote Work Settings: For HR managers working from home, the web-based system must be responsive and accessible over standard network connections, handling potential network drops gracefully. 

## **3.1.4 Technologies** 

Technologies play a critical role in optimizing the user interface (UI) for the specific devices our software will operate on. 

- Input Methods: The dashboard should offer easy-to-use input methods tailored to desktop users (keyboard/mouse) and robust microphone handling for audio capture. 

- Output Methods: The system needs to display information in a way that is easy to understand. This includes the use of interactive Radar Charts and downloadable PDF reports. 

- Navigation: Navigation should be straightforward, utilizing a persistent sidebar menu to allow users to move between the Dashboard, Candidates, and Settings. 

- Communication: System alerts (like the 60dB high noise warning or the 3-strike lockout notification) must be clear, non-intrusive, and highly visible. 

## **3.2 UI Design Considerations and Approaches** 

When designing the user interface (UI) for the AI-Based Automated Interview Monitoring System, several key considerations are pivotal to enhancing the user experience. 

- User-Centric Design: This approach ensures the interface is designed based on what HR professionals need—speed, clarity, and fairness in hiring. 

- Clear and Consistent Layout: Important for making sure the interface is easy to understand. It involves using a uniform style and arrangement across all data tables and charts. 

25 

- Intuitive Navigation: Allows users to smoothly navigate through the app with a familiar left-hand sidebar menu. 

- Reliability and Legibility: Text should be clear, and contrast should be high, ensuring users can read candidate data easily in brightly lit office environments. 

- Visual Design and Approach: Involves choosing a corporate color palette (Blues, Whites, and Grays) that makes the interface look professional and trustworthy. 

## **3.3 Design Tools, Techniques and Templates** 

## **3.3.1 Design Tools** 

- Figma: Figma is a popular tool among UI designers for its cloud-based collaboration capabilities. It offers powerful design and prototyping features, supports a componentbased design approach, and facilitates developer handoff for our React frontend. 

- Adobe Photoshop: Widely recognized for advanced features in editing digital images, used for creating system assets, logos, and refining chart exports. 

- Adobe Illustrator: A vector graphics editor perfect for creating scalable vector-based artwork, utilized for crafting the custom icons used in our sidebar navigation. 

## **3.3.2 Design Techniques** 

- Visual Appeal: The design of interfaces prioritizes visual attractiveness through clean data visualization, minimizing clutter so the AI metrics stand out. 

- Wireframing: Creating low-fidelity wireframes to establish the basic layout of the dashboard and the live recording lobby. 

- Information Architecture: Organizing the content so that the most critical workflows (starting an interview, viewing results) are accessible within two clicks. 

- Prototyping: Building interactive versions of the React UI to test the flow from Candidate Selection to the Radar Chart visualization. 

## **3.3.3 Design Template** 

We utilize Tailwind CSS / Material UI principles integrated with our React framework. This comprehensive design system offers guidelines and components for building visually consistent and intuitive web interfaces. It provides pre-designed UI elements (buttons, modals, sliders) that are optimized for desktop displays, facilitating rapid and cohesive development. 

26 



<!-- Start of picture text -->
N 1 Dashboard Q. Search Anything... | |<br>8 Dashboard Summary Statistics Active Interviews<br>488 Registered j Pending 4 Interviews Upcoming Interviews Recent Sessions<br>Candidates Candidates GC Evaluations El This Week 5 10<br>15 as a a<br>B question Bank Average Performance Score Completed Sessions 10 a Beii | r fl a ||<br>ayNhs 83%( CA 8 6 5te) en |<br>Mon Tue Wed Thu Fri Sat Sun Mon Tue Wed<br>& Interview Sessions<br>@, Reports Top Performers Recent Candidates<br>s= System Maintenance‘ Jenny Mark Sarah AllisonalesMartinez Evaluated Today<br>Adams Chen White —<br>a Settings 90%9, 89%9, 85%oO, HRRajsaPatelCordinator Evaluated 3h ago<br>2) Logout Ee JamesData Analyst Wong Evaluated Yesterday<br><!-- End of picture text -->



<!-- Start of picture text -->
IN ; System Maintenance. Q search Anything. | |<br>=e a lotantercd Manage system configuration, backups, roles and platform settings © @ RunBackup Fe | Advanced Setting<br>% Candidates = Sever32%  CPU — {a} Memory64% ——— Usage =@ce Active27  Users Q) Uptime14 Days<br>B Question Bank eo . e<br>==— Database Management \ @ User & Role Management<br>Total Admins 3<br>e& Interview4 Sessionsi Database Status: Connected Total Recruiters: 12<br>Last Backup: 12 Mar 2026 - 02.00AM Total Interviews 8<br>@ Reports Database Size: 2.3 GB<br>© Backupnow Restore Backup Manage Roles<br>$& system Maintenance<br>B System Logs e i, Security Settings<br>& Settings<br>Recent Errors: 2 2FA: Enabled<br>Warnings: 5 Password Policy: Strong<br>5) Logout Last System Update: 10 Mar 2026 Active Session: 14<br>View Logs Configure Security<br><!-- End of picture text -->



<!-- Start of picture text -->
Account Security<br>User ID<br>Password<br>‘Signin |<br>Don’t have account ? Create acount<br><!-- End of picture text -->



<!-- Start of picture text -->
Add Candidate ae<br>Full Name<br>Email Address<br>Position Applying For Keyword Benchmarks<br>Software engineer ¥ Java Developer ¥<br>Resume Upload<br>Additional Notes<br>VY = System Admin Only<br>Cancel Add Candidate<br><!-- End of picture text -->



<!-- Start of picture text -->
Add Question Xx<br>Question:<br>Category: Difficulty:<br>v<br>v<br>Keyword Benchmarks:<br>SQL Indexing Optimization Logs<br>@®® Enable Al Keyword Scoring<br>Scoring Weight (Optional Override)<br>Honesty 50% Confidence 50%<br>Attitude 50% Relevance 50%<br>Cancel {Add Candidate<br><!-- End of picture text -->



<!-- Start of picture text -->
Personal Information Account Security<br>First Name Last Name Work Email<br>User ID Password<br>Profile Picture Confirm Password<br>@ Terms & Privacy<br>vy! agree to the Terms of Service and have read the<br>Cc ic » up ] 30 day data purge policy for candidate audio.<br>Already have an account ? Log In now<br><!-- End of picture text -->



<!-- Start of picture text -->
iN Interview Session | Q Search Anything. 0 |<br>Jenny Adams a<br>85 Dashborad 2) im og Z tl End Interview<br>& Candidates © 0245 & <\\ Questions for this Session<br>Questions Total: 5<br>B Question Bank<br>& interview Sessions sD) CG | | 1. Can you describe your experience<br>2. How do you debug a piece of code<br>you didn't write ?<br>Q Reports<br>. .<br>Live Voice Waves worked3. Discusson arecently. challenging project you<br>S$ system Maintenance . E<br>= 4. Explain a time when you used<br>% Bas algorithms to solve a problem<br>settings ; ] Noise Level a 5. What are your strengths as a<br>af]Wed aie edA Wt ta 58 software engineer ?<br>2) Logout Uy | | | il dB @ Microphone Detected<br>@ local Server Connection<br>Proceedto Recording<br><!-- End of picture text -->



<!-- Start of picture text -->
8g Dashborad Jenny(asta Adams Final PerformanceA Score<br>90%fo)<br>Interview Date April 22 2026 | Software Engineer Round 1 ee)<br>#8 Candidates<br>B auestion Bank Evaluation Summary<br>& interview Sessions Honesty2 @ Honesty94%(e) (&) Attitude89%te)<br>Relevance Attitude on = — |<br>@ Reports ¥ P<br>se—= System Maintenance7 | <s _é ©) Confidence88% Relevance91 9,%<br>Honesty Attitude<br>%& settings<br>2) Logout Interview Session Summary | Download Report<br>19mSession Duration46s QuestionsSout of5 Answered Noises2dB Levelallts.t Avg JessicaEvaluator Smith e Jessica Smith<br><!-- End of picture text -->



<!-- Start of picture text -->
iN Candidates [ Q. search Anything... a | 8<br>eaubosnborad = AddCandidate = = = Bulkimport + Keyword Benchmark Weight Configuration ¥ | Q Search candidates... |<br>%8 Candidates AllStatues v All Positions v AllScore Ranges ¥ > Filter<br>B Question Bank Candidate Position Status Date Registered Score w Actions<br>) e pennysoftware Engines eons Software Engineer Evaluated Jan 23 + 90% ro) ria}<br>& Interview Sessions<br>Marketing Manage<br>O >) Mork chen Marketing Manager | In Progress Feb 14 89% fO} ira}<br>Q Reports<br>3] e Ro pote HR Coordinator Pending Review Apr 2 77% ro} ira}<br>S system Maintenance Serer _<br>0 e —eoesto Analyst Data Analyst Rejected Mar 3 68% ©<br>bd Settings Product Mana i<br>9 (ai >) Sarah White Product Manager Evaluated Jani 85% ro} ira}<br>5) Logout Ee Allison Martinez Ai Specialist Evaluated Feb 6 80% ro} ira}<br>Rows Per Page: 10 ¥ 1- 6 of 120 e Ga C Refresh<br><!-- End of picture text -->



<!-- Start of picture text -->
EvaluationA Reports [(foQ search anything. )|<br>§§ Dashborad ComparisonP Table Q\. search candidates.. J lesi? ExportEe<br>Interview sessionName ¥ & 2026-02-19 V Apply Filters Apply<br>#8 Candidates<br>Rank Candidate Name Overall Score View Full Report<br>B question Bank<br>& interview Sessions Mark Chen<br>Marketing Manage<br>Sea e@==Sarah White ae9 execs<br>$S system Maintenance bi dtrarncs<br>% Settings Data Analyst<br>AI Specialist<br>re] Logout<br><!-- End of picture text -->



<!-- Start of picture text -->
¢€ Dashboard omomom |B<br><!-- End of picture text -->





<!-- Start of picture text -->
¢€ Dashboard omomom |B<br>“ teas tem<br>ae<br>pees 90% 89% 85% eo a<br>oe<br><!-- End of picture text -->



<!-- Start of picture text -->
iM Interview Session re © h  |<br>—<— siieasiness ==<br>Becrge = cael<br>ay =a<br>ae<br><!-- End of picture text -->



<!-- Start of picture text -->
€ tot to taper ce ||<br>= iis iss oaiaba 90%<br>ta er ssbb<br>BE ores orsenanee , ‘ © 88' 2 91<br>eum<br><!-- End of picture text -->



<!-- Start of picture text -->
[Vv Evaluation Reports rn fF<br>pecrarpranromenced WY paren Gea<br>\ Aorenaibases @ e Jenny Ademe 20% aim)<br>ns pyres Z e ‘<br>oun 7) 00%<br><!-- End of picture text -->

# **CHAPTER 04: DATA MANAGEMENT** 

Data management is the main part of any project, especially when handling sensitive user data such as biometric audio recordings and behavioural AI metrics. Making sure the database is accurate and secure is vital for everything to work smoothly and protect candidate privacy. In data management, we focus on things like figuring out what data we need, designing the database, improving how it's organized, and making sure it's protected from any potential threats. Each part of data management plays a role in making sure the project runs well, showing how important it is for the project's success. 

## **4.1 Data Requirement** 

Our data management focus is on gathering key details about job candidates and their interview sessions to help the AI generate accurate behavioural evaluations. This involves collecting and storing information from HR manager inputs, live audio captures, and semantic analysis processing. To ensure our system works well and complies with corporate data privacy, we need to carefully gather and regulate the necessary data. 

Here is what we require: 

- Store the insert, delete, and update data of HR Managers and System Admins. 

- System must identify System Administrators and HR Managers separately. 

- System must store candidate metadata (Name, Email, Resume path). 

- System must store temporary audio session paths and generated AI scores (Honesty, Attitude, Confidence, Relevance). 

- Store the predefined Question Bank and their respective AI scoring weights. 

- Enforce a strict 30-day automated data purge for all sensitive audio and interview logs. 

## **4.2 Design Tools and Techniques** 

- MySQL 

We choose to use MySQL as our design tool because it is reliable and widely used. It helps us organize and store data efficiently. With MySQL, we can easily manage large amounts of information—like historical leaderboard data—and access it quickly when needed for the Radar Charts. Its compatibility with our FastAPI backend makes it flexible for integration with our Python-based AI models. Additionally, MySQL provides robust security features to protect candidate biometric data from unauthorized access. Overall, MySQL is an excellent choice for our project due to its reliability, efficiency, flexibility, and security features. 

- Draw.io 

Draw.io is an essential tool for database management systems. It helps in designing databases at different levels like conceptually, logically, and physically, and in making queries. Using draw.io's visual tools helps us understand how the database is set up and connected. This makes it easier to talk about the database and do tasks like keeping it up-to-date and writing down how it works. Also, draw.io makes it easy for our team to work together, which helps us make better decisions when we're dealing with complicated data systems. 

35 



<!-- Start of picture text -->
role \<br>Cora) User CQE?!session date >) noice_level_db<br>password Komen Kno a Aan a<br>Interview_Session_ —~1 produces ~————=1 _ Transcript<br>N |<br>-<br>Admin 1 Manages N HR_Managers |—————-_1 managesZY 1 N C uted)<br>generates produces<br>1 Participates<br>Candidate<br>candidate id 1 1<br>| Behavioral_scoring Question_Bank<br>e<br>confidence_score<br>honesty_score<br>eas keywords_gold_standard<br>aa<br>(fuser_id.~<br>Ne User<br>> — fi<br>(y =< _—— J<br>role ) _—— ff<br>“Ce — /<br>_— f<br>ine yy,<br>(va ~, a —<br>NN pasword A) name \) email; ~)<br>al Soaealssa Neaal_w<br><!-- End of picture text -->



<!-- Start of picture text -->
(candidate Id Candidate<br>-<br>—<br>< emailH ‘)<br>ao<br>< session_id ;<br>—__ Interview_Session<br>> ~, es- vA<br>« session_date *) a_—_— fff<br>ll —_ /<br>on— f<br>audio_file_path; ~, .er ae ; _<br>CC cee yy, 4- noice_level_db ~\ (* validation_status ~)<br>Mee a 4 NL wy<br>el ee<br><!-- End of picture text -->



<!-- Start of picture text -->
aS ;<br>(scoring id , Behavioral_ Scoring<br>“Ne<br>oN ya<br>(attitude_score ) A<br>el a > ae<br>aa . = ~<br>elevance~~ ~score)a“Sg.(honestya _scorewv\,) éonfidence_scor:.eeLEERY,<br>al al<br><!-- End of picture text -->



<!-- Start of picture text -->
a~, .<br>(_ transcript id _, Transcript<br>“SC<br>a<br>C raw_text )<br>ol<br><!-- End of picture text -->



<!-- Start of picture text -->
(aquestion id).. Question_Bank.<br>™<br>> ~N<br>( question_text ) a ~<br>__ ( ‘| ( keywords _gold_standard )<br>( category ) \_ y,<br>et ee<br><!-- End of picture text -->



<!-- Start of picture text -->
1 ee en<br>User <=> Manages NePP ea N Interview_Session<br>™~ ee Pe =<br>om ceees een a(ies aea Coneyemi iad \\<br>\ \ — on we Ly \<br>\\ *= Spas2————~mat (‘¢ sessionid be=) Aiea /| 1Sees\<br>—_ \ \ Pas > ~ vs / tel =<br>ei user ;=a \ \\ ce name -) —— —/ // (_( validation_status &)<br>=~~cenaii(foBre) EY\ seSo‘isSs Bes)eS—\a. (y,asession_dateee) /// L| PHL\ic, |=<br>\Q email Bal ( password ) \ y / $a —,|<br>a alA ~eeif, —_ ae, f/ (/ noice_lvel_db \ )<br>el / oN \Fe mie<br>( audio_file_path )<br>Nn— =eee<br>1 aFe a<br>Caandidate er Participates es=, N Interview_Session<br>T bs <u pe ABE= se", ] y<br>\\ SE\ —— > aeESESESSSosSin Poth7Aat \\<br>| \ SN\ No( Shes id 97xoi // =\<br>/se LET \ we Ana \<br>( \ \ Ib, re a ws / validation_status )<br>NN candidate _id ) \ ys \ ers / ~N w-<br>SsA \ ( name ) oa "RES / a<br>7ee\ ll,ees | een!af (7 sessiondate Sey) / Ls a<br>\ seb ) ~~ call a oc<br>itseen Seas a wil / ( noice_tvel_db \ )<br>/ NN wa<br>(5 audiopenefile path ) SEA ee<br>\4<br>awe<br><!-- End of picture text -->

- Consider Question_Bank and Interview_Session (Produces) 

The Question Bank provides questions for many sessions, while each session retrieves its specific questions from the bank. 



_Figure 38:Question_Bank and Interview_Session relation_ 

- QUESTION_BANK (question_id, question_text, category, keywords_gold_standard) 

- `o` INTERVIEW_SESSION (session_id, question_id, session_data, audio_file_path) 

Map binary one-to-one (1:1) relationships 

- Consider Interview_Session and Behavioral_Score (Generates) 

Each unique interview session generates exactly one AI-driven evaluation report. 



_Figure 39:Interview_Session and Behavioural_Scoring relation_ 

   - INTERVIEW_SESSION (session_id, session_data, validation_status) 

   - BEHAVIORAL_SCORE (scoring_id, session_id, attitude_score, relevance_score, honesty_score, confidence_score) 

- Consider Interview_Session and Transcript (Produces) 

41 



<!-- Start of picture text -->
Fan a<br>1 Fe ae 1 |<br>Interview_Session SF ondgo ~eae Transcript<br>HEHEEEH EER Produces Soel= ee|<br>eanamy 7 Ene om oreeeae et th<br>ge ener A \ feet6 | |<br>’ AY \ s /<br>( session_id ) A G /: peste\  —.| /<br>ne nea / (validation status (O ay ( »<br>re / \ ot ( transcripLid =) ( raw_text )<br>aee. / ce = oe eu a ee<br>( \ / pam? Bi te wr 0 ene<br>\ session_date 11s l SS ES<br>oe aAi /| /a eek\<br>/ { noice_lvel_db  )<br>/ N\ mc = A<br>( audio_file path )<br>(user id A<br>yaae,~ae,~~ ‘\\<br>( role asa \<br>atete te \<br>< emailot~~ot~~~~ a SS,~~~~<br>Se ae ae i User<br>vi password ‘) password ‘) ‘) =i<br>N at =<br>ei a<br>Me. -.<br>( name )<br>ae “aa<br>pees ht ht<br>a ae | |<br>|<br>Admin \<br>>——-—~<__ Manages<—— Manages<——<—— >—____ ———NN +HR_Managers -<br><!-- End of picture text -->



<!-- Start of picture text -->
(user id A<br>yaae,~ae,~~ ‘\\<br>( role asa \<br>atete te \<br>< emailot~~ot~~~~ a SS,~~~~<br>Se ae ae i User<br>vi password ‘) password ‘) ‘) =i<br>N at =<br>ei a<br>Me. -.<br>( name )<br>ae “aa<br>pees ht ht<br>a ae | |<br>|<br>Admin \<br>>——-—~<__ Manages<—— Manages<——<—— >—____ ———NN +HR_Managers -<br><!-- End of picture text -->

USER (user_id, email, name, password, role) 

   - Primary Key: user_id 

- Attributes: email, name, password, and role are shared by all users. 

- ADMIN (user_id) 

   - Primary Key: user_id 

   - Foreign Key: user_id references USER(user_id) 

HR_MANAGERS (user_id) 

- Primary Key: user_id 

- Foreign Key: user_id references USER(user_id) 

## **4.4.7 Map Aggregation** 

- ➢ There are no aggregations in the EER diagram. 

## **4.5 Schema Refinement** 

During schema refinement, tables undergo a polishing process before advancing to the physical design phase and adjustments for regular usage. This step aims to minimize redundancies and inconsistencies in the database, ensuring orderly information arrangement. Normalization is integral to this process, aligning the database structure more closely with the relational model by addressing dependencies and anomalies. 

Normalization techniques encompass: 

- Identifying functional dependencies 

- Avoiding anomalies 

- Handling attributes with multiple values 

43 



<!-- Start of picture text -->
Transcript<br>Question_Bank<br>quesionid category quesion_text keyword_<br>_ - gold_standard<br>vandiaie— _ ; audio_file ssnoise_ validation<br>Candidate<br>Behavioral_Scoring<br>—<br>score _ score score _score<br><!-- End of picture text -->

|Column<br>Name|Key Type|Data Type|Description|
|---|---|---|---|
|password|-|VARCHAR(255)|Encrypted password string|
|role|-|ENUM|Categorizes the user as Admin or<br>HR_Manager|



_Table 7: USER Table_ 

## CANDIDATE Table 

This table maintains the unique records for every job applicant. 

|Column Name|Key Type|Data Type|Description|
|---|---|---|---|
|candidate_id|Primary Key|INT|Unique ID for the candidate|
|full_name|-|VARCHAR(255)|Candidate's complete name|
|email|-|VARCHAR(255)|Candidate's contact email|



_Table 8: CANDIDATE Table_ 

## QUESTION_BANK Table 

This table holds the pre-defined questions and keyword standards for the AI. 

|Column Name|Key Type|Data Type|Description|
|---|---|---|---|
|question_id|Primary<br>Key|INT|Unique ID for the question|
|question_text|-|TEXT|The actual text of the interview<br>question|
|category|-|VARCHAR(100)|<sup>Question</sup><br>type<br>(Behavioral,<br>Technical, etc.)|
|keywords_gold_standard|-|TEXT|Reference keywords for AI scoring|



_Table 9: QUESTION_BANK Table_ 

45 

## INTERVIEW_SESSION Table 

This table acts as the central hub connecting the manager, candidate, and question used. 

|Column Name|Key Type|Data Type|Description|
|---|---|---|---|
|session_id|Primary<br>Key|INT|Unique ID for the specific interview session|
|user_id|Foreign<br>Key|INT|References HR_MANAGER(user_id)|
|candidate_id|Foreign<br>Key|INT|References CANDIDATE(candidate_id)|
|question_id|Foreign<br>Key|INT|References<br>QUESTION_BANK(question_id)|
|session_data|-|TEXT|General metadata regarding the session|
|audio_file_path|-|VARCHAR(255)|Path to the recorded audio file on the server|
|noise_level_db|-|INT|Recorded decibel level for environment<br>validation|
|validation_status|-|BOOLEAN|Result of the hardware or noise check|



_Table 10: INTERVIEW_SESSION Table_ 

## BEHAVIORAL_SCORE Table 

This table stores the AI evaluation metrics generated for each interview session. 

|Column Name|Key Type|Data Type|Description|
|---|---|---|---|
|scoring_id|Primary<br>Key|INT|Unique ID for the evaluation record|
|session_id|Foreign<br>Key|INT|References<br>INTERVIEW_SESSION(session_id)|
|honesty_score|-|DECIMAL(5,2)|AI honesty metric|
|attitude_score|-|DECIMAL(5,2)|AI attitude metric|
|confidence_score|-|DECIMAL(5,2)|AI confidence metric|
|relevance_score|-|DECIMAL(5,2)|AI relevance metric|



_Table 11: BEHAVIORAL_SCORE Table_ 

46 

## TRANSCRIPT Table 

This table stores the text converted from the interview session audio. 

|Column Name|Key Type|Data Type Description|
|---|---|---|
|transcript_id|Primary Key|INT<br>Unique ID for the transcript record|
|session_id|Foreign Key|INT<br>References INTERVIEW_SESSION(session_id)|
|raw_text|-|TEXT<br>The full speech-to-text output from the AI|



_Table 12: TRANSCRIPT Table_ 

## **4.6 Physical database design** 

## **4.6.1 Data types** 

We can create SQL statements for the tables. From there we can get a clear idea about the data type. 

- USER table 

SQL 

CREATE TABLE USER ( 

user_id INT PRIMARY KEY, Email VARCHAR(255) UNIQUE, Password VARCHAR(255), Role ENUM('Admin', 'HR_Manager'), 

managed_by INT, 

FOREIGN KEY (managed_by) REFERENCES USER(user_id) 

); 

- CANDIDATE table 

SQL 

CREATE TABLE CANDIDATE ( candidate_id INT PRIMARY KEY, full_name VARCHAR(255), email VARCHAR(255) 

); 

47 

- INTERVIEW_SESSION table 

SQL 

CREATE TABLE INTERVIEW_SESSION ( session_id INT PRIMARY KEY, interviewer_id INT, candidate_id INT, Date_Time DATETIME, FOREIGN KEY (interviewer_id) REFERENCES USER(user_id), FOREIGN KEY (candidate_id) REFERENCES CANDIDATE(candidate_id) ); 

• TRANSCRIPT table SQL CREATE TABLE TRANSCRIPT ( transcript_id INT PRIMARY KEY, session_id INT, raw_text TEXT, FOREIGN KEY (session_id) REFERENCES INTERVIEW_SESSION(session_id) ); 

• BEHAVIORAL_SCORE table SQL CREATE TABLE BEHAVIORAL_SCORE ( score_id INT PRIMARY KEY, session_id INT, honesty_score DECIMAL(5,2), attitude_score DECIMAL(5,2), confidence_score DECIMAL(5,2), relevance_score DECIMAL(5,2), FOREIGN KEY (session_id) REFERENCES INTERVIEW_SESSION(session_id) 

); 

48 

## • QUESTION_BANK table 

## SQL 

CREATE TABLE QUESTION_BANK ( 

question_id INT PRIMARY KEY, 

category VARCHAR(255), 

question_text TEXT, 

ideal_answer TEXT 

); 

## **4.6.2 Query Example** 

➢ Consider the below CANDIDATE table, 



<!-- Start of picture text -->
candidate_id  Name<br>C001  John Doe<br>C002  Jane Smith<br>C003  Kasun<br>Perera<br><!-- End of picture text -->

_Table 13:query example 1_ 

- ➢ To get the names of all candidates in the CANDIDATE table. 

SQL  -  SELECT Name FROM CANDIDATE 



<!-- Start of picture text -->
Name<br>John Doe<br>Jane Smith<br>Kasun Perera<br><!-- End of picture text -->

_Figure 43:example query result_ 

49 

## ➢ Consider below BEHAVIORAL_SCORE Table, 

|score_id|session_id|honesty_score|attitude_score|confidence_score|
|---|---|---|---|---|
|S001|SES01|8.5|7.2|9.0|
|S002|SES02|4.2|5.0|4.5|
|S003|SES03|9.1|8.8|8.5|



_Table 14:query example 2_ 

- ➢ To get only the records where honesty_score is more than or equal to 8.0. 

SQL - 

SELECT * FROM BEHAVIORAL_SCORE WHERE honesty_score >= 8.0 

|score_id|session_id|honesty_score|attitude_score|confidence_score|
|---|---|---|---|---|
|S001|SES01|8.5|7.2|9.0|
|S003|SES03|9.1|8.8|8.5|



_Figure 44:example query result_ 

## **4.7 Security design** 

Database security design involves setting up protections to keep the database safe from unauthorized access and data breaches. It includes creating rules and protocols to make sure that only the right people can access the data and that it stays intact and available when needed. The aim is to keep sensitive recruitment information and AI-generated behavioural scores safe from hackers. 

The security features that are planned to be implemented on our database are: 

## 1. Strong Password Policies 

   - Enforce complexity requirements (uppercase, numbers, symbols) for all Admin and HR accounts to prevent brute-force attacks on the recruitment dashboard. 

2. Role-Based Access Control (RBAC) 

   - Implement RBAC to ensure that only "Admins" can modify the QUESTION_BANK or delete users, while "HR_Managers" are limited to viewing and conducting interview sessions. 

50 

## 3. Encryption 

- Protect sensitive candidate data and transcripts using SSL/TLS encryption for data in transit. Password hashes will be stored using secure algorithms like BCrypt. 

## 4. Parameterized Queries 

- Use prepared statements in the backend API to sanitize input from interview transcripts and login forms, preventing SQL injection attacks. 

## 5. Audit Logging 

- Monitor every access to the BEHAVIORAL_SCORE table to track who viewed or modified candidate evaluations, ensuring transparency in the hiring process. 

## 6. Backup and Recovery 

- Conduct weekly off-site backups of the recruitment database to recover from potential system failures or accidental data loss during interview sessions. 

## 7. Network Security 

- Restrict MySQL server access to specific IP addresses associated with the organization’s network, reducing the potential attack surface. 

## 8. Regular Updates and Patch Management 

- Maintain the database management system with the latest security patches to defend against known vulnerabilities in the storage engine. 

## 9. Data Retention and Auto-Deletion Policy 

- Implement an automated 30-day deletion policy for sensitive interview data, including the TRANSCRIPT and BEHAVIORAL_SCORE tables. 

- Use MySQL Event Schedulers to automatically purge records where the Date_Time in the INTERVIEW_SESSION table is older than 30 days. 

- This minimizes the storage of PII (Personally Identifiable Information) and ensures that candidate behavioural analysis is only kept for the duration of the active recruitment cycle, significantly reducing the risk of long-term data exposure. 

# **CHAPTER 05: HARDWARE DESIGN** 

No hardware design. 

51 

# **CHAPTER 06: RESEARCH DESIGN** 

In this chapter, we will outline the project objectives derived from our literature review and detail the project approach as per the project plan. The objectives of our project, based on the literature review, are presented in section 6.1, while section 6.2 covers formalizing high-level implementation components. Data preparation and training datasets are described in section 6.3, and finally, section 6.5 outlines the proposed validation methods and measurements. 

## **6.1 Study objectives based on literature review** 

The integration of Artificial Intelligence into recruitment is primarily driven by the need to minimize human subjectivity and handle the increasing volume of remote applicants [1]. Traditional unstructured interviews often suffer from low reliability because human interviewers struggle to evaluate multiple behavioural factors simultaneously and are susceptible to unconscious cognitive biases [2], [3]. Based on the literature review, the following objectives are formalized: 

## **6.1.1 Pre-Processing and Feature Extraction** 

High-quality input data is critical for behavioural AI. Studies indicate that technical factors like camera angles, eye contact, and audio clarity significantly impact how a candidate is perceived [4]. Furthermore, technical mediums can limit the "social bandwidth" and information delivery during the exchange [5]. 

**To develop a robust audio pre-processing algorithm:** This involves implementing automatic gain control, noise reduction, and normalization to ensure high-fidelity Speech-toText (STT) conversion, which is essential for accurate semantic analysis [6]. 

**To implement real-time extraction of prosodic features** : By analysing pitch, tone, and speech rate, the system can quantify candidate confidence levels as a technical metric rather than a subjective feeling [7]. 

## **6.1.2 Behavioural Analysis and Scored Modelling** 

Existing research highlights that "social presence" and "impression management" are key factors in interview success, yet these are rarely quantified objectively in remote settings [4]. Advanced systems now utilize multimodal fusion to predict competencies with high reliability [7]. 

**To develop a deep learning-based semantic engine:** This engine will measure Answer Relevance by utilizing Natural Language Processing (NLP) to compare candidate transcripts against an "ideal answer" baseline stored in the Question Bank [8]. 

**To quantify Honesty and Attitude:** By detecting lexical patterns, sentiment shifts, and linguistic inconsistencies during high-pressure responses, the system provides a multidimensional view of candidate integrity [6], [9]. 

52 

## **6.1.3 Evaluating the Quality of Generated Output** 

Existing AI tools often provide separate labels (e.g., "Positive Sentiment") without a combined performance score, which limits their utility for HR decision-making. There is a clear need for systems that synthesize these disparate data points into an actionable format [7]. 

**To develop a centralized scoring algorithm** : This objective aims to aggregate Honesty, Confidence, and Relevance into a single 0–10 metric with a reliability score targeting approximately 0.88 Pearson correlation with human standards [7]. 

## **6.1.4 Visualizing and Presenting Results** 

Data presentation is crucial for end-user adoption. Research into embodied AI, such as the "ERICA" system, shows that post-interview analysis and structured feedback generation are vital for both recruiters and candidates [10], [11]. 

**To develop an HR Dashboard for visualization:** This tool will visualize the results processed by the model, allowing recruiters to review candidate sessions and behavioural scores in a structured, transparent manner [7], [8]. 

## **6.2 Formalizing high-level implementation components** 

The implementation of the Modern Matrix system is structured into a modular pipeline architecture designed to ensure objective behavioural analysis and high-fidelity data processing. Each component is formalized to meet the rigorous technical standards required for recruitment AI, ensuring consistency across varying candidate environments [7]. 

## **6.2.1 Preprocessing Algorithm** 

In preparing the input audio and dialogue data for subsequent analysis, it is critical to consider the effects of environmental noise and hardware discrepancies. The following preprocessing steps are implemented to enhance the quality and consistency of the input data: 

**Acoustic Normalization** : Similar to colour correction in images, the system performs audio normalization to standardize volume levels and adjusts the frequency balance. This ensures that the AI evaluation is not biased by the quality of the candidate's microphone or the "warmth" of the recording environment [6]. 

**Noise Reduction:** Background interference, including sensor hum, keystroke sounds, and ambient office noise, can degrade transcription accuracy. We apply noise reduction algorithms, such as spectral subtraction and Wiener filtering, to suppress artifacts while preserving the clarity of the candidate's speech [5], [10]. 

**Resolution Standardization:** Variations in sample rates can pose challenges for prosodic analysis. The system standardizes all input audio to a 16kHz mono-channel bitstream, ensuring uniformity in data dimensions for efficient deep learning processing [5]. 

53 

**Dialogue Context Metadata Extraction:** In addition to primary signal processing, the system extracts metadata such as timestamps, speaker turns, and ASR (Automatic Speech Recognition) confidence scores. This provides contextual understanding and informs subsequent scoring steps, enhancing the overall utility of the dataset [10], [11]. 

## **6.2.2 Temporal and Semantic Segmentation** 

Prior to behavioural scoring, preprocessing techniques are applied to ensure audio clarity and signal integrity. The segmentation phase then isolates the relevant data regions for analysis: 

**Acoustic Segmentation:** Deep learning-based approaches, including Recurrent Neural Networks (RNNs) or Transformers trained on annotated interview audio, are employed to classify each time-frame of the conversation into distinct categories, such as "Interviewer Question," "Candidate Response," and "Silence/Background Noise" [10]. 

**Response Localization:** Signal detection methods are utilized to localize the specific response regions within the timeline. Techniques such as Voice Activity Detection (VAD) and Speaker Diarization facilitate the precise delineation of where a candidate's answer begins and ends [8]. 

**Behavioural Feature Identification:** Following localization, we focus on identifying specific "disfluent" or inconsistent regions in the response, such as long pauses or sudden shifts in tone. By analysing the prosodic contour (pitch/energy) and lexical density (word choice), the system differentiates between confident and hesitant responses [7]. 

**Feature Isolation (Feature Filtering):** Once the response area is identified, a binary feature filter is generated. This delineates the relevant semantic content (foreground) from filler words and tangential remarks (background), guiding the model toward realistic and contextually coherent scoring [8]. 

## **6.2.3 The Deep Learning Model** 

The core of the system utilizes a Multimodal Fusion approach, integrating disparate data streams to generate a holistic evaluation. This involves the following architectural considerations: 

**Model Architecture:** The original Generative Adversarial Network (GAN) framework, consisting of a generator and a discriminator trained in a minimax game setting, serves as the inspiration for our scoring stability [12]. 

**DCGANs and Prosodic Stability:** We adopt architectural guidelines from Deep Convolutional GANs (DCGANs), such as batch normalization and specific activation functions (LeakyReLU), to ensure the stability of the behavioural scoring across diverse datasets [3]. 

54 

**Conditional modelling (cGANs):** We extend the framework by conditioning the scoring on additional information, such as the specific job description or class labels from the Question Bank. This allows for the controlled generation of scores based on specific role attributes [1], [8]. 

**Conditional Feature Mapping for Score Translation:** A Conditional Feature Mapping architecture is explored to learn a mapping from raw "input behaviour" (the transcript/audio) to a "translated output" (the behavioural score). This conditioning enables the model to produce realistic and contextually coherent evaluations based on surrounding context [11]. 

**Model Training & Optimization:** During training, special consideration is given to the preservation of fairness and ethical integrity. The dataset is partitioned to ensure an adequate representation of diverse speech patterns and accents, facilitating robust generalization [10]. Efforts are directed toward balancing computational efficiency with scoring quality through techniques such as model distillation, ensuring the dashboard remains responsive and available for real-time recruitment exploration [11]. 

## **6.3 Data Extractions, Test datasets and Training datasets** 

To support our study on the automated evaluation of Honesty, Attitude, Confidence, and Answer Relevance, obtaining a high-quality, diverse dataset is essential. Our research methodology relies on multimodal data-integrating audio signals and text transcripts-to ensure a comprehensive assessment of candidate behaviour. 

## **6.3.1 Data Extractions** 

The extraction process focuses on capturing high-fidelity raw data that can be processed by our deep learning models. 

**Audio Extraction:** We extract audio samples at a 16kHz sampling rate with 16-bit PCM encoding. This specific resolution is necessary to preserve the subtle prosodic features, such as vocal tremors or micro-pauses, which are critical indicators of a candidate's Confidence and Honesty [6], [7]. 

**Feature Engineering:** Using libraries like Librosa or OpenSMILE, we extract Low-Level Descriptors (LLDs) including Mel-frequency cepstral coefficients (MFCCs), pitch, and energy. These features are extracted in 25ms windows to ensure real-time responsiveness during the interview monitoring process [9], [11]. 

**Textual Extraction:** Raw speech is converted into time-stamped text using Automatic Speech Recognition (ASR). This extraction includes "disfluencies" (e.g., "uhm," "ah"), as these fillers are statistically significant markers when evaluating Attitude and cognitive load [10]. 

55 

## **6.3.2 Training Datasets** 

To develop a robust and fair system, the training phase utilizes established datasets that provide a ground-truth baseline for human behaviour. Following datasets are the key considerations for our project: 

MIT Interview Dataset: This dataset is utilized to train the model on behavioural traits like engagement, friendliness, and overall "Attitude." It provides a foundational layer for correlating non-verbal cues with performance ratings [10]. 

MSP-Podcast (University of Texas at Dallas): Used to train the Confidence module. It provides ground-truth labels for Arousal (emotional intensity) and Dominance (vocal control), which serve as the primary acoustic proxies for candidate confidence and authoritative presence. 

Real-Life Deception Detection Dataset (University of Michigan): A collection of 121 video and audio clips from high-stakes real-world situations (trial testimonies) where the truth/lie outcome is legally verified. Critical for the Honesty module. It provides the system with highpressure audio samples to identify micro-tremors in pitch and frequency that correlate with deceptive behaviour under stress. 

IEMOCAP - Interactive Emotional Dyadic Motion Capture (USC): A multimodal database consisting of 12 hours of audiovisual data, including synchronized speech recordings and text transcripts of scripted and improvised dialogues. Utilized for training the Attitude module. By analysing the "Valence" (positivity/negativity) of both the audio signal and the corresponding transcript, the system learns to classify the candidate’s professional demeanour and sentiment. 

SQuAD (Stanford Question Answering Dataset):A reading comprehension dataset consisting of over 100,000 question-answer pairs based on a set of Wikipedia articles. Used to fine-tune the Semantic Engine (Sentence-BERT). It trains the system to measure Answer Relevance by calculating the semantic similarity between the candidate's transcript and the "ideal answer" stored in the Question Bank. 

Columbia X-Cultural Deception (CXD) Dataset: A specialized speech dataset containing 120 hours of audio from subjects engaged in interview tasks where they were incentivized to lie or tell the truth. Directly aligns with the Honesty and Attitude metrics. It helps the model distinguish between natural interview nerves and intentional linguistic inconsistencies in a purely conversational, audio-only context. 

Liar Dataset & Sentiment Banks: For the Honesty and Attitude components, we incorporate public NLP datasets labelled for deceptive speech and sentiment polarity (positive, negative, neutral) to refine the model's ability to detect linguistic inconsistencies [6], [1]. 

## **6.3.3 Test Datasets** 

The test dataset is used to validate the model's performance on unseen data, ensuring it generalizes across different candidate demographics: 

Mock Interview Samples: We utilize a set of 50–100 controlled mock interviews where participants are given specific "personas" (e.g., high-confidence vs. low-confidence) to test the system's diagnostic accuracy [6]. 

56 

TESS - Toronto Emotional Speech Set: A collection of 2,800 audio clips of speech specifically recorded to convey different emotional states (e.g., neutral, pleasant surprise, anxiety).Serves as a validation set for the Acoustic Normalization and Feature Extraction algorithms. It ensures the system can accurately detect shifts in vocal tone regardless of the specific words spoken. 

Environmental Variance Set: A subset of the test data includes recordings with varying levels of background noise and different hardware (laptop mics vs. headsets) to validate the Noise Reduction and Normalization preprocessing steps [5], [11]. 

Cross-Role Validation: The Answer Relevance module is tested against diverse job categories (Technical, HR, Sales) within our Question Bank to ensure the semantic similarity scoring remains accurate across different professional vocabularies [8]. 

## **6.4 Non-functional aspects** 

Non-functional requirements define the systemic constraints and quality attributes that ensure the Modern Matrix platform is reliable, secure, and effective for high-stakes recruitment. These aspects are critical for establishing trust between the AI system, the recruiter, and the candidate. 

## **6.4.1 Performance and Latency** 

To maintain the flow of standard HR workflows, the system must process complex multimodal data with minimal delay: 

Processing Time: The deep learning model, including the fusion of audio and text, must generate the final Behavioural Score (Honesty, Attitude, Confidence, and Relevance) within 2minutes of the interview's conclusion. 

Real-time Monitoring: The system must support real-time audio feature extraction (prosody and pitch) with a latency of less than 500ms to ensure the "Attentive Listening" markers are synchronized with the candidate's speech. 

## **6.4.2 Security and Data Privacy** 

Given the sensitivity of interview data, the research design incorporates strict ethical and technical safeguards: 

Data Purging Policy: As established in our database architecture, a 30-day auto-deletion policy is strictly enforced. All entries in the TRANSCRIPT and BEHAVIORAL_SCORE tables are purged using a MySQL Event Scheduler to protect candidate privacy and comply with international data protection standards. 

Encryption: All audio streams and extracted text are encrypted during transit (TLS 1.3) and at rest (AES-256) to prevent unauthorized access to candidate evaluations. 

57 

## **6.4.3 Reliability and Accuracy** 

The system's utility depends on its ability to consistently replicate expert human judgment: 

Scoring Consistency: The system aims for a Pearson Correlation Coefficient of 0.75 or higher when compared to human recruiter ratings. This ensures that the AI’s evaluation of "Confidence" or "Relevance" is technically sound and professionally valid. 

Robustness to Noise: The Pre-processing Algorithm must maintain a Word Error Rate (WER) of less than 15% even in environments with moderate background noise, ensuring that "Honesty" and "Attitude" scores are not skewed by poor transcription. 

## **6.4.4 Scalability and Availability** 

System Availability: The HR Dashboard and the monitoring backend must maintain an uptime of 90%, ensuring that recruiters can access candidate analytics whenever needed. 

Concurrent Processing: The architecture is designed to handle multiple simultaneous interview sessions by utilizing containerized microservices, allowing the scoring engine to scale based on the volume of applicants. 

## **6.4.5 Ethical Fairness (Anti-Bias)** 

Diversity in Evaluation: The model is specifically tuned to be "accent-agnostic" and "genderneutral." By focusing on objective prosodic features (vocal energy/pitch) and semantic similarity (keyword matching) rather than demographic markers, the system actively works to mitigate the unconscious biases prevalent in human-led unstructured interviews. 

## **6.5 Proposed validation methods and measurements** 

To assess the performance and scientific validity of the Modern Matrix system, we employ a multi-layered validation framework. This framework focuses on the accuracy of our four core pillars: Honesty, Attitude, Confidence, and Answer Relevance. By utilizing both objective mathematical metrics and qualitative expert benchmarks, we ensure the system is ready for industrial deployment. 

## **6.5.1 Accuracy and Reliability Metrics** 

The primary goal is to determine how closely the AI's evaluation aligns with professional human judgment. 

- Pearson Correlation Coefficient: This is our primary metric for validating Confidence and Attitude. We aim for a correlation of 0.88 between the AI-generated scores and the ratings provided by a panel of expert HR recruiters. A high value indicates that the model successfully replicates human-level intuition using objective data. 

- Root Mean Square Error (RMSE): Used specifically for Answer Relevance. RMSE quantifies the deviation between the AI’s calculated relevance score and the "ground truth" score mapped from the Question Bank 

58 

MSE 1 Th RMSE = 4|—Y“(y; — 9)? = >>(u— 9) 

## REFERENCES 

[1] M. Mirza and S. Osindero, “Conditional Generative Adversarial Nets,” _arXiv preprint_ arXiv:1411.1784, 2014. 

[2] S. Sinclair, “Applicants' faith in recruiters' intuition predicts process favorability for the unstructured employment interview,” _Scandinavian Journal of Work and Organizational Psychology_ , vol. 8, no. 1, pp. 1–7, 2023. 

[3] A. Radford, L. Metz, and S. Chintala, “Unsupervised representation learning with deep convolutional generative adversarial networks,” in _Proc. Int. Conf. Learn. Representations (ICLR)_ , 2016. 

[4] J. M. Basch, K. G. Melchers, A. Kurz, M. Krieger, and L. Miller, “It takes more than a good camera: Which factors contribute to differences between face-to-face interviews and videoconference interviews regarding performance ratings and interviewee perceptions?,” _Journal of Business and Psychology_ , vol. 36, pp. 921–940, 2021. 

[5] T. L. Wilder and N. E. Stratchan, “Artificial intelligence-enhanced interview success: Leveraging eye-tracking and cognitive measures to support self-regulation in college students with ADHD,” _Education Sciences_ , vol. 15, no. 2, p. 165, Jan. 2025. 

[6] S. V. Golande, P. Dandage, A. Jadhav, P. Mohite, and A. Shahane, “Mock interview evaluator powered by AI,” _Excel International Journal of Technology, Engineering and Management_ , vol. 12, no. 2, pp. 80–87, Jan. 2025. 

[7] B. C. Lee and B. Y. Kim, “Development of an AI-based interview system for remote hiring,” _International Journal of Advanced Research in Engineering and Technology (IJARET)_ , vol. 12, no. 3, pp. 654–663, Mar. 2021. 

[8] N. Reimers and I. Gurevych, “Sentence-BERT: Sentence embeddings using Siamese BERTnetworks,” in _Proc. 2019 Conf. Empirical Methods in Natural Language Processing and 9th Int. Joint Conf. Natural Language Processing (EMNLP-IJCNLP)_ , Hong Kong, China, 2019, pp. 3982–3992. 

[9] M. J. Arul and G. S. Rao, “A review of emotion recognition and confidence analysis in AI-based mock interviews,” _IEEE Trans. Human-Mach. Syst._ , vol. 51, no. 4, pp. 312–325, 2021. 

[10] Z. H. Pang, Y. Fu, D. Lala, M. Elmers, K. Inoue, and T. Kawahara, “Human-like embodied AI interviewer: Employing Android ERICA in real international conference,” _arXiv preprint_ arXiv:2412.09867, 2024. 

[11] A. Priyadarshi and K. Dutta, “AI-based interview system for remote hiring using candidate speech analysis,” _International Journal of Advanced Computer Science and Applications_ , vol. 12, no. 6, pp. 221–228, 2021. 

[12] I. Goodfellow, J. Pouget-Abadie, M. Mirza, B. Xu, D. Warde-Farley, S. Ozair, A. Courville, and Y. Bengio, “Generative adversarial networks,” _Communications of the ACM_ , vol. 63, no. 11, pp. 139– 144, Nov. 2020. 

60 



<!-- Start of picture text -->
ee<br>ee<br>ee<br>el<br>ee<br>pf<br>a<br><!-- End of picture text -->



<!-- Start of picture text -->
_<br><!-- End of picture text -->


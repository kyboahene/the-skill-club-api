# Assessment Recording and Verification System

## Overview

This document describes the comprehensive assessment recording system, detailing what information is captured during a candidate's assessment session, how it's stored, and how the verification score (trust score) is calculated to ensure assessment integrity.

## Table of Contents

1. [Assessment Session Lifecycle](#assessment-session-lifecycle)
2. [Data Collection During Assessment](#data-collection-during-assessment)
3. [Database Storage Structure](#database-storage-structure)
4. [Verification Score Calculation](#verification-score-calculation)
5. [Risk Factors and Penalties](#risk-factors-and-penalties)
6. [API Endpoints](#api-endpoints)

---

## Assessment Session Lifecycle

### 1. Session Initialization

**Trigger**: When candidate clicks "Start Assessment" on TestIntroductionScreen (NOT when entering name/email)

**What Happens**:
```typescript
POST /candidate-sessions
{
  candidateEmail: string,
  candidateName: string,
  candidatePhone?: string,
  assessmentId: string
}
```

**Database Record Created**:
```typescript
CandidateSession {
  id: string,
  candidateEmail: string,
  candidateName: string,
  candidatePhone?: string,
  assessmentId: string,
  startTime: DateTime (NOW),  // Session start timestamp
  status: 'IN_PROGRESS',
  ipAddress?: string,
  userAgent?: string,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### 2. Active Assessment Period

During the assessment, the system continuously collects and stores data across multiple related tables.

### 3. Session Completion

**Trigger**: When candidate submits final assessment

**What Happens**:
```typescript
POST /candidate-sessions/:id/submit
{
  answers: Array<{
    questionId: string,
    response: any,
    timeSpent: number,
    submittedAt: DateTime
  }>,
  totalTimeSpent: number
}
```

**Database Updates**:
- Status changed to `COMPLETED`
- `endTime` timestamp set
- All answers persisted
- Verification score calculated

---

## Data Collection During Assessment

### 1. **Candidate Answers** (`CandidateAnswer`)

Captured for each question answered:

```typescript
{
  id: string,
  sessionId: string,
  questionId: string,
  response: JSON,              // Actual answer data
  timeSpent: number,           // Seconds spent on question
  submittedAt: DateTime,       // When answer was submitted
  score?: number,              // AI or auto-graded score
  maxScore?: number,           // Maximum possible score
  percentage?: number,         // Score as percentage
  attempts: number,            // Number of attempts (default: 1)
  difficulty?: string,         // Question difficulty level
  testId?: string,             // Associated test ID
  scoringMethod?: string       // How it was scored
}
```

**Tracked Per Question**:
- ✅ Exact response content
- ✅ Time spent (in seconds)
- ✅ Submission timestamp
- ✅ Number of attempts
- ✅ Calculated scores

### 2. **Anti-Cheat Violations** (`AntiCheatViolation`)

Monitors and records suspicious behavior:

```typescript
{
  id: string,
  sessionId: string,
  type: string,                // e.g., "TAB_SWITCH", "COPY_PASTE", "FULLSCREEN_EXIT"
  description: string,         // Human-readable description
  timestamp: DateTime,         // When violation occurred
  questionId?: string,         // Question being answered during violation
  severity: ViolationSeverity, // LOW, MEDIUM, HIGH
  details: JSON,               // Additional metadata
  resolved: boolean            // Default: false
}
```

**Violation Types Tracked**:
- 🚫 Tab switching / window focus loss
- 🚫 Copy/paste attempts
- 🚫 Fullscreen exit
- 🚫 Multiple browser tabs
- 🚫 Screen recording interruptions
- 🚫 Suspicious mouse/keyboard patterns
- 🚫 Face detection failures (if enabled)
- 🚫 Multiple faces detected
- 🚫 Excessive idle time

**Severity Levels**:
- **LOW**: Minor infractions (brief focus loss)
- **MEDIUM**: Moderate concerns (copy attempt, tab switch)
- **HIGH**: Serious violations (multiple violations, pattern of cheating)

### 3. **Device Information** (`DeviceInfo`)

Captured once at session start:

```typescript
{
  id: string,
  sessionId: string,
  userAgent: string,           // Browser user agent
  platform: string,            // OS platform (Windows, macOS, Linux)
  language: string,            // Browser language
  timezone: string,            // User timezone
  screenResolution: string,    // e.g., "1920x1080"
  windowSize: string,          // Browser window size
  colorDepth: number,          // Display color depth
  pixelRatio: number,          // Device pixel ratio
  touchSupport: boolean,       // Touch capability
  deviceMemory?: number,       // RAM (if available)
  hardwareConcurrency?: number,// CPU cores
  connection?: string,         // Network type
  deviceFingerprint?: string   // Unique device hash
}
```

**Purpose**: 
- Device verification
- Detect device switching mid-assessment
- Ensure compatible hardware

### 4. **Session Behavior** (`SessionBehavior`)

Tracks behavioral patterns throughout the session:

```typescript
{
  id: string,
  sessionId: string,
  totalTabSwitches: number,          // Total tab switches
  totalCopyPasteAttempts: number,    // Copy/paste attempts
  totalFullscreenExits: number,      // Fullscreen exits
  totalIdleTime: number,             // Seconds idle
  averageResponseTime: number,       // Avg time per question
  questionNavigationPattern: JSON,   // Forward/backward navigation
  suspiciousActivityCount: number,   // Total suspicious activities
  focusLossCount: number,            // Times focus was lost
  mouseMovementPattern?: JSON,       // Mouse tracking data
  keystrokePattern?: JSON,           // Typing pattern analysis
  behavioralScore?: number,          // Calculated behavior score
  anomalyDetected: boolean,          // AI-detected anomalies
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Behavioral Metrics**:
- ✅ Navigation patterns (linear vs erratic)
- ✅ Response consistency
- ✅ Time distribution across questions
- ✅ Mouse movement patterns
- ✅ Keystroke dynamics
- ✅ Focus/idle patterns

### 5. **Real-Time Monitoring** (`RealTimeMonitoring`)

Live monitoring data during assessment:

```typescript
{
  id: string,
  sessionId: string,
  currentQuestionId?: string,        // Current question
  isActive: boolean,                 // Session active status
  lastActivityTimestamp: DateTime,   // Last interaction
  currentFocusState: string,         // "FOCUSED" | "BLURRED"
  warningsIssued: number,            // Total warnings shown
  autoSaveCount: number,             // Auto-save events
  connectionStatus: string,          // Network status
  batteryLevel?: number,             // Device battery (if available)
  cpuUsage?: number,                 // System load
  memoryUsage?: number,              // Memory consumption
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### 6. **Screen Recording Data** (`ScreenRecordingData`)

If screen recording is enabled:

```typescript
{
  id: string,
  sessionId: string,
  recordingStartTime: DateTime,
  recordingEndTime?: DateTime,
  totalDuration?: number,            // Seconds
  recordingUrl?: string,             // Storage URL
  thumbnailUrl?: string,             // Preview thumbnail
  fileSize?: number,                 // Bytes
  format?: string,                   // Video format
  quality?: string,                  // Recording quality
  uploadStatus: string,              // "PENDING" | "UPLOADING" | "COMPLETED"
  processingStatus?: string,         // Post-processing status
  facialRecognitionData?: JSON,      // Face detection results
  violations?: RecordingViolation[], // Related violations
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Captures**:
- 📹 Full session video recording
- 📹 Facial recognition data (if enabled)
- 📹 Screen activity patterns
- 📹 Recording quality metrics

### 7. **Question Tracking** (`QuestionTracking`)

Detailed tracking per question:

```typescript
{
  id: string,
  sessionId: string,
  questionId: string,
  firstViewedAt: DateTime,           // When first viewed
  lastViewedAt: DateTime,            // Last interaction
  timeSpent: number,                 // Total seconds on question
  revisitCount: number,              // Times returned to question
  attempts: number,                  // Answer attempts
  changedAnswerCount: number,        // Times answer changed
  skipped: boolean,                  // Was question skipped
  flagged: boolean,                  // Candidate flagged for review
  focusLossEvents: number,           // Focus lost while on question
  copyPasteAttempts: number,         // Copy/paste on this question
  tabSwitches: number,               // Tab switches during question
  suspiciousActivity: boolean,       // Anomaly detected
  metadata: JSON,                    // Additional tracking data
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Per-Question Metrics**:
- ⏱️ Time spent on each question
- ⏱️ View/revisit patterns
- ⏱️ Answer change frequency
- ⏱️ Focus/distraction events
- ⏱️ Violation association

### 8. **Score Summary** (`ScoreSummary`)

Final assessment results:

```typescript
{
  id: string,
  sessionId: string,
  totalScore: number,                // Total points earned
  maxPossibleScore: number,          // Maximum achievable
  percentage: number,                // Score percentage
  breakdown: JSON,                   // Category-wise scores
  passStatus: boolean,               // Pass/fail
  createdAt: DateTime,
  updatedAt: DateTime
}
```

**Score Breakdown Example**:
```json
{
  "technical": { "score": 45, "max": 50, "percentage": 90 },
  "behavioral": { "score": 38, "max": 50, "percentage": 76 },
  "total": { "score": 83, "max": 100, "percentage": 83 }
}
```

---

## Database Storage Structure

### Entity Relationship Diagram

```
CandidateSession (1:1 or 1:many relationships)
    ├── CandidateAnswer (1:many)
    ├── ScoreSummary (1:1)
    ├── AntiCheatViolation (1:many)
    ├── DeviceInfo (1:1)
    ├── SessionBehavior (1:1)
    ├── RealTimeMonitoring (1:1)
    ├── ScreenRecordingData (1:1)
    └── QuestionTracking (1:many)
```

### Storage Flow

1. **Session Start** → Create `CandidateSession` + `DeviceInfo` + `RealTimeMonitoring`
2. **During Assessment** → Update `SessionBehavior`, create `QuestionTracking`, log `AntiCheatViolation`
3. **Answer Submission** → Create `CandidateAnswer` records
4. **Session End** → Create `ScoreSummary`, finalize `ScreenRecordingData`, calculate verification score

---

## Verification Score Calculation

### Overview

The **Verification Score** (also called Trust Score) is a 0-100 metric that measures the integrity and authenticity of an assessment session. It starts at 100 and is reduced based on detected violations and suspicious behavior.

### Calculation Algorithm

```typescript
async calculateVerificationScore(sessionId: string) {
  // 1. Fetch session with related data
  const session = await prisma.candidateSession.findUnique({
    where: { id: sessionId },
    include: {
      violations: true,
      deviceInfo: true,
      sessionBehavior: true,
      monitoring: true,
    },
  });

  // 2. Start with perfect score
  let verificationScore = 100;
  const riskFactors = [];

  // 3. Deduct points for violations
  if (session.violations?.length > 0) {
    const violationPenalty = session.violations.reduce((penalty, violation) => {
      switch (violation.severity) {
        case 'HIGH':   return penalty + 15;  // -15 points per high violation
        case 'MEDIUM': return penalty + 8;   // -8 points per medium violation
        case 'LOW':    return penalty + 3;   // -3 points per low violation
        default:       return penalty;
      }
    }, 0);
    
    verificationScore -= violationPenalty;
    riskFactors.push({
      factor: 'Anti-cheat violations',
      impact: -violationPenalty,
      count: session.violations.length,
    });
  }

  // 4. Additional penalties (can be extended)
  // - Excessive tab switches
  // - Unusual timing patterns
  // - Device changes
  // - Network anomalies

  // 5. Ensure score doesn't go below 0
  verificationScore = Math.max(0, verificationScore);

  // 6. Determine trust level
  const trustLevel = 
    verificationScore >= 80 ? 'HIGH' : 
    verificationScore >= 60 ? 'MEDIUM' : 'LOW';

  return {
    verificationScore,
    riskFactors,
    trustLevel,
  };
}
```

---

## Risk Factors and Penalties

### Violation Severity Matrix

| Violation Type | Severity | Points Deducted | Example |
|---------------|----------|-----------------|---------|
| Brief focus loss | LOW | -3 | Window lost focus for <5s |
| Tab switch | MEDIUM | -8 | Switched to another tab |
| Copy/paste attempt | MEDIUM | -8 | Tried to paste text |
| Fullscreen exit | MEDIUM | -8 | Exited fullscreen mode |
| Multiple violations | HIGH | -15 | 3+ violations on same question |
| Face not detected | HIGH | -15 | No face in camera view |
| Multiple faces | HIGH | -15 | Multiple people detected |
| Recording failure | HIGH | -15 | Screen recording stopped |

### Trust Level Classification

| Score Range | Trust Level | Description | Action |
|-------------|-------------|-------------|--------|
| 80-100 | **HIGH** | Minimal/no violations detected | ✅ Accept results with confidence |
| 60-79 | **MEDIUM** | Some concerns, review recommended | ⚠️ Manual review suggested |
| 0-59 | **LOW** | Significant integrity concerns | ❌ Flag for investigation/reject |

### Extended Risk Factors (Future Implementation)

1. **Behavioral Anomalies**
   - Typing speed inconsistency (-5 points)
   - Erratic mouse movements (-5 points)
   - Unusual answer patterns (-10 points)

2. **Timing Anomalies**
   - Too fast completion (-10 points)
   - Consistent exact timing (-10 points)
   - Long idle periods (-5 points)

3. **Device/Network Issues**
   - Device change detected (-20 points)
   - IP address change (-15 points)
   - VPN/proxy detected (-10 points)

4. **Pattern Recognition**
   - Answer similarity to known sources (-20 points)
   - Collaboration detected (-25 points)
   - Bot-like behavior (-30 points)

---

## API Endpoints

### Session Management

#### Create Session
```http
POST /candidate-sessions
Content-Type: application/json

{
  "candidateEmail": "candidate@example.com",
  "candidateName": "John Doe",
  "candidatePhone": "+1234567890",
  "assessmentId": "assessment_id"
}

Response: CandidateSession object
```

#### Update Session
```http
PUT /candidate-sessions/:id
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "currentQuestionIndex": 5
}

Response: Updated CandidateSession
```

#### Submit Assessment
```http
POST /candidate-sessions/:id/submit
Content-Type: application/json

{
  "answers": [
    {
      "questionId": "q1",
      "response": { "answer": "Paris" },
      "timeSpent": 45,
      "submittedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "totalTimeSpent": 1800
}

Response: { success: true, session: CandidateSession }
```

### Monitoring & Tracking

#### Add Violation
```http
POST /candidate-sessions/:id/violations
Content-Type: application/json

{
  "type": "TAB_SWITCH",
  "description": "Candidate switched to another tab",
  "severity": "MEDIUM",
  "timestamp": "2024-01-15T10:25:30Z",
  "metadata": { "duration": 5 }
}

Response: AntiCheatViolation object
```

#### Update Device Info
```http
PUT /candidate-sessions/:id/device-info
Content-Type: application/json

{
  "userAgent": "Mozilla/5.0...",
  "platform": "MacOS",
  "screenResolution": "1920x1080",
  "deviceFingerprint": "abc123..."
}

Response: DeviceInfo object
```

#### Update Behavioral Profile
```http
PUT /candidate-sessions/:id/behavioral-profile
Content-Type: application/json

{
  "totalTabSwitches": 3,
  "totalCopyPasteAttempts": 1,
  "averageResponseTime": 45,
  "suspiciousActivityCount": 2
}

Response: SessionBehavior object
```

#### Update Screen Recording
```http
PUT /candidate-sessions/:id/screen-recording
Content-Type: application/json

{
  "recordingUrl": "https://storage.example.com/recording.mp4",
  "totalDuration": 1800,
  "uploadStatus": "COMPLETED"
}

Response: ScreenRecordingData object
```

#### Update Question Tracking
```http
PUT /candidate-sessions/:id/tracking-data
Content-Type: application/json

{
  "questionId": "q1",
  "timeSpent": 45,
  "attempts": 1,
  "revisitCount": 2,
  "focusLossEvents": 1
}

Response: QuestionTracking object
```

### Verification

#### Calculate Verification Score
```http
POST /candidate-sessions/:id/calculate-verification-score

Response: {
  "verificationScore": 85,
  "riskFactors": [
    {
      "factor": "Anti-cheat violations",
      "impact": -15,
      "count": 2
    }
  ],
  "trustLevel": "HIGH"
}
```

---

## Best Practices

### For Frontend Implementation

1. **Auto-save frequently** - Don't wait until submission to save answers
2. **Log violations immediately** - Real-time violation reporting
3. **Track timing accurately** - Use proper timestamps for all events
4. **Handle network failures** - Retry failed requests, queue offline data
5. **Minimize false positives** - Don't penalize legitimate behavior

### For Backend Processing

1. **Validate all inputs** - Sanitize and validate all incoming data
2. **Use transactions** - Ensure data consistency across related tables
3. **Implement rate limiting** - Prevent abuse of tracking endpoints
4. **Archive old sessions** - Move completed sessions to cold storage
5. **Calculate scores async** - Don't block submission on score calculation

### For Security

1. **Encrypt sensitive data** - PII and recording data
2. **Implement audit logs** - Track all data access
3. **Use signed URLs** - For screen recording uploads
4. **Validate session ownership** - Ensure users can only access their data
5. **Implement GDPR compliance** - Allow data deletion requests

---

## Summary

The assessment recording system provides:

✅ **Comprehensive data collection** across 9 related database tables  
✅ **Real-time violation tracking** with severity-based penalties  
✅ **Detailed behavioral analysis** for integrity verification  
✅ **Flexible verification scoring** with customizable risk factors  
✅ **Complete audit trail** for every assessment session  
✅ **Scalable architecture** supporting millions of concurrent sessions  

This ensures assessment integrity while maintaining candidate experience and providing actionable insights for hiring decisions.

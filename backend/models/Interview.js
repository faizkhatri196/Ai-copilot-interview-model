import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  role: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    default: 'General Tech',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  interviewerPersonality: {
    type: String,
    enum: ['Professional', 'Friendly', 'Strict', 'Senior Engineer', 'Behavioral'],
    default: 'Professional',
  },
  // Supported rounds: Online Assessment, DSA Coding, Technical Fundamentals, Resume-Based, Company-Specific, System Design, Behavioral, HR, Voice
  roundType: {
    type: String,
    enum: [
      'Technical Interview', // Legacy compatibility
      'Online Assessment',
      'DSA Coding Interview',
      'Technical Fundamentals',
      'Resume-Based Interview',
      'Company-Specific Interview',
      'System Design',
      'Behavioral Interview',
      'HR Interview',
      'AI Voice Interview',
      'Full Multi-Round Simulation'
    ],
    default: 'Technical Interview',
  },
  roundIndex: {
    type: Number,
    default: 1,
  },
  totalRounds: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed', 'Paused', 'Cancelled'],
    default: 'In Progress',
  },
  questions: [{
    questionId: String,
    questionText: String,
    category: String,
    topic: String,
    difficulty: String,
    expectedCriteria: String,
    timeLimitSeconds: Number,
    followUpQuestions: [String],
    sourceEvidence: String,
  }],
  answers: [{
    questionIndex: Number,
    answerText: String,
    audioTranscript: String,
    codeSubmission: {
      code: String,
      language: String,
      testsPassed: Number,
      testsTotal: Number,
      runtimeMs: Number,
      memoryMb: Number,
      status: String, // 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compile Error'
      errorMessage: String,
    },
    evaluation: {
      score: Number,
      technicalCorrectness: {
        score: Number,
        notes: String,
      },
      communicationAndClarity: {
        score: Number,
        notes: String,
      },
      depthAndReasoning: {
        score: Number,
        notes: String,
      },
      codeQuality: {
        score: Number,
        notes: String,
      },
      feedback: String,
      correctness: String,
      clarity: String,
      missedConcepts: [String],
      positiveObservations: [String],
      suggestedBetterAnswer: String,
    },
    durationSeconds: Number,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  finalScore: {
    type: Number,
    default: 0,
  },
  dimensionScores: {
    technicalCorrectness: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    depthAndReasoning: { type: Number, default: 0 },
    codeQuality: { type: Number, default: 0 },
    behavioralRelevance: { type: Number, default: 0 },
  },
  overallFeedback: {
    type: String,
    default: '',
  },
  strengthsIdentified: [String],
  criticalGapsIdentified: [String],
  recommendedFocusTopics: [String],
  sessionDurationSeconds: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;

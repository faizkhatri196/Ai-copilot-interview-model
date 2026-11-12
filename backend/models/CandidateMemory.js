import mongoose from 'mongoose';

const candidateMemorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  topicMastery: [{
    topic: String, // e.g., 'Binary Search', 'Dynamic Programming', 'Operating Systems', 'System Design'
    category: String, // 'DSA', 'Core CS', 'Behavioral', 'System Design'
    scoreAverage: Number, // 0 - 100
    questionsAttempted: Number,
    lastPracticed: Date,
    status: {
      type: String,
      enum: ['Strong', 'Moderate', 'Weak', 'Needs Practice'],
      default: 'Moderate',
    },
  }],
  recurringMistakes: [{
    topic: String,
    mistakeSummary: String,
    frequency: Number,
    lastObserved: Date,
    recommendation: String,
  }],
  strengths: [String],
  weaknesses: [String],
  priorityTopicsForNextInterview: [String],
  totalInterviewsCompleted: {
    type: Number,
    default: 0,
  },
  historicalScores: [{
    interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    date: Date,
    overallScore: Number,
    role: String,
    roundType: String,
  }],
}, {
  timestamps: true,
});

const CandidateMemory = mongoose.model('CandidateMemory', candidateMemorySchema);
export default CandidateMemory;


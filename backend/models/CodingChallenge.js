import mongoose from 'mongoose';

const codingChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  topic: {
    type: String,
    required: true, // Arrays, Strings, Binary Search, Trees, Graphs, DP, Greedy, Sliding Window, etc.
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  companyTags: [String],
  description: {
    type: String,
    required: true,
  },
  examples: [{
    input: String,
    output: String,
    explanation: String,
  }],
  constraints: [String],
  starterTemplates: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: {
      type: Boolean,
      default: false,
    },
    explanation: String,
  }],
  timeLimitMs: {
    type: Number,
    default: 2000,
  },
  memoryLimitMb: {
    type: Number,
    default: 128,
  },
  hints: [String],
  optimalComplexity: {
    time: String,
    space: String,
  },
}, {
  timestamps: true,
});

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);
export default CodingChallenge;


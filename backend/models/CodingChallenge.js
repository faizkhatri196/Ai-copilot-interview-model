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
    index: true,
  },
  topic: {
    type: String,
    required: true,
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
    index: true,
  },
  companyTags: [{
    type: String,
    index: true,
  }],
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
  // Public test cases shown on the problem statement page
  publicTestCases: [{
    input: String,
    expectedOutput: String,
    explanation: String,
  }],
  // PRIVATE BACKEND ONLY: Never sent to client frontend APIs
  hiddenTestCases: [{
    input: {
      type: String,
      select: false, // Excluded from default Mongoose queries
    },
    expectedOutput: {
      type: String,
      select: false,
    },
    weight: {
      type: Number,
      default: 1,
      select: false,
    },
    tag: {
      type: String,
      select: false,
    }
  }],
  referenceSolution: {
    type: String,
    select: false,
  },
  testGeneratorCode: {
    type: String,
    select: false,
  },
  evaluationRubric: {
    timeComplexityExpectation: String,
    spaceComplexityExpectation: String,
    scoringCriteria: [String],
  },
  timeLimitMs: {
    type: Number,
    default: 2500,
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

codingChallengeSchema.index({ topic: 1, difficulty: 1 });

/**
 * Strips all internal solutions and hidden test data before sending to clients
 */
codingChallengeSchema.methods.toPublicJSON = function () {
  const obj = this.toObject ? this.toObject() : { ...this };
  delete obj.hiddenTestCases;
  delete obj.referenceSolution;
  delete obj.testGeneratorCode;
  return obj;
};

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);
export default CodingChallenge;

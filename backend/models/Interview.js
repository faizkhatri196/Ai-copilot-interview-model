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
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  status: {
    type: String,
    enum: ['In Progress', 'Completed'],
    default: 'In Progress',
  },
  questions: [{
    questionText: String,
    category: String,
  }],
  answers: [{
    questionIndex: Number,
    answerText: String,
    evaluation: {
      score: Number,
      feedback: String,
      correctness: String,
      clarity: String,
    }
  }],
  finalScore: {
    type: Number,
    default: 0,
  },
  overallFeedback: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;

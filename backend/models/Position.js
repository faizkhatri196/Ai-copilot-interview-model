import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  category: {
    type: String,
    enum: ['Software Development', 'AI and Data', 'Infrastructure', 'Other'],
    default: 'Software Development',
  },
  levels: [{
    levelName: String, // Intern, Entry (L3/SDE1), Mid (L4/SDE2), Senior (L5)
    typicalYearsExp: String,
    coreCompetencies: [String],
    expectedDepth: String,
  }],
  skillRequirements: {
    mandatory: [String],
    preferred: [String],
    fundamentals: [String], // OS, DBMS, Networks, OOP, System Design
  },
  defaultInterviewRounds: [{
    roundIndex: Number,
    roundName: String,
    roundType: String,
    durationMinutes: Number,
    description: String,
  }],
  keyEvaluationCriteria: [{
    dimension: String,
    weightPercent: Number,
    description: String,
  }],
}, {
  timestamps: true,
});

const Position = mongoose.model('Position', positionSchema);
export default Position;


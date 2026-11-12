import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetCompany: {
    type: String,
    required: true,
  },
  targetPosition: {
    type: String,
    required: true,
  },
  timelineWeeks: {
    type: Number,
    default: 4,
  },
  dailyTargetHours: {
    type: Number,
    default: 2,
  },
  completionPercentage: {
    type: Number,
    default: 0,
  },
  milestones: [{
    weekNumber: Number,
    theme: String, // e.g. "DSA Fundamentals & Core CS", "Advanced Graphs & High-Scale System Design"
    focusAreas: [String],
    days: [{
      dayNumber: Number,
      title: String,
      tasks: [{
        taskId: String,
        description: String,
        category: String, // 'DSA', 'Core CS', 'Behavioral', 'Mock Interview', 'System Design'
        estimatedMinutes: Number,
        isCompleted: {
          type: Boolean,
          default: false,
        },
        resourceLink: String,
      }],
    }],
  }],
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Archived'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;


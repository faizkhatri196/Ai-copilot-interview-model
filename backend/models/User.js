import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['candidate', 'admin'],
    default: 'candidate',
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  onboardingStep: {
    type: Number,
    default: 1,
  },
  // Profile & Onboarding Details
  profile: {
    phone: String,
    location: String,
    headline: String,
    bio: String,
    experienceLevel: {
      type: String,
      enum: ['Student', 'Fresher', '1-3 Years', '3-5 Years', '5+ Years'],
      default: 'Fresher',
    },
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      graduationYear: Number,
      gpa: String,
    }],
    technicalSkills: [String],
    programmingLanguages: [String],
    frameworks: [String],
    tools: [String],
    targetCompanies: [String],
    targetPositions: [String],
    preferredLanguage: {
      type: String,
      default: 'English',
    },
    weeklyTargetHours: {
      type: Number,
      default: 10,
    },
    preparationGoals: [String],
    resumeUrl: String,
  },
  // Interview Analytics Aggregates
  analytics: {
    totalInterviews: { type: Number, default: 0 },
    completedRounds: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    codingAccuracy: { type: Number, default: 0 },
    strongestTopics: [String],
    weakestTopics: [String],
    practiceTimeMinutes: { type: Number, default: 0 },
  },
  settings: {
    notificationsEnabled: { type: Boolean, default: true },
    interviewerPersonality: {
      type: String,
      enum: ['Professional', 'Friendly', 'Strict', 'Senior Engineer', 'Behavioral'],
      default: 'Professional',
    },
    voiceSpeed: { type: Number, default: 1.0 },
    autoSpeak: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
  },
}, {
  timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;

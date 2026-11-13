import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  logo: String,
  domain: String,
  industry: String,
  headquarters: String,
  description: String,
  cultureSummary: String,
  leadershipPrinciples: [String],
  techStack: [String],
  hiringLocations: [String],
  // Public verified research findings
  research: {
    lastChecked: {
      type: Date,
      default: Date.now,
    },
    officialCareersUrl: String,
    overview: String,
    interviewStages: [{
      stageNumber: Number,
      name: String,
      roundType: String, // Online Assessment, Technical Screen, Onsite DSA, System Design, Behavioral
      durationMinutes: Number,
      format: String,
      keyFocus: String,
    }],
    reportedTopics: [{
      category: String, // DSA, System Design, Core CS, Behavioral
      topic: String,
      frequency: String, // High, Medium, Occasional
      exampleThemes: [String],
    }],
    recentExperiences: [{
      title: String,
      role: String,
      experienceLevel: String,
      summary: String,
      reportedDifficulty: String,
      roundsDetails: [String],
      outcome: String,
      dateReported: Date,
    }],
    sources: [{
      title: String,
      url: String,
      category: {
        type: String,
        enum: ['OFFICIAL INFORMATION', 'COMMUNITY REPORTED', 'AI INFERRED', 'NOT VERIFIED'],
        default: 'COMMUNITY REPORTED',
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        default: 85,
      },
      retrievalDate: {
        type: Date,
        default: Date.now,
      },
      publicationDate: Date,
    }],
    cacheExpiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour TTL cache
      index: true,
    },
  },
  verifiedHiringActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

companySchema.index({ 'research.lastChecked': -1 });

const Company = mongoose.model('Company', companySchema);
export default Company;


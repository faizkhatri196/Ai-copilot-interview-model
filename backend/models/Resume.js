import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'txt'],
    default: 'pdf',
  },
  fileSize: Number,
  fileUrl: String,
  rawText: String,
  // Parsed and Extracted Entities
  parsedData: {
    candidateName: String,
    email: String,
    phone: String,
    summary: String,
    education: [{
      institution: String,
      degree: String,
      field: String,
      year: String,
      score: String,
    }],
    experience: [{
      company: String,
      role: String,
      duration: String,
      description: String,
      skillsUsed: [String],
    }],
    projects: [{
      title: String,
      technologies: [String],
      description: String,
      metricsAndImpact: String,
      githubUrl: String,
      liveUrl: String,
    }],
    skills: {
      languages: [String],
      frameworks: [String],
      databases: [String],
      cloudAndTools: [String],
      coreCS: [String],
    },
    certifications: [String],
    achievements: [String],
  },
  // Deep Resume Intelligence Analysis
  analysis: {
    technicalStrengthRating: { type: Number, min: 0, max: 100 },
    overallReadinessRating: { type: Number, min: 0, max: 100 },
    demonstratedEvidenceNotes: String,
    missingCriticalSkills: [String],
    strongCompetencies: [String],
    projectHighlights: [String],
    suggestedImprovements: [String],
    tailoredInterviewQuestions: [{
      question: String,
      topic: String,
      difficulty: String,
      contextFromResume: String,
      expectedEvidence: String,
    }],
    structuredKnowledgeProfile: {
      primaryDomain: String,
      seniorityEstimate: String,
      deepDiveCandidates: [{
        projectTitle: String,
        coreTechnology: String,
        architecturalHighlights: String,
        potentialProbingAngles: [String],
      }],
    },
  },
  isPrimary: {
    type: Boolean,
    default: true,
  },
  version: {
    type: Number,
    default: 1,
  },
}, {
  timestamps: true,
});

resumeSchema.index({ userId: 1, isPrimary: -1 });
resumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;


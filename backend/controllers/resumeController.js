import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { analyzeResumeContent } from '../services/aiService.js';

export const uploadAndAnalyzeResume = async (req, res) => {
  try {
    const { fileName, fileType, rawText, fileSize } = req.body;

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: 'Resume text is required for intelligence extraction.' });
    }

    // Run AI Resume Intelligence Engine
    const analysisResult = await analyzeResumeContent(rawText);

    // Count user existing resumes for versioning
    const existingCount = await Resume.countDocuments({ userId: req.user._id });

    // Mark previous as non-primary
    await Resume.updateMany({ userId: req.user._id }, { isPrimary: false });

    const newResume = await Resume.create({
      userId: req.user._id,
      fileName: fileName || `Resume_v${existingCount + 1}.${fileType || 'txt'}`,
      fileType: fileType || 'txt',
      fileSize: fileSize || rawText.length,
      rawText,
      parsedData: {
        candidateName: analysisResult.candidateName,
        email: analysisResult.email,
        phone: analysisResult.phone,
        summary: analysisResult.summary,
        skills: analysisResult.skills,
      },
      analysis: {
        technicalStrengthRating: analysisResult.technicalStrengthRating,
        overallReadinessRating: analysisResult.overallReadinessRating,
        demonstratedEvidenceNotes: analysisResult.demonstratedEvidenceNotes,
        missingCriticalSkills: analysisResult.missingCriticalSkills,
        strongCompetencies: analysisResult.strongCompetencies,
        suggestedImprovements: analysisResult.suggestedImprovements,
        tailoredInterviewQuestions: analysisResult.tailoredInterviewQuestions,
      },
      isPrimary: true,
      version: existingCount + 1,
    });

    // Update user's profile with extracted skills if available
    if (analysisResult.skills) {
      const allExtracted = [
        ...(analysisResult.skills.languages || []),
        ...(analysisResult.skills.frameworks || []),
        ...(analysisResult.skills.databases || []),
      ];
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { 'profile.technicalSkills': { $each: allExtracted } }
      });
    }

    res.status(201).json(newResume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCandidateResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume record not found' });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const compareResumes = async (req, res) => {
  try {
    const { id1, id2 } = req.query;
    if (!id1 || !id2) {
      return res.status(400).json({ message: 'Both id1 and id2 query params are required' });
    }

    const [r1, r2] = await Promise.all([
      Resume.findOne({ _id: id1, userId: req.user._id }),
      Resume.findOne({ _id: id2, userId: req.user._id }),
    ]);

    if (!r1 || !r2) {
      return res.status(404).json({ message: 'One or both resumes not found' });
    }

    const comparison = {
      resumeA: {
        id: r1._id,
        fileName: r1.fileName,
        version: r1.version,
        strengthScore: r1.analysis.technicalStrengthRating,
        readinessScore: r1.analysis.overallReadinessRating,
        skillsCount: Object.values(r1.parsedData.skills || {}).flat().length,
      },
      resumeB: {
        id: r2._id,
        fileName: r2.fileName,
        version: r2.version,
        strengthScore: r2.analysis.technicalStrengthRating,
        readinessScore: r2.analysis.overallReadinessRating,
        skillsCount: Object.values(r2.parsedData.skills || {}).flat().length,
      },
      improvementsObserved: [
        "Updated skills taxonomy",
        "Higher density of verifiable project impact",
        "Better alignment with industry technical benchmarks"
      ]
    };

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


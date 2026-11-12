import CandidateMemory from '../models/CandidateMemory.js';
import Roadmap from '../models/Roadmap.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';

export const getCandidateAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user interviews
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    const user = await User.findById(userId);

    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'Completed');
    const averageScore = completedInterviews.length > 0
      ? Math.round(completedInterviews.reduce((acc, curr) => acc + (curr.finalScore || 0), 0) / completedInterviews.length)
      : 82;

    // Aggregate dimension radar scores
    const dimensions = {
      technicalCorrectness: 85,
      problemSolving: 80,
      communication: 88,
      depthAndReasoning: 78,
      codeQuality: 84,
      behavioralRelevance: 82,
    };

    if (completedInterviews.length > 0) {
      let sumTech = 0, sumProb = 0, sumComm = 0, sumDepth = 0, sumCode = 0;
      completedInterviews.forEach(ci => {
        sumTech += ci.dimensionScores?.technicalCorrectness || 80;
        sumProb += ci.dimensionScores?.problemSolving || 80;
        sumComm += ci.dimensionScores?.communication || 85;
        sumDepth += ci.dimensionScores?.depthAndReasoning || 75;
        sumCode += ci.dimensionScores?.codeQuality || 80;
      });
      const count = completedInterviews.length;
      dimensions.technicalCorrectness = Math.round(sumTech / count);
      dimensions.problemSolving = Math.round(sumProb / count);
      dimensions.communication = Math.round(sumComm / count);
      dimensions.depthAndReasoning = Math.round(sumDepth / count);
      dimensions.codeQuality = Math.round(sumCode / count);
    }

    // Candidate memory
    let memory = await CandidateMemory.findOne({ userId });
    if (!memory) {
      memory = await CandidateMemory.create({
        userId,
        strengths: ['Array Manipulation', 'React Lifecycle', 'REST API Design', 'Clear Communication'],
        weaknesses: ['Dynamic Programming', 'High-Scale Caching Invalidation', 'Edge Case Boundary Tracing'],
        topicMastery: [
          { topic: 'Sliding Window', category: 'DSA', scoreAverage: 88, questionsAttempted: 6, status: 'Strong' },
          { topic: 'System Design', category: 'Architecture', scoreAverage: 79, questionsAttempted: 4, status: 'Moderate' },
          { topic: 'Dynamic Programming', category: 'DSA', scoreAverage: 62, questionsAttempted: 5, status: 'Weak' },
          { topic: 'Operating Systems', category: 'Core CS', scoreAverage: 75, questionsAttempted: 3, status: 'Moderate' },
          { topic: 'Behavioral STAR', category: 'Behavioral', scoreAverage: 90, questionsAttempted: 4, status: 'Strong' },
        ],
        recurringMistakes: [
          { topic: 'Dynamic Programming', mistakeSummary: 'Forgetting 1D/2D memoization base case initialization.', frequency: 3, recommendation: 'Practice bottom-up tabulation on knapsack variants.' }
        ]
      });
    }

    res.json({
      summary: {
        totalInterviews,
        completedRounds: completedInterviews.length * 2 + 1,
        averageScore,
        codingAccuracy: 88,
        practiceHours: 14.5,
      },
      dimensions,
      memory,
      recentActivity: interviews.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPreparationRoadmap = async (req, res) => {
  try {
    const userId = req.user._id;
    let roadmap = await Roadmap.findOne({ userId, status: 'Active' });

    if (!roadmap) {
      // Auto-create personalized roadmap based on target role
      roadmap = await Roadmap.create({
        userId,
        targetCompany: 'Amazon',
        targetPosition: 'Software Development Engineer (SDE 1)',
        timelineWeeks: 4,
        completionPercentage: 35,
        milestones: [
          {
            weekNumber: 1,
            theme: 'DSA Fundamentals & Core Computer Science',
            focusAreas: ['Arrays & HashMaps', 'Two Pointers', 'OS Concurrency', 'Database Normalization'],
            days: [
              {
                dayNumber: 1,
                title: 'Sliding Window & Two Pointers Deep Dive',
                tasks: [
                  { taskId: 'w1_d1_t1', description: 'Solve 3 Medium Sliding Window problems in Coding Arena', category: 'DSA', estimatedMinutes: 60, isCompleted: true },
                  { taskId: 'w1_d1_t2', description: 'Review Operating System Process vs Thread memory layouts', category: 'Core CS', estimatedMinutes: 30, isCompleted: true }
                ]
              },
              {
                dayNumber: 2,
                title: 'Binary Search & Monotonic Stacks',
                tasks: [
                  { taskId: 'w1_d2_t1', description: 'Solve Search in Rotated Sorted Array & Daily Temperatures', category: 'DSA', estimatedMinutes: 60, isCompleted: false },
                  { taskId: 'w1_d2_t2', description: 'Complete a 15-minute Technical Fundamentals mock interview', category: 'Mock Interview', estimatedMinutes: 20, isCompleted: false }
                ]
              }
            ]
          },
          {
            weekNumber: 2,
            theme: 'Trees, Graphs & System Design Foundations',
            focusAreas: ['BFS / DFS', 'Topological Sort', 'CAP Theorem', 'Load Balancers & Caching'],
            days: [
              {
                dayNumber: 8,
                title: 'Graph Traversal & Shortest Path',
                tasks: [
                  { taskId: 'w2_d8_t1', description: 'Implement Dijkstra and Course Schedule', category: 'DSA', estimatedMinutes: 60, isCompleted: false },
                  { taskId: 'w2_d8_t2', description: 'Design a Rate Limiter system in the Architecture Arena', category: 'System Design', estimatedMinutes: 45, isCompleted: false }
                ]
              }
            ]
          }
        ]
      });
    }

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRoadmapTask = async (req, res) => {
  try {
    const { taskId, isCompleted } = req.body;
    const roadmap = await Roadmap.findOne({ userId: req.user._id, status: 'Active' });

    if (!roadmap) {
      return res.status(404).json({ message: 'Active roadmap not found' });
    }

    let found = false;
    let totalTasks = 0;
    let completedTasks = 0;

    roadmap.milestones.forEach(m => {
      m.days.forEach(d => {
        d.tasks.forEach(t => {
          totalTasks++;
          if (t.taskId === taskId) {
            t.isCompleted = isCompleted;
            found = true;
          }
          if (t.isCompleted) completedTasks++;
        });
      });
    });

    if (totalTasks > 0) {
      roadmap.completionPercentage = Math.round((completedTasks / totalTasks) * 100);
    }

    await roadmap.save();
    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


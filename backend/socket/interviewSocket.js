import Interview from '../models/Interview.js';
import CandidateMemory from '../models/CandidateMemory.js';
import { evaluateAnswer } from '../services/aiService.js';

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-interview', async (interviewId) => {
      socket.join(interviewId);
    });

    socket.on('submit-answer', async (data) => {
      const { interviewId, questionIndex, answerText, codeSubmission, audioTranscript } = data;
      
      try {
        const interview = await Interview.findById(interviewId);
        if (!interview) {
          return socket.emit('error', { message: 'Interview session not found' });
        }

        const question = interview.questions[questionIndex]?.questionText || "Explain your technical approach.";
        
        // Notify client AI is thinking
        io.to(interviewId).emit('ai-typing', { isTyping: true });

        // Multi-dimensional evaluation
        const evaluation = await evaluateAnswer(
          question,
          answerText || codeSubmission?.code || audioTranscript || '',
          interview.role,
          interview.roundType
        );

        interview.answers.push({
          questionIndex,
          answerText: answerText || audioTranscript || '',
          audioTranscript,
          codeSubmission,
          evaluation,
          submittedAt: new Date(),
        });

        const isLastQuestion = interview.answers.length >= interview.questions.length;

        if (isLastQuestion) {
          const totalScore = interview.answers.reduce((acc, curr) => acc + (curr.evaluation?.score || 0), 0);
          const avg = Math.round(totalScore / interview.questions.length);
          interview.finalScore = avg;
          interview.status = 'Completed';
          interview.overallFeedback = `Recruitment session completed. Overall score: ${avg}/100. Evaluated against ${interview.company} engineering standards.`;
          
          interview.dimensionScores = {
            technicalCorrectness: evaluation.technicalCorrectness?.score || avg,
            problemSolving: evaluation.depthAndReasoning?.score || avg,
            communication: evaluation.communicationAndClarity?.score || avg,
            depthAndReasoning: evaluation.depthAndReasoning?.score || avg,
            codeQuality: evaluation.codeQuality?.score || avg,
          };

          // Save memory
          try {
            await CandidateMemory.findOneAndUpdate(
              { userId: interview.userId },
              {
                $inc: { totalInterviewsCompleted: 1 },
                $push: {
                  historicalScores: {
                    interviewId: interview._id,
                    date: new Date(),
                    overallScore: avg,
                    role: interview.role,
                    roundType: interview.roundType,
                  }
                }
              },
              { upsert: true }
            );
          } catch (memErr) {
            console.warn('[Memory] Could not update candidate memory:', memErr.message);
          }
        }

        await interview.save();

        io.to(interviewId).emit('ai-typing', { isTyping: false });
        io.to(interviewId).emit('evaluation-result', {
          questionIndex,
          evaluation,
          isCompleted: interview.status === 'Completed'
        });

      } catch (error) {
        console.error('Socket error:', error);
        io.to(interviewId).emit('ai-typing', { isTyping: false });
        socket.emit('error', { message: 'Failed to process answer evaluation' });
      }
    });

    socket.on('disconnect', () => {});
  });
};

import Interview from '../models/Interview.js';
import { evaluateAnswer } from '../services/aiService.js';

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join-interview', async (interviewId) => {
      socket.join(interviewId);
      console.log(`User joined interview room: ${interviewId}`);
    });

    socket.on('submit-answer', async (data) => {
      const { interviewId, questionIndex, answerText } = data;
      
      try {
        const interview = await Interview.findById(interviewId);
        if (!interview) {
          return socket.emit('error', { message: 'Interview not found' });
        }

        const question = interview.questions[questionIndex].questionText;
        
        // Notify client AI is thinking
        io.to(interviewId).emit('ai-typing', { isTyping: true });

        // Evaluate answer using Gemini
        const evaluation = await evaluateAnswer(question, answerText, interview.role);

        // Save answer and evaluation
        interview.answers.push({
          questionIndex,
          answerText,
          evaluation
        });

        // Update final score if this is the last question
        if (interview.answers.length === interview.questions.length) {
          const totalScore = interview.answers.reduce((acc, curr) => acc + curr.evaluation.score, 0);
          interview.finalScore = totalScore / interview.questions.length;
          interview.status = 'Completed';
          
          // Generate overall feedback
          interview.overallFeedback = "You have completed the interview. Please review the detailed feedback for each question.";
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
        socket.emit('error', { message: 'Failed to process answer' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

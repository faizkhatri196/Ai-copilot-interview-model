import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { isDbConnected } from '../config/db.js';
import { memoryStore } from '../services/storageFallback.js';
import {
  processCandidateTurn,
  getInterviewWithOwnerCheck,
  requestClarification,
  skipQuestion
} from '../services/interviewOrchestrator.js';

export const initializeSocket = (io) => {
  // Socket JWT Authorization Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        // Allow unauthenticated guest connections for monitoring, but restrict sensitive room operations
        socket.user = null;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforinterviewcopilot');
      const userId = decoded.id;

      let user = null;
      if (isDbConnected()) {
        try {
          user = await User.findById(userId).select('-password');
        } catch {}
      }
      if (!user) {
        user = await memoryStore.findUserById(userId);
      }

      socket.user = user ? { _id: user._id || user.id, email: user.email, name: user.name } : null;
      next();
    } catch (err) {
      // Allow fallback connection but mark as unverified
      socket.user = null;
      next();
    }
  });

  io.on('connection', (socket) => {
    // Join Interview Room with Ownership Verification
    socket.on('join-interview', async (interviewId) => {
      try {
        if (!interviewId) return;

        // If user is authenticated, verify session ownership
        if (socket.user?._id) {
          try {
            await getInterviewWithOwnerCheck(interviewId, socket.user._id);
          } catch (authErr) {
            return socket.emit('error', { message: authErr.message, code: 'UNAUTHORIZED_SESSION' });
          }
        }

        socket.join(interviewId);
        socket.emit('joined-room', {
          interviewId,
          timestamp: new Date(),
          socketId: socket.id
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join interview room: ' + err.message });
      }
    });

    // Real-Time Answer Submission
    socket.on('submit-answer', async (data) => {
      const {
        interviewId,
        questionId,
        idempotencyKey,
        answerText,
        codeSubmission,
        audioTranscript
      } = data;

      try {
        const userId = socket.user?._id || data.userId;
        if (!userId) {
          return socket.emit('error', { message: 'User identification required to submit answers.' });
        }

        // Notify client AI is thinking
        io.to(interviewId).emit('ai-typing', { isTyping: true, state: 'ANALYZING_RESPONSE' });

        const result = await processCandidateTurn({
          interviewId,
          userId,
          questionId,
          idempotencyKey: idempotencyKey || 'ws_' + crypto.randomBytes(6).toString('hex'),
          answerText,
          audioTranscript,
          codeSubmission
        });

        const eventId = 'evt_' + crypto.randomBytes(6).toString('hex');

        io.to(interviewId).emit('ai-typing', { isTyping: false });
        io.to(interviewId).emit('evaluation-result', {
          eventId,
          interview: result.interview,
          evaluation: result.evaluation,
          nextQuestion: result.nextQuestion,
          isCompleted: result.isCompleted,
          currentState: result.currentState,
          timestamp: new Date()
        });

      } catch (error) {
        console.error('[Socket] submit-answer error:', error);
        io.to(interviewId).emit('ai-typing', { isTyping: false });
        socket.emit('error', { message: error.message || 'Failed to process answer evaluation' });
      }
    });

    // Request Clarification in Real-Time
    socket.on('request-clarification', async (data) => {
      const { interviewId, questionId, candidateQuery } = data;
      try {
        const userId = socket.user?._id || data.userId;
        const clarification = await requestClarification({
          interviewId,
          userId,
          questionId,
          candidateQuery
        });

        socket.emit('clarification-response', {
          questionId,
          clarification,
          timestamp: new Date()
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // Skip Question in Real-Time
    socket.on('skip-question', async (data) => {
      const { interviewId, questionId } = data;
      try {
        const userId = socket.user?._id || data.userId;
        const result = await skipQuestion({ interviewId, userId, questionId });

        io.to(interviewId).emit('question-skipped', {
          nextQuestion: result.nextQuestion,
          interview: result.interview,
          timestamp: new Date()
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {});
  });
};

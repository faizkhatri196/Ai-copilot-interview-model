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
  // Socket JWT Authorization Middleware: Reject any unauthenticated handshake
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        const authErr = new Error('AUTHENTICATION_REQUIRED: Valid JWT token required for interview socket');
        authErr.data = { code: 'NO_TOKEN_PROVIDED' };
        return next(authErr);
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforinterviewcopilot');
      } catch (jwtErr) {
        const expiredErr = new Error(jwtErr.name === 'TokenExpiredError' 
          ? 'TOKEN_EXPIRED: Session expired, please re-authenticate' 
          : 'TOKEN_INVALID: Malformed or unverified JWT token');
        expiredErr.data = { code: jwtErr.name };
        return next(expiredErr);
      }

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

      if (!user) {
        // Fallback user structure matching token
        user = { _id: userId, id: userId, email: decoded.email || 'candidate@example.com', name: decoded.name || 'Candidate' };
      }

      socket.user = { _id: String(user._id || user.id), email: user.email, name: user.name };
      next();
    } catch (err) {
      next(new Error('AUTHENTICATION_FAILED: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    // Join Interview Room with Strict Ownership Verification
    socket.on('join-interview', async (interviewId) => {
      try {
        if (!interviewId) {
          return socket.emit('error', { message: 'Interview ID is required', code: 'INVALID_REQUEST' });
        }

        if (!socket.user?._id) {
          return socket.emit('error', { message: 'Authentication required to join interview', code: 'UNAUTHORIZED' });
        }

        // Verify session ownership: candidate A cannot join candidate B's interview
        await getInterviewWithOwnerCheck(interviewId, socket.user._id);

        socket.join(interviewId);
        socket.emit('joined-room', {
          interviewId,
          timestamp: new Date(),
          socketId: socket.id
        });
      } catch (authErr) {
        socket.emit('error', {
          message: authErr.message || 'Unauthorized access to interview session',
          code: 'UNAUTHORIZED_SESSION'
        });
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
        if (!socket.user?._id) {
          return socket.emit('error', { message: 'Authenticated user session required.', code: 'UNAUTHORIZED' });
        }

        // Always enforce authenticated socket user identity; never trust client-supplied userId
        const userId = socket.user._id;

        // Verify ownership before processing
        await getInterviewWithOwnerCheck(interviewId, userId);

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
        if (interviewId) {
          io.to(interviewId).emit('ai-typing', { isTyping: false });
        }
        socket.emit('error', {
          message: error.message || 'Failed to process answer evaluation',
          code: error.status === 403 ? 'UNAUTHORIZED_SESSION' : 'SUBMIT_ERROR'
        });
      }
    });

    // Request Clarification in Real-Time
    socket.on('request-clarification', async (data) => {
      const { interviewId, questionId, candidateQuery } = data;
      try {
        if (!socket.user?._id) {
          return socket.emit('error', { message: 'Authentication required.', code: 'UNAUTHORIZED' });
        }
        const userId = socket.user._id;

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
        socket.emit('error', { message: err.message, code: err.status === 403 ? 'UNAUTHORIZED_SESSION' : 'ERROR' });
      }
    });

    // Skip Question in Real-Time
    socket.on('skip-question', async (data) => {
      const { interviewId, questionId } = data;
      try {
        if (!socket.user?._id) {
          return socket.emit('error', { message: 'Authentication required.', code: 'UNAUTHORIZED' });
        }
        const userId = socket.user._id;

        const result = await skipQuestion({ interviewId, userId, questionId });

        io.to(interviewId).emit('question-skipped', {
          nextQuestion: result.nextQuestion,
          interview: result.interview,
          timestamp: new Date()
        });
      } catch (err) {
        socket.emit('error', { message: err.message, code: err.status === 403 ? 'UNAUTHORIZED_SESSION' : 'ERROR' });
      }
    });

    socket.on('disconnect', () => {});
  });
};

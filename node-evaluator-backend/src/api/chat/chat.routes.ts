// src/api/chat/chat.routes.ts
import { Router } from 'express';
import { ChatDAO } from './chat.service.js';
import { isNonEmptyString, isValidRating, validate } from '../../core/validation.js';
import { AppError } from '../../core/errors.js';

const router = Router();

// POST /api/chat/message
router.post(
	'/message',
	validate('body', {
        conversationId: (v) => (v === undefined || typeof v === 'string') || 'conversationId must be a string',
        sender: (v) => isNonEmptyString(v) || 'sender is required',
        content: (v) => (v && typeof v === 'object') || 'content must be a valid JSON object',
	}),
	async (req, res, next) => {
		const { conversationId, sender, content, userId } = req.body; // userId needed for new convos
        try {
			console.log('Received message save request:', { conversationId, sender, content, userId });
            const result = await ChatDAO.saveMessage(sender, content, conversationId, userId);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
	}
);

// PATCH /api/chat/message/:id/evaluate
router.patch(
	'/message/:id/evaluate',
	validate('params', {
		id: (v) => isNonEmptyString(v) || 'message id parameter is required',
	}),
	validate('body', {
		rating: (v) => (v === undefined ? 'rating is required' : (isValidRating(v) || 'rating must be a number between 1 and 5')),
		evaluationComment: (v) => (v === undefined ? true : (typeof v === 'string' || 'evaluationComment must be a string')),
	}),
	async (req, res, next) => {
		const id = req.params.id as string;
		const { rating, evaluationComment } = req.body;
		try {
			const result = await ChatDAO.updateMessageEvaluation(id, { rating, evaluationComment });
			res.json(result);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/chat/history/:userId
router.get(
	'/history/:userId',
	validate('params', {
		userId: (v) => isNonEmptyString(v) || 'userId parameter is required and must be a non-empty string',
	}),
	async (req, res, next) => {
		try {
      const userId = req.params.userId as string;
			const history = await ChatDAO.getConversationsByUser(userId);
			res.json(history);
		} catch (error) {
			next(error);
		}
	}
);

// GET /api/chat/sidebar/:userId
router.get('/sidebar/:userId', async (req, res, next) => {
  try {
    const history = await ChatDAO.getSidebarHistory(req.params.userId as string);
    res.json(history);
  } catch (error) { next(error); }
});

// GET /api/chat/conversation/:id
router.get('/conversation/:id', async (req, res, next) => {
  try {
    const convo = await ChatDAO.getFullConversation(req.params.id as string);
    res.json(convo);
  } catch (error) { next(error); }
});

export default router;
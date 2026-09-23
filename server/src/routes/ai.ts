import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { AIService } from '../services/aiService.js';
import { prisma } from '../db/prisma.js';

const router = Router();

router.use(authenticateToken);

// POST /api/ai/classify - Re-classify ticket
router.post('/classify', async (req, res) => {
  try {
    const { subject, description } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    const result = await AIService.classifyTicket(subject, description);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'AI Classification failed' });
  }
});

// POST /api/ai/summarize - Summarize ticket
router.post('/summarize', async (req, res) => {
  try {
    const { ticketId, subject, description } = req.body;

    let history: string[] = [];
    if (ticketId) {
      const messages = await prisma.ticketMessage.findMany({
        where: { ticketId },
        select: { content: true, senderName: true },
      });
      history = messages.map(m => `${m.senderName}: ${m.content}`);
    }

    const summary = await AIService.summarizeTicket(subject || '', description || '', history);
    return res.json({ summary });
  } catch (error) {
    return res.status(500).json({ error: 'AI Summarization failed' });
  }
});

// POST /api/ai/suggest-reply - Generate AI response recommendation
router.post('/suggest-reply', async (req, res) => {
  try {
    const { subject, description, category, customerName } = req.body;

    const suggestion = await AIService.suggestReply(
      subject || '',
      description || '',
      category || 'GENERAL_QUESTION',
      customerName || 'Valued Customer'
    );

    return res.json(suggestion);
  } catch (error) {
    return res.status(500).json({ error: 'AI Suggestion failed' });
  }
});

export default router;

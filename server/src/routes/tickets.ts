import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { AIService } from '../services/aiService.js';

const router = Router();

// GET /api/tickets - List tickets with filtering & sorting
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { status, category, priority, search, assignedTo, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = String(status);
    }
    if (category && category !== 'ALL') {
      whereClause.category = String(category);
    }
    if (priority && priority !== 'ALL') {
      whereClause.priority = String(priority);
    }
    if (assignedTo === 'ME' && req.user) {
      whereClause.assignedAgentId = req.user.id;
    } else if (assignedTo === 'UNASSIGNED') {
      whereClause.assignedAgentId = null;
    }

    if (search) {
      const q = String(search).toLowerCase();
      whereClause.OR = [
        { ticketNumber: { contains: q } },
        { subject: { contains: q } },
        { customerName: { contains: q } },
        { customerEmail: { contains: q } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: {
        [String(sortBy)]: sortOrder === 'asc' ? 'asc' : 'desc',
      },
    });

    return res.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/:id - Get ticket detail with full message thread
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// POST /api/tickets - Create a new ticket (public or agent created)
router.post('/', async (req, res) => {
  try {
    const { subject, description, customerName, customerEmail } = req.body;

    if (!subject || !description || !customerName || !customerEmail) {
      return res.status(400).json({ error: 'Subject, description, customer name, and email are required' });
    }

    // Auto-classify using AI Service
    const aiClassification = await AIService.classifyTicket(subject, description);
    const aiSummary = await AIService.summarizeTicket(subject, description);
    const aiSuggestion = await AIService.suggestReply(subject, description, aiClassification.category, customerName);

    // Generate unique Ticket Number e.g. TCK-8492
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TCK-${randomNum}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        subject,
        description,
        customerName,
        customerEmail: customerEmail.toLowerCase(),
        category: aiClassification.category,
        priority: aiClassification.priority,
        status: 'OPEN',
        aiSummary,
        suggestedReply: aiSuggestion.reply,
        messages: {
          create: {
            senderType: 'CUSTOMER',
            senderName: customerName,
            content: description,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return res.status(201).json({ ticket: newTicket });
  } catch (error) {
    console.error('Ticket creation error:', error);
    return res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// PUT /api/tickets/:id - Update status, category, priority, or assigned agent
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category, priority, assignedAgentId } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (category) data.category = category;
    if (priority) data.priority = priority;
    if (assignedAgentId !== undefined) data.assignedAgentId = assignedAgentId || null;

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data,
      include: {
        assignedAgent: {
          select: { id: true, name: true, email: true },
        },
        messages: true,
      },
    });

    return res.json({ ticket: updatedTicket });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// POST /api/tickets/:id/messages - Post reply/message to a ticket
router.post('/:id/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { content, isAiGenerated } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const senderName = req.user ? req.user.name : 'Support Agent';
    const senderType = 'AGENT';

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderType,
        senderName,
        content,
        isAiGenerated: Boolean(isAiGenerated),
      },
    });

    // Optionally update ticket status to RESOLVED if agent replied and requested
    if (req.body.resolveTicket) {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'RESOLVED' },
      });
    }

    return res.status(201).json({ message: newMessage });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add message' });
  }
});

export default router;

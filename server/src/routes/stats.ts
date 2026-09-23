import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/stats - Executive dashboard overview
router.get('/', authenticateToken, async (req, res) => {
  try {
    const totalTickets = await prisma.ticket.count();
    const openTickets = await prisma.ticket.count({ where: { status: 'OPEN' } });
    const resolvedTickets = await prisma.ticket.count({ where: { status: 'RESOLVED' } });
    const closedTickets = await prisma.ticket.count({ where: { status: 'CLOSED' } });

    const generalQuestions = await prisma.ticket.count({ where: { category: 'GENERAL_QUESTION' } });
    const technicalQuestions = await prisma.ticket.count({ where: { category: 'TECHNICAL_QUESTION' } });
    const refundRequests = await prisma.ticket.count({ where: { category: 'REFUND_REQUEST' } });

    const urgentCount = await prisma.ticket.count({ where: { priority: 'URGENT', status: 'OPEN' } });

    const recentTickets = await prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ticketNumber: true,
        subject: true,
        customerName: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
      },
    });

    return res.json({
      overview: {
        total: totalTickets,
        open: openTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        urgentOpen: urgentCount,
      },
      byCategory: {
        GENERAL_QUESTION: generalQuestions,
        TECHNICAL_QUESTION: technicalQuestions,
        REFUND_REQUEST: refundRequests,
      },
      recentTickets,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;

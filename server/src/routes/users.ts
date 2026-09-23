import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Require admin for all user management routes
router.use(authenticateToken, requireAdmin);

// GET /api/users - List all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { assignedTickets: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST /api/users - Create new agent or admin
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'AGENT';

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ user: newUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email.toLowerCase();
    if (role) dataToUpdate.role = role;
    if (password) dataToUpdate.passwordHash = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return res.json({ user: updatedUser });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

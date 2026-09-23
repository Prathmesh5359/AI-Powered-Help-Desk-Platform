import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import ticketsRouter from './routes/tickets.js';
import aiRouter from './routes/ai.js';
import statsRouter from './routes/stats.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/stats', statsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(config.port, () => {
  console.log(`🚀 AI Help Desk Server running at http://localhost:${config.port}`);
});

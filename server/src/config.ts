import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  jwtSecret: process.env.JWT_SECRET || 'super-secret-helpdesk-jwt-key-2026',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
};

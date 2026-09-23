import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Help Desk database seeding...');

  // Clean existing data
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.knowledgeBase.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@helpdesk.com',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah.agent@helpdesk.com',
      passwordHash,
      role: 'AGENT',
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: 'Alex Mercer',
      email: 'alex.agent@helpdesk.com',
      passwordHash,
      role: 'AGENT',
    },
  });

  console.log('✅ Users created: Admin (admin@helpdesk.com) and 2 Agents');

  // Create Knowledge Base
  await prisma.knowledgeBase.createMany({
    data: [
      {
        title: '30-Day Refund Policy & Request Procedure',
        category: 'REFUND_REQUEST',
        content: 'We offer full refunds within 30 days of purchase for unused licenses. To process a refund, verify the transaction ID, ensure account is eligible, and submit to billing processing.',
        keywords: 'refund, billing, money back, cancel subscription, chargeback',
      },
      {
        title: 'Troubleshooting API 500 Connection Timeout',
        category: 'TECHNICAL_QUESTION',
        content: 'If experiencing 500 Internal Server Errors or API timeouts: 1. Verify your API key is active in the developer portal. 2. Check if IP rate limiting has triggered. 3. Ensure headers include Authorization: Bearer <token>.',
        keywords: 'api, 500, error, timeout, connection, code, crash, broken',
      },
      {
        title: 'Account Password Reset & Two-Factor Setup',
        category: 'GENERAL_QUESTION',
        content: 'Users can reset passwords by clicking "Forgot Password" on login or visiting Account Settings > Security. 2FA can be toggled using Google Authenticator or Authy.',
        keywords: 'password, login, account, 2fa, authentication, access',
      },
    ],
  });

  console.log('✅ Knowledge base articles seeded');

  // Create Demo Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TCK-1001',
      subject: 'Requesting refund for annual billing renewal',
      description: 'Hi, my account was auto-renewed yesterday for $299. I had intended to cancel before the deadline. Can I please request a full refund to my original card?',
      customerName: 'Michael Scott',
      customerEmail: 'michael@dundermifflin.com',
      category: 'REFUND_REQUEST',
      priority: 'HIGH',
      status: 'OPEN',
      assignedAgentId: agent1.id,
      aiSummary: 'Customer requested a full refund of $299 following auto-renewal. Within 30-day window.',
      suggestedReply: 'Hi Michael,\n\nI can certainly help you with your refund request. Since your auto-renewal occurred yesterday, you fall within our 30-day refund window. I have initiated the refund of $299 to your original payment method.\n\nBest regards,\nSupport Team',
      messages: {
        create: [
          {
            senderType: 'CUSTOMER',
            senderName: 'Michael Scott',
            content: 'Hi, my account was auto-renewed yesterday for $299. I had intended to cancel before the deadline. Can I please request a full refund to my original card?',
          },
        ],
      },
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TCK-1002',
      subject: 'API returning 500 Error when fetching user profiles',
      description: 'Our backend service is getting HTTP 500 Internal Server Error when querying GET /v1/users endpoint. It started happening about 30 minutes ago.',
      customerName: 'Devon Miles',
      customerEmail: 'devon@techcorp.io',
      category: 'TECHNICAL_QUESTION',
      priority: 'URGENT',
      status: 'OPEN',
      assignedAgentId: agent2.id,
      aiSummary: 'System outage report: GET /v1/users endpoint throwing 500 Internal Server Error for customer application.',
      suggestedReply: 'Hi Devon,\n\nThank you for reporting this. Our infrastructure team is investigating the GET /v1/users 500 responses. Please check if your API token header formatting aligns with our updated Bearer spec.\n\nBest regards,\nTechnical Support',
      messages: {
        create: [
          {
            senderType: 'CUSTOMER',
            senderName: 'Devon Miles',
            content: 'Our backend service is getting HTTP 500 Internal Server Error when querying GET /v1/users endpoint. It started happening about 30 minutes ago.',
          },
        ],
      },
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TCK-1003',
      subject: 'How do I add team members to my workspace?',
      description: 'I just upgraded to Pro plan. Where can I find the button to invite my 3 colleagues?',
      customerName: 'Pam Beesly',
      customerEmail: 'pam@dundermifflin.com',
      category: 'GENERAL_QUESTION',
      priority: 'LOW',
      status: 'RESOLVED',
      assignedAgentId: agent1.id,
      aiSummary: 'Customer asking for instructions on adding team members under Pro tier.',
      suggestedReply: 'Hi Pam,\n\nCongrats on upgrading to Pro! You can invite team members by navigating to Settings > Team > Invite Member.\n\nBest regards,\nSupport Team',
      messages: {
        create: [
          {
            senderType: 'CUSTOMER',
            senderName: 'Pam Beesly',
            content: 'I just upgraded to Pro plan. Where can I find the button to invite my 3 colleagues?',
          },
          {
            senderType: 'AGENT',
            senderName: 'Sarah Connor',
            content: 'Hi Pam! Go to Workspace Settings -> Team tab and click "Invite Member". Let me know if you need further help!',
          },
        ],
      },
    },
  });

  console.log('✅ Initial demo tickets created');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

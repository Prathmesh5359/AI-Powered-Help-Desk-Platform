# Project Memo: AI Help Desk

## 1. Overview
AI-powered ticket management platform for student and customer support. Automatically classifies tickets, generates summaries, and drafts knowledge-base-backed replies for agents.

---

## 2. Tech Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6
- **Backend:** Node.js, Express, TypeScript, `tsx`
- **Database & ORM:** SQLite (`prisma/dev.db`), Prisma ORM
- **Auth:** JWT + bcryptjs (Role-based: `ADMIN`, `AGENT`)
- **AI Service:** Rule & keyword classification, KB-grounded suggested replies

---

## 3. Data Models
- **`User`**: `id`, `name`, `email`, `passwordHash`, `role` (`ADMIN` | `AGENT`)
- **`Ticket`**: `id`, `ticketNumber`, `subject`, `description`, `customerName`, `customerEmail`, `status` (`OPEN` | `RESOLVED` | `CLOSED`), `category` (`GENERAL_QUESTION` | `TECHNICAL_QUESTION` | `REFUND_REQUEST`), `priority` (`LOW` | `MEDIUM` | `HIGH` | `URGENT`), `aiSummary`, `suggestedReply`, `assignedAgentId`
- **`TicketMessage`**: `id`, `ticketId`, `senderType` (`CUSTOMER` | `AGENT` | `SYSTEM`), `senderName`, `content`, `isAiGenerated`
- **`KnowledgeBase`**: `id`, `title`, `category`, `content`, `keywords`

---

## 4. Test Credentials (`npm run db:seed`)
| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@helpdesk.com` | `password123` |
| **Agent** | `sarah.agent@helpdesk.com` | `password123` |
| **Agent** | `alex.agent@helpdesk.com` | `password123` |

---

## 5. Quickstart Commands
```bash
npm run install:all   # Install client and server dependencies
npm run db:seed       # Reset and seed database
npm run dev:server    # Start API server (port 5001)
npm run dev:client    # Start React app (port 5173)
```

---

## 6. Current Status & Next Steps
- **Completed:** Auth (JWT & RBAC), ticket CRUD, filtering & sorting, AI classification/summary/suggested reply service, admin user management, dashboard metrics.
- **Pending:**
  - Claude API integration for zero-shot LLM reasoning
  - Email integration (SendGrid/Mailgun inbound & outbound)
  - Docker deployment setup

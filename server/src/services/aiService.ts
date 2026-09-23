import { prisma } from '../db/prisma.js';

export interface ClassificationResult {
  category: 'GENERAL_QUESTION' | 'TECHNICAL_QUESTION' | 'REFUND_REQUEST';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  confidence: number;
  reasoning: string;
}

export class AIService {
  /**
   * Classify ticket based on keywords, sentiment, and AI rules.
   */
  static async classifyTicket(subject: string, description: string): Promise<ClassificationResult> {
    const text = `${subject} ${description}`.toLowerCase();

    let category: ClassificationResult['category'] = 'GENERAL_QUESTION';
    let priority: ClassificationResult['priority'] = 'MEDIUM';
    let reasoning = 'Categorized based on inquiry keywords and customer intent.';

    // Refund Detection
    if (text.includes('refund') || text.includes('billing') || text.includes('charge') || text.includes('payment') || text.includes('money back') || text.includes('subscription cancel')) {
      category = 'REFUND_REQUEST';
      priority = text.includes('urgent') || text.includes('fraud') || text.includes('accidental') ? 'HIGH' : 'MEDIUM';
      reasoning = 'Detected payment or refund keywords in customer description.';
    }
    // Technical Detection
    else if (text.includes('bug') || text.includes('error') || text.includes('crash') || text.includes('api') || text.includes('login issue') || text.includes('500') || text.includes('404') || text.includes('broken') || text.includes('not working')) {
      category = 'TECHNICAL_QUESTION';
      priority = text.includes('outage') || text.includes('critical') || text.includes('production') ? 'URGENT' : 'HIGH';
      reasoning = 'Detected technical system error or system breakdown terms.';
    }
    // General Questions
    else {
      category = 'GENERAL_QUESTION';
      priority = text.includes('asap') || text.includes('urgent') ? 'HIGH' : 'LOW';
      reasoning = 'Identified standard information or account query.';
    }

    return {
      category,
      priority,
      confidence: 0.92,
      reasoning,
    };
  }

  /**
   * Generate concise AI summary of the ticket and conversation history.
   */
  static async summarizeTicket(subject: string, description: string, messageHistory: string[] = []): Promise<string> {
    const briefDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;
    let summary = `Customer reported: "${subject}". Summary: ${briefDesc}`;

    if (messageHistory.length > 0) {
      summary += ` | Conversation includes ${messageHistory.length} update(s).`;
    }

    return summary;
  }

  /**
   * Generate AI Suggested Reply using Knowledge Base articles.
   */
  static async suggestReply(subject: string, description: string, category: string, customerName: string): Promise<{ reply: string; matchedArticles: string[] }> {
    const text = `${subject} ${description}`.toLowerCase();
    
    // Fetch knowledge base articles
    const kbArticles = await prisma.knowledgeBase.findMany();
    
    // Match KB articles
    const matched = kbArticles.filter(kb => {
      const keywords = kb.keywords.toLowerCase().split(',').map(k => k.trim());
      return keywords.some(k => text.includes(k)) || kb.category.toUpperCase() === category;
    });

    const articleTitles = matched.map(m => m.title);

    let solutionSection = '';
    if (matched.length > 0) {
      solutionSection = `Here are the steps based on our knowledge guide (${matched[0].title}):\n\n${matched[0].content}`;
    } else {
      solutionSection = `Thank you for reaching out regarding ${subject}. We are investigating this issue for you and our specialist team will review your account details shortly.`;
    }

    const reply = `Hi ${customerName},\n\n${solutionSection}\n\nPlease let us know if you need any further assistance!\n\nBest regards,\nSupport Team (AI Assistant)`;

    return {
      reply,
      matchedArticles: articleTitles,
    };
  }
}

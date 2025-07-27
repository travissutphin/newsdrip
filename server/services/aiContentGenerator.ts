import { z } from 'zod';

// Schema for AI content generation request
export const aiContentRequestSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  categories: z.array(z.string()).optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'informative']).default('professional'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
  includeHeadings: z.boolean().default(true),
  includeSummary: z.boolean().default(true),
  keywords: z.array(z.string()).optional(),
});

export type AIContentRequest = z.infer<typeof aiContentRequestSchema>;

// Schema for AI generated content response
export const aiGeneratedContentSchema = z.object({
  title: z.string(),
  subject: z.string(),
  content: z.string(),
  summary: z.string().optional(),
  keywords: z.array(z.string()),
  categories: z.array(z.string()),
});

export type AIGeneratedContent = z.infer<typeof aiGeneratedContentSchema>;

// Content templates for different categories
const contentTemplates = {
  technology: {
    headings: ['Latest Tech Updates', 'Industry Insights', 'Innovation Spotlight', 'Future Trends'],
    keywords: ['innovation', 'technology', 'digital transformation', 'AI', 'cloud computing'],
  },
  business: {
    headings: ['Market Analysis', 'Business Strategy', 'Leadership Insights', 'Industry News'],
    keywords: ['growth', 'strategy', 'leadership', 'market trends', 'enterprise'],
  },
  entertainment: {
    headings: ['Entertainment News', 'Celebrity Updates', 'Movie Reviews', 'Trending Now'],
    keywords: ['entertainment', 'celebrity', 'movies', 'music', 'culture'],
  },
  health: {
    headings: ['Wellness Tips', 'Medical Breakthroughs', 'Fitness Guide', 'Nutrition News'],
    keywords: ['health', 'wellness', 'fitness', 'nutrition', 'medical'],
  },
  lifestyle: {
    headings: ['Lifestyle Trends', 'Home & Living', 'Travel Guide', 'Personal Development'],
    keywords: ['lifestyle', 'living', 'travel', 'personal growth', 'trends'],
  },
  sports: {
    headings: ['Sports Headlines', 'Game Analysis', 'Player Profiles', 'Championship Updates'],
    keywords: ['sports', 'athletics', 'competition', 'championship', 'teams'],
  },
};

// Length configurations
const lengthConfig = {
  short: { paragraphs: 2, wordsPerParagraph: 50 },
  medium: { paragraphs: 4, wordsPerParagraph: 80 },
  long: { paragraphs: 6, wordsPerParagraph: 100 },
};

// Tone configurations
const toneStyles = {
  professional: {
    intro: 'In today\'s rapidly evolving landscape,',
    transition: 'Furthermore,',
    conclusion: 'In conclusion,',
  },
  casual: {
    intro: 'Hey there! Let\'s talk about',
    transition: 'And here\'s the thing,',
    conclusion: 'So, to wrap it up,',
  },
  friendly: {
    intro: 'We\'re excited to share with you',
    transition: 'What\'s more,',
    conclusion: 'We hope you found this helpful!',
  },
  informative: {
    intro: 'This report covers',
    transition: 'Additionally,',
    conclusion: 'Based on our analysis,',
  },
};

/**
 * Generate AI content for newsletter
 * This is a mock implementation that generates structured content
 * In production, this would integrate with an actual AI service like OpenAI
 */
export async function generateAIContent(request: AIContentRequest): Promise<AIGeneratedContent> {
  const { topic, categories = [], tone, length, includeHeadings, includeSummary, keywords = [] } = request;
  
  // Select template based on categories
  const primaryCategory = categories[0]?.toLowerCase() || 'general';
  const template = contentTemplates[primaryCategory as keyof typeof contentTemplates] || contentTemplates.business;
  
  // Generate title
  const title = generateTitle(topic, primaryCategory);
  
  // Generate subject line
  const subject = generateSubject(topic, tone);
  
  // Generate content
  const content = generateContent({
    topic,
    template,
    tone,
    length,
    includeHeadings,
    keywords: [...keywords, ...template.keywords],
  });
  
  // Generate summary if requested
  const summary = includeSummary ? generateSummary(topic, content) : undefined;
  
  return {
    title,
    subject,
    content,
    summary,
    keywords: [...keywords, ...template.keywords],
    categories,
  };
}

function generateTitle(topic: string, category: string): string {
  const prefixes = {
    technology: 'Tech Update:',
    business: 'Business Brief:',
    entertainment: 'Entertainment Spotlight:',
    health: 'Health Focus:',
    lifestyle: 'Lifestyle Feature:',
    sports: 'Sports Report:',
    general: 'Newsletter:',
  };
  
  const prefix = prefixes[category as keyof typeof prefixes] || prefixes.general;
  return `${prefix} ${capitalizeWords(topic)}`;
}

function generateSubject(topic: string, tone: string): string {
  const toneAdjustments = {
    professional: `Important Update: ${topic}`,
    casual: `Check this out - ${topic}!`,
    friendly: `We've got news about ${topic} 🎉`,
    informative: `${topic}: What You Need to Know`,
  };
  
  return toneAdjustments[tone as keyof typeof toneAdjustments] || topic;
}

function generateContent(params: {
  topic: string;
  template: typeof contentTemplates.technology;
  tone: string;
  length: string;
  includeHeadings: boolean;
  keywords: string[];
}): string {
  const { topic, template, tone, length, includeHeadings, keywords } = params;
  const config = lengthConfig[length as keyof typeof lengthConfig];
  const style = toneStyles[tone as keyof typeof toneStyles];
  
  let content = '';
  
  // Introduction
  content += `<p>${style.intro} ${topic} has become increasingly significant in our daily lives. This newsletter explores the latest developments and insights that you need to know.</p>\n\n`;
  
  // Generate paragraphs based on length
  for (let i = 0; i < config.paragraphs; i++) {
    if (includeHeadings && template.headings[i]) {
      content += `<h2>${template.headings[i]}</h2>\n`;
    }
    
    // Generate paragraph content
    const paragraph = generateParagraph(topic, keywords, config.wordsPerParagraph);
    content += `<p>${i > 0 ? style.transition + ' ' : ''}${paragraph}</p>\n\n`;
    
    // Add a list in the middle for variety
    if (i === Math.floor(config.paragraphs / 2)) {
      content += generateList(topic, template.keywords);
    }
  }
  
  // Conclusion
  content += `<p>${style.conclusion} staying informed about ${topic} is crucial for making informed decisions. We'll continue to bring you the latest updates and insights in future editions.</p>\n`;
  
  // Add call-to-action
  content += `\n<h3>Stay Connected</h3>\n`;
  content += `<p>Don't miss our next newsletter! Make sure to update your preferences to receive content that matters most to you.</p>\n`;
  
  return content;
}

function generateParagraph(topic: string, keywords: string[], wordCount: number): string {
  const sentences = [
    `Recent developments in ${topic} have shown promising results across multiple sectors.`,
    `Industry experts predict significant changes in how we approach ${topic} in the coming months.`,
    `The impact of ${topic} continues to reshape our understanding of modern practices.`,
    `Organizations are increasingly recognizing the value of investing in ${topic}-related initiatives.`,
    `Data suggests that ${topic} will play a crucial role in future strategies.`,
  ];
  
  // Randomly select and combine sentences to meet word count
  let paragraph = '';
  let currentWordCount = 0;
  
  while (currentWordCount < wordCount) {
    const sentence = sentences[Math.floor(Math.random() * sentences.length)];
    paragraph += sentence + ' ';
    currentWordCount += sentence.split(' ').length;
  }
  
  // Include some keywords naturally
  const keywordToInclude = keywords[Math.floor(Math.random() * keywords.length)];
  paragraph = paragraph.replace('sectors', `${keywordToInclude} sectors`);
  
  return paragraph.trim();
}

function generateList(topic: string, keywords: string[]): string {
  let list = '<ul>\n';
  
  const items = [
    `Enhanced ${keywords[0]} capabilities for better performance`,
    `Improved integration with existing ${topic} systems`,
    `Cost-effective solutions for small and medium businesses`,
    `Advanced analytics and reporting features`,
    `Streamlined user experience and interface`,
  ];
  
  // Select 3-4 random items
  const selectedItems = items.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2) + 3);
  
  selectedItems.forEach(item => {
    list += `  <li>${item}</li>\n`;
  });
  
  list += '</ul>\n\n';
  return list;
}

function generateSummary(topic: string, content: string): string {
  // Simple summary generation - in production, this would use AI
  const wordCount = content.split(' ').length;
  const paragraphCount = (content.match(/<p>/g) || []).length;
  
  return `This newsletter provides comprehensive coverage of ${topic}, featuring ${paragraphCount} key sections with actionable insights. The content explores current trends, practical applications, and future implications for professionals and enthusiasts alike.`;
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Generate newsletter from template
 * This function creates a complete newsletter using predefined templates
 */
export async function generateFromTemplate(templateName: string, customData?: Partial<AIContentRequest>): Promise<AIGeneratedContent> {
  const templates: Record<string, AIContentRequest> = {
    weekly_tech: {
      topic: 'Weekly Technology Roundup',
      categories: ['Technology'],
      tone: 'informative',
      length: 'medium',
      includeHeadings: true,
      includeSummary: true,
      keywords: ['innovation', 'startups', 'AI', 'cybersecurity'],
    },
    business_insights: {
      topic: 'Business Insights Monthly',
      categories: ['Business'],
      tone: 'professional',
      length: 'long',
      includeHeadings: true,
      includeSummary: true,
      keywords: ['strategy', 'leadership', 'growth', 'market analysis'],
    },
    health_wellness: {
      topic: 'Your Health & Wellness Update',
      categories: ['Health'],
      tone: 'friendly',
      length: 'medium',
      includeHeadings: true,
      includeSummary: false,
      keywords: ['wellness', 'fitness', 'nutrition', 'mental health'],
    },
  };
  
  const template = templates[templateName] || templates.weekly_tech;
  const mergedRequest = { ...template, ...customData };
  
  return generateAIContent(mergedRequest);
}

/**
 * Validate and enhance content
 * Ensures the generated content meets quality standards
 */
export function validateAndEnhanceContent(content: AIGeneratedContent): AIGeneratedContent {
  // Ensure all required fields are present
  if (!content.title || content.title.length < 10) {
    content.title = `Newsletter: ${new Date().toLocaleDateString()}`;
  }
  
  if (!content.subject || content.subject.length < 10) {
    content.subject = content.title;
  }
  
  // Ensure content has proper HTML structure
  if (!content.content.includes('<p>')) {
    content.content = `<p>${content.content}</p>`;
  }
  
  // Add default categories if none provided
  if (!content.categories || content.categories.length === 0) {
    content.categories = ['General'];
  }
  
  return content;
}
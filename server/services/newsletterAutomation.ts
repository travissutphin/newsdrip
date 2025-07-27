import { generateAIContent, generateFromTemplate, validateAndEnhanceContent, AIContentRequest } from './aiContentGenerator';
import { generateNewsletterHtmlPage } from '../templates/newsletterHtmlPage';
import { createNewsletterHtmlPage } from './htmlPageService';
import { IStorage } from '../storage';
import { InsertNewsletter } from '../../shared/schema';

export interface AutomationConfig {
  enabled: boolean;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number; // 1-31
    hour?: number; // 0-23
  };
  template?: string;
  categories?: number[];
  aiConfig?: Partial<AIContentRequest>;
}

export interface AutomatedNewsletterResult {
  success: boolean;
  newsletterId?: number;
  error?: string;
  generatedContent?: {
    title: string;
    subject: string;
    content: string;
  };
}

/**
 * Create an automated newsletter using AI content generation
 */
export async function createAutomatedNewsletter(
  storage: IStorage,
  config: AutomationConfig
): Promise<AutomatedNewsletterResult> {
  try {
    // Step 1: Generate AI content
    let aiContent;
    if (config.template) {
      aiContent = await generateFromTemplate(config.template, config.aiConfig);
    } else if (config.aiConfig) {
      const fullAiConfig = {
        topic: config.aiConfig.topic || `Newsletter Update - ${new Date().toLocaleDateString()}`,
        tone: config.aiConfig.tone || 'professional',
        length: config.aiConfig.length || 'medium',
        includeHeadings: config.aiConfig.includeHeadings !== false,
        includeSummary: config.aiConfig.includeSummary !== false,
        categories: config.aiConfig.categories,
        keywords: config.aiConfig.keywords,
      };
      aiContent = await generateAIContent(fullAiConfig);
    } else {
      // Default configuration
      aiContent = await generateAIContent({
        topic: `Newsletter Update - ${new Date().toLocaleDateString()}`,
        tone: 'professional',
        length: 'medium',
        includeHeadings: true,
        includeSummary: true,
      });
    }
    
    // Step 2: Validate and enhance content
    const validatedContent = validateAndEnhanceContent(aiContent);
    
    // Step 3: Map category names to IDs
    const allCategories = await storage.getCategories();
    const categoryIds = config.categories || [];
    
    // If AI suggested categories, try to match them
    if (validatedContent.categories.length > 0 && categoryIds.length === 0) {
      validatedContent.categories.forEach(catName => {
        const category = allCategories.find(c => 
          c.name.toLowerCase() === catName.toLowerCase()
        );
        if (category) {
          categoryIds.push(category.id);
        }
      });
    }
    
    // Ensure at least one category
    if (categoryIds.length === 0 && allCategories.length > 0) {
      categoryIds.push(allCategories[0].id);
    }
    
    // Step 4: Create newsletter in database
    const newsletterData: InsertNewsletter = {
      title: validatedContent.title,
      subject: validatedContent.subject,
      content: validatedContent.content,
      status: 'draft', // Always create as draft for review
      authorId: 'ai-generated', // Mark as AI generated
    };
    
    const newsletter = await storage.createNewsletter(newsletterData);
    
    // Step 5: Associate categories
    if (categoryIds.length > 0) {
      await storage.setNewsletterCategories(newsletter.id, categoryIds);
    }
    
    // Step 6: Generate and save HTML page
    const categories = await storage.getNewsletterCategories(newsletter.id);
    const htmlPageData = {
      id: newsletter.id,
      title: newsletter.title,
      subject: newsletter.subject || newsletter.title, // Ensure subject is never null
      content: newsletter.content,
      categories: categories.map(c => c.name),
      createdAt: newsletter.createdAt || new Date().toISOString(),
      excerpt: validatedContent.summary,
    };
    
    const htmlContent = generateNewsletterHtmlPage(htmlPageData);
    // Save the HTML page using the htmlPageService
    await createNewsletterHtmlPage(htmlPageData);
    
    return {
      success: true,
      newsletterId: newsletter.id,
      generatedContent: {
        title: validatedContent.title,
        subject: validatedContent.subject,
        content: validatedContent.content,
      },
    };
  } catch (error) {
    console.error('Error creating automated newsletter:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create automated newsletter',
    };
  }
}

/**
 * Process scheduled newsletters
 * This would be called by a cron job or scheduled task
 */
export async function processScheduledNewsletters(
  storage: IStorage,
  automationConfigs: AutomationConfig[]
): Promise<AutomatedNewsletterResult[]> {
  const results: AutomatedNewsletterResult[] = [];
  
  for (const config of automationConfigs) {
    if (!config.enabled || !shouldRunNow(config.schedule)) {
      continue;
    }
    
    const result = await createAutomatedNewsletter(storage, config);
    results.push(result);
    
    // Log the result
    if (result.success) {
      console.log(`Successfully created automated newsletter: ${result.generatedContent?.title}`);
    } else {
      console.error(`Failed to create automated newsletter: ${result.error}`);
    }
  }
  
  return results;
}

/**
 * Check if a scheduled task should run now
 */
function shouldRunNow(schedule?: AutomationConfig['schedule']): boolean {
  if (!schedule) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  const currentDate = now.getDate();
  
  // Check hour (if specified)
  if (schedule.hour !== undefined && schedule.hour !== currentHour) {
    return false;
  }
  
  // Check based on frequency
  switch (schedule.frequency) {
    case 'daily':
      return true;
      
    case 'weekly':
      return schedule.dayOfWeek === undefined || schedule.dayOfWeek === currentDay;
      
    case 'monthly':
      return schedule.dayOfMonth === undefined || schedule.dayOfMonth === currentDate;
      
    default:
      return false;
  }
}

/**
 * Preview automated newsletter content without saving
 */
export async function previewAutomatedNewsletter(
  config: Partial<AutomationConfig>
): Promise<{
  title: string;
  subject: string;
  content: string;
  htmlPreview: string;
}> {
  // Generate AI content
  let aiContent;
  if (config.template) {
    aiContent = await generateFromTemplate(config.template, config.aiConfig);
  } else {
    const fullAiConfig = {
      topic: config.aiConfig?.topic || 'Newsletter Preview',
      tone: config.aiConfig?.tone || 'professional',
      length: config.aiConfig?.length || 'medium',
      includeHeadings: config.aiConfig?.includeHeadings !== false,
      includeSummary: config.aiConfig?.includeSummary !== false,
      categories: config.aiConfig?.categories,
      keywords: config.aiConfig?.keywords,
    };
    aiContent = await generateAIContent(fullAiConfig);
  }
  
  const validatedContent = validateAndEnhanceContent(aiContent);
  
  // Generate HTML preview
  const htmlPreview = generateNewsletterHtmlPage({
    id: 0,
    title: validatedContent.title,
    subject: validatedContent.subject,
    content: validatedContent.content,
    categories: validatedContent.categories,
    createdAt: new Date().toISOString(),
    excerpt: validatedContent.summary,
  });
  
  return {
    title: validatedContent.title,
    subject: validatedContent.subject,
    content: validatedContent.content,
    htmlPreview,
  };
}

/**
 * Get available newsletter templates
 */
export function getAvailableTemplates(): Array<{
  id: string;
  name: string;
  description: string;
  categories: string[];
}> {
  return [
    {
      id: 'weekly_tech',
      name: 'Weekly Tech Roundup',
      description: 'A comprehensive overview of the latest technology news and innovations',
      categories: ['Technology'],
    },
    {
      id: 'business_insights',
      name: 'Business Insights Monthly',
      description: 'In-depth analysis of business trends and strategic insights',
      categories: ['Business'],
    },
    {
      id: 'health_wellness',
      name: 'Health & Wellness Update',
      description: 'Tips and news for maintaining a healthy lifestyle',
      categories: ['Health'],
    },
  ];
}
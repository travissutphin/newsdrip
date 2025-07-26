
import { promises as fs } from 'fs';
import path from 'path';
import { generateNewsletterHtmlPage } from '../templates/newsletterHtmlPage.js';

interface NewsletterPageData {
  id: number;
  title: string;
  subject: string;
  content: string;
  categories: string[];
  createdAt: string;
  excerpt?: string;
}

const PAGES_DIR = path.join(process.cwd(), 'static', 'newsletters');

export async function createNewsletterHtmlPage(newsletterData: NewsletterPageData): Promise<string> {
  try {
    // Ensure the directory exists
    await fs.mkdir(PAGES_DIR, { recursive: true });
    
    // Generate slug for the filename
    const slug = newsletterData.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const filename = `${slug}-${newsletterData.id}.html`;
    const filepath = path.join(PAGES_DIR, filename);
    
    // Generate the HTML content
    const htmlContent = generateNewsletterHtmlPage(newsletterData);
    
    // Write the file
    await fs.writeFile(filepath, htmlContent, 'utf8');
    
    // Return the public URL
    const publicUrl = `/newsletters/${filename}`;
    return publicUrl;
    
  } catch (error) {
    console.error('Error creating newsletter HTML page:', error);
    throw new Error('Failed to create newsletter HTML page');
  }
}

export async function deleteNewsletterHtmlPage(newsletterId: number, title: string): Promise<void> {
  try {
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const filename = `${slug}-${newsletterId}.html`;
    const filepath = path.join(PAGES_DIR, filename);
    
    // Check if file exists and delete it
    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
      console.log(`Deleted newsletter HTML page: ${filename}`);
    } catch (error) {
      // File doesn't exist, which is fine
      console.log(`Newsletter HTML page not found: ${filename}`);
    }
  } catch (error) {
    console.error('Error deleting newsletter HTML page:', error);
    // Don't throw here, as this is cleanup operation
  }
}

export async function updateNewsletterHtmlPage(newsletterData: NewsletterPageData): Promise<string> {
  // For updates, we delete the old page and create a new one
  // This handles cases where the title (and thus slug) might have changed
  try {
    await deleteNewsletterHtmlPage(newsletterData.id, newsletterData.title);
  } catch (error) {
    // Ignore deletion errors
  }
  
  return createNewsletterHtmlPage(newsletterData);
}

export async function getAllNewsletterPages(): Promise<string[]> {
  try {
    await fs.access(PAGES_DIR);
    const files = await fs.readdir(PAGES_DIR);
    return files.filter(file => file.endsWith('.html'));
  } catch (error) {
    return [];
  }
}

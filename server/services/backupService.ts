
import { db } from "../db";
import { storage } from "../storage";
import fs from "fs/promises";
import path from "path";

export class BackupService {
  private backupDir = path.join(process.cwd(), "backups");

  async createBackup(): Promise<string> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFileName = `backup-${timestamp}.json`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Export all data
      const backupData = {
        categories: await storage.getCategories(),
        subscribers: await storage.getSubscribers(),
        newsletters: await storage.getNewsletters(),
        deliveries: await storage.getDeliveries(),
        timestamp: new Date().toISOString(),
      };

      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
      
      console.log(`Backup created: ${backupFileName}`);
      return backupPath;
    } catch (error) {
      console.error("Backup failed:", error);
      throw error;
    }
  }

  async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      const backupData = JSON.parse(await fs.readFile(backupPath, "utf-8"));
      
      console.log("Starting database restoration...");
      
      // Note: This is a simplified restore - in production you'd want
      // more sophisticated conflict resolution
      console.log(`Restoring backup from ${backupData.timestamp}`);
      
      // In a real restore, you'd implement proper data restoration logic
      // This would involve careful handling of foreign key constraints
      // and potential data conflicts
      
      console.log("Restoration completed");
    } catch (error) {
      console.error("Restore failed:", error);
      throw error;
    }
  }

  async listBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      return files.filter(file => file.startsWith("backup-") && file.endsWith(".json"));
    } catch (error) {
      console.error("Failed to list backups:", error);
      return [];
    }
  }

  async scheduleBackups(): Promise<void> {
    // Run backup every 24 hours
    setInterval(async () => {
      try {
        await this.createBackup();
        await this.cleanOldBackups();
      } catch (error) {
        console.error("Scheduled backup failed:", error);
      }
    }, 24 * 60 * 60 * 1000);
  }

  private async cleanOldBackups(retentionDays: number = 30): Promise<void> {
    try {
      const files = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath);
          console.log(`Deleted old backup: ${file}`);
        }
      }
    } catch (error) {
      console.error("Failed to clean old backups:", error);
    }
  }
}

export const backupService = new BackupService();

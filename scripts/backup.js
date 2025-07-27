#!/usr/bin/env node

/**
 * Database Backup Script for NewsletterPro
 * Supports both local development and production environments
 * Uses pg_dump for PostgreSQL backups with Neon compatibility
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DATABASE_URL = process.env.DATABASE_URL;
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30');
const COMPRESS_BACKUPS = process.env.COMPRESS_BACKUPS !== 'false';

// Backup types
const BACKUP_TYPES = {
  FULL: 'full',
  SCHEMA_ONLY: 'schema',
  DATA_ONLY: 'data'
};

class DatabaseBackup {
  constructor() {
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.backupDir = BACKUP_DIR;
  }

  async init() {
    // Create backup directory if it doesn't exist
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log(`Created backup directory: ${this.backupDir}`);
    }
  }

  /**
   * Create a full database backup
   */
  async createFullBackup() {
    const filename = `newsletter_backup_full_${this.timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);
    
    console.log('Starting full database backup...');
    
    try {
      const command = this.buildPgDumpCommand(BACKUP_TYPES.FULL, filepath);
      await execAsync(command);
      
      if (COMPRESS_BACKUPS) {
        await this.compressBackup(filepath);
      }
      
      console.log(`✅ Full backup completed: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('❌ Full backup failed:', error.message);
      throw error;
    }
  }

  /**
   * Create schema-only backup (structure without data)
   */
  async createSchemaBackup() {
    const filename = `newsletter_backup_schema_${this.timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);
    
    console.log('Starting schema-only backup...');
    
    try {
      const command = this.buildPgDumpCommand(BACKUP_TYPES.SCHEMA_ONLY, filepath);
      await execAsync(command);
      
      console.log(`✅ Schema backup completed: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('❌ Schema backup failed:', error.message);
      throw error;
    }
  }

  /**
   * Create data-only backup (data without structure)
   */
  async createDataBackup() {
    const filename = `newsletter_backup_data_${this.timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);
    
    console.log('Starting data-only backup...');
    
    try {
      const command = this.buildPgDumpCommand(BACKUP_TYPES.DATA_ONLY, filepath);
      await execAsync(command);
      
      if (COMPRESS_BACKUPS) {
        await this.compressBackup(filepath);
      }
      
      console.log(`✅ Data backup completed: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('❌ Data backup failed:', error.message);
      throw error;
    }
  }

  /**
   * Build pg_dump command based on backup type
   */
  buildPgDumpCommand(backupType, filepath) {
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    let options = [
      '--no-password',
      '--verbose',
      '--clean',
      '--if-exists',
      '--quote-all-identifiers'
    ];

    switch (backupType) {
      case BACKUP_TYPES.SCHEMA_ONLY:
        options.push('--schema-only');
        break;
      case BACKUP_TYPES.DATA_ONLY:
        options.push('--data-only', '--disable-triggers');
        break;
      case BACKUP_TYPES.FULL:
      default:
        // Full backup - no additional options needed
        break;
    }

    return `pg_dump "${DATABASE_URL}" ${options.join(' ')} --file="${filepath}"`;
  }

  /**
   * Compress backup file using gzip
   */
  async compressBackup(filepath) {
    console.log('Compressing backup...');
    try {
      await execAsync(`gzip "${filepath}"`);
      console.log('✅ Backup compressed successfully');
    } catch (error) {
      console.warn('⚠️  Compression failed, keeping uncompressed backup:', error.message);
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups() {
    console.log(`Cleaning up backups older than ${RETENTION_DAYS} days...`);
    
    try {
      const files = await fs.readdir(this.backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

      let deletedCount = 0;

      for (const file of files) {
        if (file.startsWith('newsletter_backup_')) {
          const filepath = path.join(this.backupDir, file);
          const stats = await fs.stat(filepath);
          
          if (stats.mtime < cutoffDate) {
            await fs.unlink(filepath);
            deletedCount++;
            console.log(`🗑️  Deleted old backup: ${file}`);
          }
        }
      }

      console.log(`✅ Cleanup completed. Deleted ${deletedCount} old backup(s)`);
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(filepath) {
    console.log(`Verifying backup integrity: ${path.basename(filepath)}`);
    
    try {
      // Check if file exists and has content
      const stats = await fs.stat(filepath);
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }

      // For .gz files, test the archive
      if (filepath.endsWith('.gz')) {
        await execAsync(`gzip -t "${filepath}"`);
      }

      // Basic SQL syntax check (look for expected PostgreSQL dump patterns)
      const content = await fs.readFile(filepath, 'utf8');
      if (!content.includes('PostgreSQL database dump') && !filepath.endsWith('.gz')) {
        throw new Error('Backup file does not appear to be a valid PostgreSQL dump');
      }

      console.log('✅ Backup verification passed');
      return true;
    } catch (error) {
      console.error('❌ Backup verification failed:', error.message);
      return false;
    }
  }

  /**
   * List all available backups
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = files
        .filter(file => file.startsWith('newsletter_backup_'))
        .map(async file => {
          const filepath = path.join(this.backupDir, file);
          const stats = await fs.stat(filepath);
          return {
            filename: file,
            size: this.formatFileSize(stats.size),
            created: stats.mtime.toISOString(),
            type: this.getBackupType(file)
          };
        });

      return await Promise.all(backups);
    } catch (error) {
      console.error('❌ Failed to list backups:', error.message);
      return [];
    }
  }

  /**
   * Format file size in human-readable format
   */
  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Determine backup type from filename
   */
  getBackupType(filename) {
    if (filename.includes('_full_')) return 'Full';
    if (filename.includes('_schema_')) return 'Schema';
    if (filename.includes('_data_')) return 'Data';
    return 'Unknown';
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';

  const backup = new DatabaseBackup();
  await backup.init();

  try {
    switch (command) {
      case 'full':
        const fullBackupPath = await backup.createFullBackup();
        await backup.verifyBackup(fullBackupPath);
        break;

      case 'schema':
        const schemaBackupPath = await backup.createSchemaBackup();
        await backup.verifyBackup(schemaBackupPath);
        break;

      case 'data':
        const dataBackupPath = await backup.createDataBackup();
        await backup.verifyBackup(dataBackupPath);
        break;

      case 'cleanup':
        await backup.cleanupOldBackups();
        break;

      case 'list':
        const backups = await backup.listBackups();
        console.log('\n📋 Available Backups:');
        console.table(backups);
        break;

      case 'help':
      default:
        console.log(`
📦 NewsletterPro Database Backup Tool

Usage: node scripts/backup.js [command]

Commands:
  full     Create a complete database backup (default)
  schema   Create schema-only backup (structure)
  data     Create data-only backup (content)
  cleanup  Remove old backups based on retention policy
  list     Show all available backups
  help     Show this help message

Environment Variables:
  DATABASE_URL              PostgreSQL connection string
  BACKUP_DIR               Backup directory (default: ./backups)
  BACKUP_RETENTION_DAYS    Keep backups for N days (default: 30)
  COMPRESS_BACKUPS         Compress backups with gzip (default: true)

Examples:
  node scripts/backup.js full          # Full backup
  node scripts/backup.js schema        # Schema only
  node scripts/backup.js cleanup       # Clean old backups
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Backup operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DatabaseBackup };
#!/usr/bin/env node

/**
 * Database Restore Script for NewsletterPro
 * Handles restoration from pg_dump backups with safety checks
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';

const execAsync = promisify(exec);

// Configuration
const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const DATABASE_URL = process.env.DATABASE_URL;

class DatabaseRestore {
  constructor() {
    this.backupDir = BACKUP_DIR;
  }

  /**
   * List available backup files
   */
  async listAvailableBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      return files
        .filter(file => file.startsWith('newsletter_backup_'))
        .sort((a, b) => b.localeCompare(a)); // Most recent first
    } catch (error) {
      throw new Error(`Cannot access backup directory: ${error.message}`);
    }
  }

  /**
   * Validate backup file before restoration
   */
  async validateBackupFile(filepath) {
    console.log(`Validating backup file: ${path.basename(filepath)}`);

    try {
      // Check if file exists
      await fs.access(filepath);
      
      // Check file size
      const stats = await fs.stat(filepath);
      if (stats.size === 0) {
        throw new Error('Backup file is empty');
      }

      // For compressed files, test archive integrity
      if (filepath.endsWith('.gz')) {
        await execAsync(`gzip -t "${filepath}"`);
        console.log('✅ Compressed backup file is valid');
      } else {
        // For uncompressed SQL files, check for PostgreSQL dump markers
        const content = await fs.readFile(filepath, 'utf8');
        if (!content.includes('PostgreSQL database dump')) {
          throw new Error('File does not appear to be a valid PostgreSQL dump');
        }
        console.log('✅ SQL backup file is valid');
      }

      return true;
    } catch (error) {
      console.error('❌ Backup validation failed:', error.message);
      return false;
    }
  }

  /**
   * Create a safety backup before restoration
   */
  async createSafetyBackup() {
    console.log('Creating safety backup of current database...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `safety_backup_${timestamp}.sql`;
      const filepath = path.join(this.backupDir, filename);
      
      const command = `pg_dump "${DATABASE_URL}" --no-password --verbose --clean --if-exists --quote-all-identifiers --file="${filepath}"`;
      await execAsync(command);
      
      console.log(`✅ Safety backup created: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('❌ Failed to create safety backup:', error.message);
      throw error;
    }
  }

  /**
   * Restore database from backup file
   */
  async restoreFromBackup(backupPath, options = {}) {
    const { 
      skipSafetyBackup = false, 
      skipConfirmation = false,
      cleanFirst = true 
    } = options;

    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    // Validate backup file
    const isValid = await this.validateBackupFile(backupPath);
    if (!isValid) {
      throw new Error('Backup validation failed');
    }

    // Create safety backup unless skipped
    let safetyBackupPath;
    if (!skipSafetyBackup) {
      safetyBackupPath = await this.createSafetyBackup();
    }

    // Confirmation prompt unless skipped
    if (!skipConfirmation) {
      const confirmed = await this.confirmRestore(backupPath);
      if (!confirmed) {
        console.log('Restore operation cancelled');
        return false;
      }
    }

    console.log(`Starting database restore from: ${path.basename(backupPath)}`);

    try {
      // Handle compressed files
      let restoreCommand;
      if (backupPath.endsWith('.gz')) {
        restoreCommand = `gunzip -c "${backupPath}" | psql "${DATABASE_URL}"`;
      } else {
        restoreCommand = `psql "${DATABASE_URL}" --file="${backupPath}"`;
      }

      // Add additional psql options
      const psqlOptions = [
        '--no-password',
        '--echo-errors',
        '--on-error-stop'
      ];

      if (!backupPath.endsWith('.gz')) {
        restoreCommand = `psql "${DATABASE_URL}" ${psqlOptions.join(' ')} --file="${backupPath}"`;
      }

      await execAsync(restoreCommand);
      console.log('✅ Database restore completed successfully');

      // Verify restore
      await this.verifyRestore();

      return true;
    } catch (error) {
      console.error('❌ Database restore failed:', error.message);
      
      if (safetyBackupPath) {
        console.log('🔄 Attempting to restore from safety backup...');
        try {
          await this.restoreFromBackup(safetyBackupPath, { 
            skipSafetyBackup: true, 
            skipConfirmation: true 
          });
          console.log('✅ Restored from safety backup');
        } catch (safetyError) {
          console.error('❌ Safety backup restore also failed:', safetyError.message);
        }
      }
      
      throw error;
    }
  }

  /**
   * Verify database restore by checking table existence and basic data
   */
  async verifyRestore() {
    console.log('Verifying database restore...');

    try {
      // Check if essential tables exist
      const tableCheck = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'newsletters', 'subscribers', 'categories')
      `;

      const { stdout } = await execAsync(`psql "${DATABASE_URL}" -t -c "${tableCheck}"`);
      const tables = stdout.trim().split('\n').map(t => t.trim()).filter(t => t);

      const expectedTables = ['users', 'newsletters', 'subscribers', 'categories'];
      const missingTables = expectedTables.filter(table => !tables.includes(table));

      if (missingTables.length > 0) {
        console.warn(`⚠️  Missing tables after restore: ${missingTables.join(', ')}`);
      } else {
        console.log('✅ All essential tables present');
      }

      // Basic row count check
      const countQueries = [
        'SELECT COUNT(*) FROM categories',
        'SELECT COUNT(*) FROM subscribers',
        'SELECT COUNT(*) FROM newsletters'
      ];

      for (const query of countQueries) {
        try {
          const { stdout } = await execAsync(`psql "${DATABASE_URL}" -t -c "${query}"`);
          const count = stdout.trim();
          console.log(`📊 ${query.split(' ')[3]}: ${count} rows`);
        } catch (error) {
          console.warn(`⚠️  Could not verify ${query}: ${error.message}`);
        }
      }

      console.log('✅ Database restore verification completed');
    } catch (error) {
      console.warn('⚠️  Restore verification failed:', error.message);
    }
  }

  /**
   * Interactive confirmation prompt
   */
  async confirmRestore(backupPath) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log('\n⚠️  WARNING: This will replace all data in your database!');
      console.log(`Backup file: ${path.basename(backupPath)}`);
      console.log('A safety backup will be created first.\n');

      rl.question('Do you want to continue? (yes/no): ', (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      });
    });
  }

  /**
   * Restore specific tables only
   */
  async restoreTablesOnly(backupPath, tables) {
    console.log(`Restoring specific tables: ${tables.join(', ')}`);

    try {
      // Create a temporary file with filtered content
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const tempFile = path.join(this.backupDir, `temp_restore_${timestamp}.sql`);

      // Extract only specified tables from backup
      let filterCommand;
      if (backupPath.endsWith('.gz')) {
        filterCommand = `gunzip -c "${backupPath}" > "${tempFile}"`;
      } else {
        filterCommand = `cp "${backupPath}" "${tempFile}"`;
      }

      await execAsync(filterCommand);

      // Restore using the temporary file with table filtering
      const restoreOptions = tables.map(table => `--table=${table}`).join(' ');
      const restoreCommand = `pg_restore "${DATABASE_URL}" ${restoreOptions} "${tempFile}"`;

      await execAsync(restoreCommand);

      // Clean up temporary file
      await fs.unlink(tempFile);

      console.log('✅ Table-specific restore completed');
      return true;
    } catch (error) {
      console.error('❌ Table-specific restore failed:', error.message);
      throw error;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const backupFile = args[1];

  const restore = new DatabaseRestore();

  try {
    switch (command) {
      case 'list':
        const backups = await restore.listAvailableBackups();
        if (backups.length === 0) {
          console.log('No backup files found');
        } else {
          console.log('\n📋 Available Backup Files:');
          backups.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
          });
        }
        break;

      case 'restore':
        if (!backupFile) {
          console.error('❌ Please specify a backup file to restore');
          console.log('Usage: node scripts/restore.js restore <backup-filename>');
          process.exit(1);
        }

        const backupPath = path.join(restore.backupDir, backupFile);
        await restore.restoreFromBackup(backupPath);
        break;

      case 'validate':
        if (!backupFile) {
          console.error('❌ Please specify a backup file to validate');
          process.exit(1);
        }

        const validatePath = path.join(restore.backupDir, backupFile);
        await restore.validateBackupFile(validatePath);
        break;

      case 'help':
      default:
        console.log(`
🔄 NewsletterPro Database Restore Tool

Usage: node scripts/restore.js [command] [options]

Commands:
  list              List all available backup files
  restore <file>    Restore database from backup file
  validate <file>   Validate backup file integrity
  help              Show this help message

Examples:
  node scripts/restore.js list
  node scripts/restore.js restore newsletter_backup_full_2025-01-27.sql
  node scripts/restore.js validate newsletter_backup_full_2025-01-27.sql.gz

Environment Variables:
  DATABASE_URL    PostgreSQL connection string
  BACKUP_DIR      Backup directory (default: ./backups)

⚠️  WARNING: Restore operations will overwrite existing data!
A safety backup is automatically created before restoration.
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Restore operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { DatabaseRestore };
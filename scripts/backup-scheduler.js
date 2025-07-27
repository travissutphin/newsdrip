#!/usr/bin/env node

/**
 * Automated Backup Scheduler for NewsletterPro
 * Runs periodic backups and manages retention policies
 */

import cron from 'node-cron';
import { DatabaseBackup } from './backup.js';

// Configuration from environment variables
const BACKUP_SCHEDULE = {
  // Daily full backup at 2 AM
  DAILY: process.env.DAILY_BACKUP_SCHEDULE || '0 2 * * *',
  // Weekly schema backup on Sundays at 1 AM  
  WEEKLY_SCHEMA: process.env.WEEKLY_SCHEMA_SCHEDULE || '0 1 * * 0',
  // Monthly cleanup on 1st day at 3 AM
  MONTHLY_CLEANUP: process.env.MONTHLY_CLEANUP_SCHEDULE || '0 3 1 * *'
};

class BackupScheduler {
  constructor() {
    this.backup = new DatabaseBackup();
    this.tasks = [];
  }

  async init() {
    await this.backup.init();
    console.log('🕐 Backup Scheduler initialized');
  }

  /**
   * Schedule daily full backup
   */
  scheduleDailyBackup() {
    const task = cron.schedule(BACKUP_SCHEDULE.DAILY, async () => {
      console.log('\n📅 Starting scheduled daily backup...');
      try {
        const backupPath = await this.backup.createFullBackup();
        await this.backup.verifyBackup(backupPath);
        console.log('✅ Daily backup completed successfully\n');
      } catch (error) {
        console.error('❌ Daily backup failed:', error.message);
        await this.notifyBackupFailure('Daily', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'America/New_York'
    });

    this.tasks.push({ name: 'Daily Backup', task, schedule: BACKUP_SCHEDULE.DAILY });
    console.log(`📅 Daily backup scheduled: ${BACKUP_SCHEDULE.DAILY}`);
  }

  /**
   * Schedule weekly schema backup
   */
  scheduleWeeklySchemaBackup() {
    const task = cron.schedule(BACKUP_SCHEDULE.WEEKLY_SCHEMA, async () => {
      console.log('\n📅 Starting scheduled weekly schema backup...');
      try {
        const backupPath = await this.backup.createSchemaBackup();
        await this.backup.verifyBackup(backupPath);
        console.log('✅ Weekly schema backup completed successfully\n');
      } catch (error) {
        console.error('❌ Weekly schema backup failed:', error.message);
        await this.notifyBackupFailure('Weekly Schema', error);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'America/New_York'
    });

    this.tasks.push({ name: 'Weekly Schema Backup', task, schedule: BACKUP_SCHEDULE.WEEKLY_SCHEMA });
    console.log(`📅 Weekly schema backup scheduled: ${BACKUP_SCHEDULE.WEEKLY_SCHEMA}`);
  }

  /**
   * Schedule monthly cleanup
   */
  scheduleMonthlyCleanup() {
    const task = cron.schedule(BACKUP_SCHEDULE.MONTHLY_CLEANUP, async () => {
      console.log('\n📅 Starting scheduled monthly cleanup...');
      try {
        await this.backup.cleanupOldBackups();
        console.log('✅ Monthly cleanup completed successfully\n');
      } catch (error) {
        console.error('❌ Monthly cleanup failed:', error.message);
      }
    }, {
      scheduled: false,
      timezone: process.env.TZ || 'America/New_York'
    });

    this.tasks.push({ name: 'Monthly Cleanup', task, schedule: BACKUP_SCHEDULE.MONTHLY_CLEANUP });
    console.log(`📅 Monthly cleanup scheduled: ${BACKUP_SCHEDULE.MONTHLY_CLEANUP}`);
  }

  /**
   * Start all scheduled tasks
   */
  start() {
    console.log('\n🚀 Starting backup scheduler...');
    this.tasks.forEach(({ name, task }) => {
      task.start();
      console.log(`✅ ${name} task started`);
    });
    console.log('🕐 All backup tasks are now running\n');
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    console.log('\n🛑 Stopping backup scheduler...');
    this.tasks.forEach(({ name, task }) => {
      task.stop();
      console.log(`🛑 ${name} task stopped`);
    });
    console.log('🔴 All backup tasks stopped\n');
  }

  /**
   * Show status of all scheduled tasks
   */
  status() {
    console.log('\n📊 Backup Scheduler Status:');
    console.log('━'.repeat(50));
    
    this.tasks.forEach(({ name, task, schedule }) => {
      const status = task.running ? '🟢 Running' : '🔴 Stopped';
      console.log(`${name.padEnd(20)} ${status.padEnd(12)} ${schedule}`);
    });
    
    console.log('━'.repeat(50));
    console.log(`Total tasks: ${this.tasks.length}`);
    console.log(`Active tasks: ${this.tasks.filter(t => t.task.running).length}\n`);
  }

  /**
   * Run immediate backup for testing
   */
  async runImmediateBackup(type = 'full') {
    console.log(`\n🔄 Running immediate ${type} backup...`);
    
    try {
      let backupPath;
      switch (type) {
        case 'schema':
          backupPath = await this.backup.createSchemaBackup();
          break;
        case 'data':
          backupPath = await this.backup.createDataBackup();
          break;
        case 'full':
        default:
          backupPath = await this.backup.createFullBackup();
          break;
      }
      
      await this.backup.verifyBackup(backupPath);
      console.log(`✅ Immediate ${type} backup completed successfully\n`);
      return backupPath;
    } catch (error) {
      console.error(`❌ Immediate ${type} backup failed:`, error.message);
      throw error;
    }
  }

  /**
   * Notify about backup failures (can be extended with email/webhook notifications)
   */
  async notifyBackupFailure(backupType, error) {
    const timestamp = new Date().toISOString();
    const logMessage = `
━━━ BACKUP FAILURE ALERT ━━━
Time: ${timestamp}
Type: ${backupType}
Error: ${error.message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    
    console.error(logMessage);
    
    // TODO: Add email/webhook notifications here
    // Example integrations:
    // - Send email via SendGrid/Resend
    // - Post to Slack webhook
    // - Send to monitoring service (DataDog, New Relic, etc.)
  }

  /**
   * Get next run times for all scheduled tasks
   */
  getNextRunTimes() {
    return this.tasks.map(({ name, task }) => ({
      name,
      nextRun: task.nextDate()?.toISOString() || 'Not scheduled'
    }));
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';

  const scheduler = new BackupScheduler();
  await scheduler.init();

  // Setup all scheduled tasks
  scheduler.scheduleDailyBackup();
  scheduler.scheduleWeeklySchemaBackup();
  scheduler.scheduleMonthlyCleanup();

  try {
    switch (command) {
      case 'start':
        scheduler.start();
        
        // Keep the process running
        console.log('Press Ctrl+C to stop the scheduler\n');
        
        // Show next run times
        const nextRuns = scheduler.getNextRunTimes();
        console.log('📅 Next scheduled runs:');
        nextRuns.forEach(({ name, nextRun }) => {
          console.log(`  ${name}: ${nextRun}`);
        });
        
        // Graceful shutdown
        process.on('SIGINT', () => {
          console.log('\n🛑 Shutting down scheduler...');
          scheduler.stop();
          process.exit(0);
        });
        
        // Keep alive
        setInterval(() => {
          // Heartbeat - could log status or send health checks
        }, 60000);
        
        break;

      case 'status':
        scheduler.start(); // Start to get accurate status
        scheduler.status();
        scheduler.stop();
        break;

      case 'test':
        const backupType = args[1] || 'full';
        await scheduler.runImmediateBackup(backupType);
        break;

      case 'next':
        scheduler.start();
        const runs = scheduler.getNextRunTimes();
        console.log('\n📅 Next scheduled backup times:');
        runs.forEach(({ name, nextRun }) => {
          console.log(`  ${name.padEnd(25)} ${nextRun}`);
        });
        scheduler.stop();
        break;

      case 'help':
      default:
        console.log(`
🕐 NewsletterPro Backup Scheduler

Usage: node scripts/backup-scheduler.js [command] [options]

Commands:
  start         Start the backup scheduler daemon (default)
  status        Show current scheduler status
  test [type]   Run immediate backup (full|schema|data)
  next          Show next scheduled run times
  help          Show this help message

Schedule Configuration (via environment variables):
  DAILY_BACKUP_SCHEDULE      Daily full backup (default: "0 2 * * *" - 2 AM daily)
  WEEKLY_SCHEMA_SCHEDULE     Weekly schema backup (default: "0 1 * * 0" - 1 AM Sundays)
  MONTHLY_CLEANUP_SCHEDULE   Monthly cleanup (default: "0 3 1 * *" - 3 AM on 1st of month)
  TZ                         Timezone (default: "America/New_York")

Examples:
  node scripts/backup-scheduler.js start           # Start scheduler daemon
  node scripts/backup-scheduler.js test full       # Test full backup
  node scripts/backup-scheduler.js status          # Check status
  node scripts/backup-scheduler.js next            # Show next runs

Cron Format: minute hour day-of-month month day-of-week
  *    *    *            *     *
  0-59 0-23 1-31         1-12  0-7 (0 or 7 = Sunday)
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Scheduler operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { BackupScheduler };
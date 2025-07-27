# Database Backup and Recovery Guide

## Overview

NewsletterPro implements comprehensive database backup and recovery procedures designed specifically for PostgreSQL databases, with full compatibility for Neon serverless PostgreSQL deployments.

## Backup Strategy

### Three-Tier Backup Approach

1. **Daily Full Backups**: Complete database dump including schema and data
2. **Weekly Schema Backups**: Database structure only for quick schema recovery
3. **Monthly Data Backups**: Data-only backups for specific recovery scenarios

### Automated Scheduling

- **Daily Full Backup**: 2:00 AM (configurable)
- **Weekly Schema Backup**: Sundays at 1:00 AM
- **Monthly Cleanup**: 1st of each month at 3:00 AM
- **Retention Policy**: 30 days (configurable)

## Tools and Scripts

### 1. Manual Backup Script (`scripts/backup.js`)

```bash
# Full database backup (recommended)
node scripts/backup.js full

# Schema-only backup
node scripts/backup.js schema

# Data-only backup
node scripts/backup.js data

# List all backups
node scripts/backup.js list

# Clean up old backups
node scripts/backup.js cleanup
```

### 2. Database Restore Script (`scripts/restore.js`)

```bash
# List available backups
node scripts/restore.js list

# Restore from specific backup
node scripts/restore.js restore newsletter_backup_full_2025-01-27.sql

# Validate backup file integrity
node scripts/restore.js validate newsletter_backup_full_2025-01-27.sql
```

### 3. Automated Scheduler (`scripts/backup-scheduler.js`)

```bash
# Start backup scheduler daemon
node scripts/backup-scheduler.js start

# Check scheduler status
node scripts/backup-scheduler.js status

# Run immediate test backup
node scripts/backup-scheduler.js test full

# View next scheduled runs
node scripts/backup-scheduler.js next
```

## Configuration

### Environment Variables

```bash
# Database connection
DATABASE_URL=postgresql://user:pass@host:port/database

# Backup configuration
BACKUP_DIR=./backups                    # Backup storage directory
BACKUP_RETENTION_DAYS=30                # Keep backups for 30 days
COMPRESS_BACKUPS=true                   # Compress backups with gzip

# Scheduler configuration
DAILY_BACKUP_SCHEDULE="0 2 * * *"       # 2 AM daily
WEEKLY_SCHEMA_SCHEDULE="0 1 * * 0"      # 1 AM Sundays
MONTHLY_CLEANUP_SCHEDULE="0 3 1 * *"    # 3 AM on 1st of month
TZ="America/New_York"                   # Timezone
```

## Backup Types Explained

### Full Backup
- **Contains**: Complete database schema and all data
- **Use Case**: Complete disaster recovery, development environment setup
- **File Size**: Largest
- **Restore Time**: Longest, but complete

### Schema Backup
- **Contains**: Database structure only (tables, indexes, constraints, functions)
- **Use Case**: Schema migrations, structure recovery, development setup
- **File Size**: Smallest
- **Restore Time**: Fastest

### Data Backup
- **Contains**: All table data without schema structure
- **Use Case**: Data recovery when schema is intact
- **File Size**: Medium to large
- **Restore Time**: Medium

## Recovery Procedures

### 1. Complete Database Recovery

```bash
# 1. List available backups
node scripts/restore.js list

# 2. Choose appropriate backup and restore
node scripts/restore.js restore newsletter_backup_full_2025-01-27.sql

# The script will:
# - Create safety backup of current database
# - Validate backup file integrity
# - Ask for confirmation
# - Restore database
# - Verify restoration success
```

### 2. Schema-Only Recovery

```bash
# Restore only database structure
node scripts/restore.js restore newsletter_backup_schema_2025-01-27.sql
```

### 3. Emergency Recovery Process

1. **Immediate Assessment**
   ```bash
   # Check database connectivity
   psql $DATABASE_URL -c "SELECT version();"
   
   # Check table existence
   psql $DATABASE_URL -c "\dt"
   ```

2. **Safety Backup (if possible)**
   ```bash
   node scripts/backup.js full
   ```

3. **Restore from Latest Backup**
   ```bash
   node scripts/restore.js list
   node scripts/restore.js restore <most-recent-backup>
   ```

4. **Verification**
   ```bash
   # Check row counts
   psql $DATABASE_URL -c "SELECT 
     (SELECT COUNT(*) FROM subscribers) as subscribers,
     (SELECT COUNT(*) FROM newsletters) as newsletters,
     (SELECT COUNT(*) FROM categories) as categories;"
   ```

## Best Practices

### Security
- Store backups in secure, encrypted storage
- Use separate credentials for backup operations
- Regularly test backup integrity
- Implement off-site backup storage for production

### Monitoring
- Set up alerts for backup failures
- Monitor backup file sizes for anomalies
- Track backup creation and verification times
- Log all backup operations

### Testing
- Monthly restore testing in staging environment
- Validate backup integrity automatically
- Test partial recovery scenarios
- Document recovery time objectives (RTO)

## Neon-Specific Considerations

### Connection Pooling
Neon uses connection pooling which may affect long-running backup operations:
```bash
# Use direct connection for backups
export DATABASE_URL="postgresql://user:pass@host:5432/database?sslmode=require"
```

### Serverless Limitations
- Connection limits during backup operations
- Potential cold start delays
- Network timeout considerations

### Optimization for Neon
```bash
# Optimized pg_dump for Neon
pg_dump "$DATABASE_URL" \
  --no-password \
  --verbose \
  --single-transaction \
  --no-tablespaces \
  --quote-all-identifiers \
  --file="backup.sql"
```

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   ```bash
   # Set longer timeout
   export PGCONNECT_TIMEOUT=60
   ```

2. **Permission Errors**
   ```bash
   # Ensure backup directory permissions
   chmod 755 ./backups
   ```

3. **Large Database Backups**
   ```bash
   # Use compression for large databases
   export COMPRESS_BACKUPS=true
   ```

4. **Memory Issues**
   ```bash
   # Use streaming for large datasets
   pg_dump --format=custom --compress=9
   ```

### Recovery Failures

1. **Check backup file integrity**
   ```bash
   node scripts/restore.js validate <backup-file>
   ```

2. **Use safety backup**
   - Every restore creates a safety backup
   - Located in same backup directory
   - Prefixed with `safety_backup_`

3. **Partial restoration**
   ```bash
   # Restore specific tables only
   pg_restore --table=subscribers --table=newsletters backup.sql
   ```

## Production Deployment

### Required Setup

1. **Install Dependencies**
   ```bash
   npm install node-cron
   ```

2. **Create Backup Directory**
   ```bash
   mkdir -p /var/backups/newsletter
   chmod 700 /var/backups/newsletter
   ```

3. **Set Environment Variables**
   ```bash
   export DATABASE_URL="your-neon-connection-string"
   export BACKUP_DIR="/var/backups/newsletter"
   export BACKUP_RETENTION_DAYS=30
   ```

4. **Start Scheduler Service**
   ```bash
   # Using PM2 (recommended)
   pm2 start scripts/backup-scheduler.js --name newsletter-backups
   pm2 save
   pm2 startup
   
   # Or using systemd
   sudo systemctl start newsletter-backup-scheduler
   sudo systemctl enable newsletter-backup-scheduler
   ```

### Monitoring and Alerts

1. **Log Monitoring**
   ```bash
   tail -f /var/log/newsletter-backups.log
   ```

2. **Backup Verification**
   ```bash
   # Weekly verification script
   find /var/backups/newsletter -name "*.sql*" -mtime -7 | while read backup; do
     node scripts/restore.js validate "$backup"
   done
   ```

3. **Disk Space Monitoring**
   ```bash
   # Alert when backup directory > 80% full
   df -h /var/backups/newsletter
   ```

## Recovery Time Objectives (RTO)

| Scenario | Target RTO | Procedure |
|----------|------------|-----------|
| Complete database loss | < 30 minutes | Full backup restore |
| Schema corruption | < 10 minutes | Schema backup restore |
| Data corruption | < 20 minutes | Data backup restore |
| Partial table loss | < 5 minutes | Table-specific restore |

## Contact and Support

For backup and recovery support:
- Check logs in backup directory
- Validate environment variables
- Test with minimal dataset first
- Consult Neon documentation for platform-specific issues

---

**Note**: This guide assumes PostgreSQL client tools (`pg_dump`, `pg_restore`, `psql`) are available in the system PATH. For Neon serverless environments, ensure proper SSL configuration and connection pooling settings.
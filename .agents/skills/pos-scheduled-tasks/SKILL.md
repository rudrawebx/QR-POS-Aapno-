---
name: pos-scheduled-tasks
description: Automated cron jobs and background tasks for Aapno Khaano POS (EOD Z-Report, inventory audit, low-stock alerts, and database health). Use when scheduling recurring tasks or running periodic restaurant audits.
---

# POS Scheduled Tasks & Background Automation

This skill defines the standard recurring automation runbooks for the Aapno Khaano POS system.

## Available Scheduled Workflows

### 1. End of Day (EOD) Z-Report Generation
- **Cron**: `59 23 * * *` (Daily at 11:59:59 PM)
- **Prompt**: `Fetch daily sales report from /api/reports?range=TODAY and generate the verified Z-Report audit with payment channel breakdown (UPI, Cash, Card) and top selling dishes.`
- **Verification**: Ensure start timestamp is `00:00:00` and end timestamp is `23:59:59` of the active date.

### 2. Hourly Inventory & Low-Stock Monitor
- **Cron**: `0 * * * *` (Hourly)
- **Prompt**: `Check raw materials in Inventory where currentStock <= minThreshold, and alert cashier/management.`

### 3. Stale Parking Tickets / Held Orders Purge
- **Cron**: `0 3 * * *` (Daily at 3:00 AM)
- **Prompt**: `Query HeldOrder database table for entries older than 24 hours and archive or purge them.`

### 4. Database Health & Sync Check
- **Cron**: `0 4 * * *` (Daily at 4:00 AM)
- **Prompt**: `Verify connection to Hostinger MySQL, check total table records (Orders, Invoices, Customers), and verify system readiness.`

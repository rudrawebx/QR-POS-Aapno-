---
name: pos-audit-reports
description: Generates daily Z-reports, End-of-Day financial summaries, tax audits (CGST/SGST), and payment reconciliation for Aapno Khaano POS.
---

# POS Audit & Reports Runbook

## Generating Daily Z-Report
1. Query `/api/reports?range=TODAY` (or run direct Prisma aggregate for `createdAt: { gte: 00:00:00, lte: 23:59:59 }`).
2. Calculate:
   - Total Net Sales
   - CGST (2.5%) & SGST (2.5%)
   - Gross Revenue
   - Total Completed Orders count
   - Payment breakdown: UPI (`9996213962@hdfc`), Cash at Counter, Card EDC Terminal, Split
3. Format output for 80mm ESC/POS thermal receipt and print preview.

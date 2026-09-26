# 🤖 Antigravity Multi-Agent Guidelines — Aapno Khaano POS

When operating in this codebase, Antigravity subagents and background tasks must adhere to these directives:

## 1. Database Operations
- Never drop production database tables without explicit user confirmation.
- Database connection string is configured in `.env` for Hostinger MySQL (`u931854669_aapno_khano`).
- Use Prisma Client for all data mutations and maintain tenant isolation via `restaurantId: 'rest_aapno_khano'`.

## 2. Order & Bill Integrity
- When calculating prices, always preserve the user's portion size selection (Half vs Full).
- Subtotal + GST (2.5% CGST + 2.5% SGST) must reconcile accurately across Order, Invoice, and Payment models.

## 3. Scheduled Tasks Execution
- Scheduled tasks should log execution results to `.agents/logs/` or console for auditability.
- Automated Z-reports should pull live aggregated data from `/api/reports?range=TODAY`.

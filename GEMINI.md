# 🍽️ Aapno Khaano Restaurant QSR POS SaaS — Antigravity Workspace Guide

Welcome to the **Aapno Khaano (आपणो खाणो)** QSR POS System & Multi-Tenant Restaurant SaaS.

---

## 🏛️ Project Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router with Webpack) + React 19 + TypeScript
- **Database**: Hostinger MySQL (`srv2143.hstgr.io:3306`, DB: `u931854669_aapno_khano`) via **Prisma ORM 6.4.1**
- **Styling**: Tailwind CSS 4 + Lucide React Icons
- **Printing**: 80mm ESC/POS Thermal Dual Printing (Customer Bill + Kitchen Order Ticket KOT)
- **Payment Channels**: UPI Direct (`9996213962@hdfc`), Cash at Counter, EDC Card Terminal, Razorpay Webhooks
- **Production URL**: `https://pos.aapnokhano.com`
- **Git Remote**: `https://github.com/rudrawebx/QR-POS-Aapno-.git` (`main` branch)

---

## 🕒 Scheduled Tasks & Recurring Jobs

This project supports automated background and scheduled operations using Antigravity's `/schedule` system:

| Task Name | Recommended Schedule (Cron) | Action / Purpose |
|---|---|---|
| **Daily EOD Z-Report Audit** | `59 23 * * *` (11:59 PM Daily) | Aggregate total sales, CGST/SGST, payment methods (UPI, Cash, Card), and top dishes for the day (12:00 AM to 11:59 PM). |
| **Inventory & Stock Reconciliation** | `0 */2 * * *` (Every 2 Hours) | Check raw material recipe deductions against active orders and flag low-stock items. |
| **Pending Held Orders Auto-Cleanup** | `0 2 * * *` (2:00 AM Daily) | Archive stale or un-resumed held parking tickets older than 24 hours. |
| **Database Backup & Health Check** | `0 4 * * *` (4:00 AM Daily) | Run database integrity check and verify Hostinger MySQL connectivity. |

### How to Trigger in Antigravity Chat:
- Type `/schedule` in the chat followed by your instruction.
  * *Example*: `/schedule Every day at 11:59 PM, fetch live sales from /api/reports?range=TODAY and generate the verified daily Z-Report audit summary.`

---

## 📋 Core Modules & Routes

- `/admin/pos` — Primary POS billing counter with live cart, customer/car parking tickets, held orders drawer (up to 20 tickets), dual thermal printing (KOT & Bill), and instant Z-Report.
- `/admin/orders` — Live order management table with status filtering (CONFIRMED, PREPARING, DELIVERED, CANCELLED).
- `/admin/invoices` — Tax invoice registry with human-readable numbers (`AK-INV-2026-XXXXXX`) and reprint tools.
- `/admin/menu` — Visual menu catalog with portion variations (Half/Full), pricing, image upload, and category manager.
- `/admin/inventory` — Raw material stock levels, low-stock alerts, and recipe Bill-of-Materials (BOM).
- `/kitchen` — Dedicated KDS (Kitchen Display System) for live order items and KOT tracking.
- `/r/[slug]` & `/r/[slug]/[table]` — Customer QR menu with instant ordering and UPI/Counter payment options.

---

## ⚙️ Development Guidelines

1. **Database Sync**: Always run `npx prisma db push` and `npx prisma generate` when modifying `prisma/schema.prisma`.
2. **Portion Variations**: Items with variations must support both `Half` (`priceSmallHalf`) and `Full` (`priceLargeFull`) with robust string matching (`varStr.includes('full')` vs `varStr.includes('half')`).
3. **Receipt Formats**: Standard thermal printer width is 80mm with 5% GST (2.5% CGST + 2.5% SGST) for restaurant dine-in and car service orders.
4. **Zero Build Errors**: Always verify with `npm run build` before pushing to GitHub.

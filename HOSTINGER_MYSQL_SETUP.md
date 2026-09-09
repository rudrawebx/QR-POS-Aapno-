# Hostinger MySQL Database Setup Guide for Aapno Khaano POS

This guide details your exact Hostinger MySQL database connection.

---

## 1. Your Database Credentials (Hostinger hPanel)

* **MySQL Server Host / IP**: `76.13.204.45`
* **Port**: `3306`
* **Database Name**: `u931854669_aapnokhano`
* **MySQL Username**: `u931854669_aapnokhano`
* **Password**: `RudraWebX@12` (Encoded as `RudraWebX%4012` for connection URLs)

---

## 2. Exact Connection String (for Vercel & `.env`)

Copy and paste this exact value into your **Vercel Settings ➔ Environment Variables** (Name: `DATABASE_URL`):

```env
DATABASE_URL="mysql://u931854669_aapnokhano:RudraWebX%4012@76.13.204.45:3306/u931854669_aapnokhano"
```

---

## 3. Remote MySQL in Hostinger hPanel

Make sure **Remote MySQL** is enabled so Vercel can talk to Hostinger:

1. Open **Hostinger hPanel** (`https://hpanel.hostinger.com`).
2. Go to **Databases** ➔ **Remote MySQL**.
3. Under **Add Remote Database Host**:
   * **IP (IPv4 or IPv6)**: Enter `%` (Allows any connection from Vercel).
   * **Database**: Select `u931854669_aapnokhano`.
4. Click **Create**.

---

## 4. Run Migration to Create All 32 Database Tables

Run this in your terminal:

```bash
# Creates all 32 tables directly in your Hostinger MySQL Database:
npx prisma db push
```

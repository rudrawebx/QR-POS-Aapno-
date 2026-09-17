# Hostinger MySQL Database Setup Guide for Aapno Khaano POS

This guide details your exact Hostinger MySQL database connection.

---

## 1. Your Exact Database Credentials (Hostinger hPanel)

* **MySQL Server Host / Hostname**: `srv2143.hstgr.io` (or IP: `195.35.61.22`)
* **Port**: `3306`
* **Database Name**: `u931854669_aapno_khano`
* **MySQL Username**: `u931854669_aapno_khano`
* **Password**: `RudraWebX@12` (Encoded as `RudraWebX%4012` for connection URLs)

---

## 2. Exact Connection String (for Vercel & `.env`)

Copy and paste this exact value into your **Vercel Settings ➔ Environment Variables** (Name: `DATABASE_URL`):

```env
DATABASE_URL="mysql://u931854669_aapno_khano:RudraWebX%4012@srv2143.hstgr.io:3306/u931854669_aapno_khano"
```

Or using the direct IP:
```env
DATABASE_URL="mysql://u931854669_aapno_khano:RudraWebX%4012@195.35.61.22:3306/u931854669_aapno_khano"
```

---

## 3. Remote MySQL in Hostinger hPanel

1. Open **Hostinger hPanel** (`https://hpanel.hostinger.com`).
2. Go to **Databases** ➔ **Remote MySQL**.
3. In **Create remote database connection**:
   * IP बॉक्स खाली रखें और दाईं तरफ **"Any Host"** चेकबॉक्स पर टिक (`✓`) लगाएं।
   * **Database**: `u931854669_aapno_khano` चुनें।
4. **Create** बटन दबाएं।

---

## 4. Run Migration to Create All 32 Database Tables

Run this in your terminal:

```bash
# Creates all 32 tables directly in your Hostinger MySQL Database:
npx prisma db push
```

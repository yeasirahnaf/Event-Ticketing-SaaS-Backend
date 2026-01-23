# Backend & Database Deployment Guide

This guide covers deploying the **NestJS Backend** to **Render** and the **PostgreSQL Database** to **Neon**.

## Part 1: Database Setup (Neon)

1.  **Create Account:** Go to [Neon.tech](https://neon.tech) and sign up.
2.  **New Project:** Create a project named `ticketbd-prod`.
3.  **Get Connection String:**
    - On the dashboard, look for the **Connection String**.
    - Ensure "Pooled connection" is checked (optional but recommended for serverless).
    - Copy the implementation, it looks like: `postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`.
    - **Save this string**, you will need it as `DATABASE_URL`.

## Part 2: Backend Deployment (Render)

1.  **Push Code:** Ensure your latest code is pushed to GitHub.
2.  **Create Service:**
    - Go to [Render.com](https://render.com).
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository `Event-Ticketing-SaaS-Backend`.
3.  **Configure Service:**
    - **Name:** `ticketbd-api` (or similar)
    - **Region:** Choose one close to you (e.g., Singapore or Oregon).
    - **Branch:** `main` (or your working branch).
    - **Root Directory:** `.` (leave generic or empty).
    - **Runtime:** `Node`
    - **Build Command:** `npm install && npm run build`
    - **Start Command:** `npm run start:prod`
4.  **Environment Variables:**
    - Scroll down to "Environment Variables" and click **Add Environment Variable**.
    - ADD: `DATABASE_URL` = (Paste the Neon connection string from Part 1).
    - ADD: `JWT_SECRET` = (Generate a random strong secret).
    - ADD: `PORT` = `3000` (Render sets this automatically, but good to be explicit/aware).
    - *Add other secrets from your local .env (e.g. EMAIL_USER, PUSHER_KEY, etc).*
5.  **Deploy:** Click **Create Web Service**.

## Verification

- Wait for the build to finish.
- Setup can take a few minutes.
- Once "Live", click the URL (e.g., `https://ticketbd-api.onrender.com`).
- You should see the "Hello World" or API root message.

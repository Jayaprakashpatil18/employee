# Cloud Deployment & Infrastructure Guide

This guide provides instructions for deploying the **Employee Onboarding Platform** to cloud infrastructure.

---

## 1. Deployment Architecture

```text
┌─────────────────────────┐          ┌─────────────────────────┐
│     Vercel Platform     │          │    Railway / Render     │
│   Next.js 14 Frontend   │ ──REST──►│     NestJS API Host     │
│ (https://app.domain.com)│          │(https://api.domain.com) │
└─────────────────────────┘          └────────────┬────────────┘
                                                  │
                                 ┌────────────────┼────────────────┐
                                 │                │                │
                                 ▼                ▼                ▼
                        ┌────────────────┐ ┌──────────────┐ ┌──────────────┐
                        │   Managed DB   │ │ Managed Redis│ │   AWS S3     │
                        │ (PostgreSQL)   │ │  (Upstash)   │ │  Private     │
                        └────────────────┘ └──────────────┘ └──────────────┘
```

---

## 2. Frontend Deployment (Vercel)

1. Connect the repository to Vercel.
2. Set root directory to `frontend`.
3. Configure Build Settings:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Configure Environment Variables:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   ```
5. Deploy project and configure custom domain (e.g., `https://onboarding.yourcompany.com`).

---

## 3. Backend API Deployment (Railway / Render / AWS ECS)

1. Create a Web Service targeting `backend/`.
2. Build & Start Commands:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start:prod`
3. Configure Environment Variables:
   ```env
   NODE_ENV=production
   PORT=4000
   FRONTEND_URL=https://onboarding.yourcompany.com
   DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
   REDIS_URL=rediss://default:pass@redis-host:6379
   CLERK_SECRET_KEY=sk_live_...
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_123456789
   ```

---

## 4. Managed PostgreSQL Setup (Supabase / AWS RDS / Aiven)

1. Provision PostgreSQL 14+ database instance.
2. Obtain connection string with SSL mode enabled (`?sslmode=require`).
3. Execute database migrations from CI/CD pipeline:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

---

## 5. Managed Redis Setup (Upstash / Redis Cloud)

1. Provision Redis instance.
2. Export `REDIS_URL` with TLS support (`rediss://...`).
3. Connect NestJS background worker instances to Redis.

---

## 6. AWS S3 Private Storage Setup

1. Create S3 Bucket (e.g., `company-employee-documents-prod`).
2. Enable "Block all public access" setting.
3. Configure IAM User / Role with least-privilege policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
         "Resource": "arn:aws:s3:::company-employee-documents-prod/*"
       }
     ]
   }
   ```
4. Set AWS credentials in backend environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`).

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


#  FeedPulse — AI-Powered Product Feedback Platform

FeedPulse is a full-stack web application that lets teams collect product feedback and uses **Google Gemini AI** to automatically categorise, prioritise, and summarise submissions — giving product teams instant clarity on what to build next.

![Feedback Form](screenshots/feedback-form.png)
![Admin Dashboard](screenshots/dashboard.png)

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI | Google Gemini 1.5 Flash API |
| Auth | JWT (JSON Web Tokens) |

---

##  How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB running locally
- Google Gemini API Key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/feedpulse.git
cd feedpulse
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file inside `/backend`:
```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/feedpulse
JWT_SECRET=feedpulse_super_secret_key_2024
GEMINI_API_KEY=your_gemini_api_key_here
```
```bash
npm run dev
```
Backend runs on `http://localhost:4000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env.local` file inside `/frontend`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
```bash
npm run dev
```
Frontend runs on `http://localhost:3000`

---

##  Environment Variables

### Backend (`/backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | Backend server port (default: 4000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT token signing |
| `GEMINI_API_KEY` | Google Gemini AI API key |

### Frontend (`/frontend/.env.local`)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## 📱 Features

###  Must-Have (All Completed)
- Public feedback submission form with validation
- Google Gemini AI auto-analysis (category, sentiment, priority, tags)
- Protected admin dashboard with JWT auth
- Filter by category and status
- Update feedback status (New → In Review → Resolved)
- Delete feedback
- Pagination (10 items per page)
- Consistent REST API responses

###  Nice-to-Have (Completed)
- Character counter on description field
- Sort by date, priority
- Keyword search across title and summary
- Stats bar (total, open, avg priority)
- Sentiment badge on each feedback card

---

##  API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/feedback` | Submit new feedback | ❌ |
| GET | `/api/feedback` | Get all feedback (filters + pagination) | ✅ |
| PATCH | `/api/feedback/:id` | Update feedback status | ✅ |
| DELETE | `/api/feedback/:id` | Delete feedback | ✅ |
| POST | `/api/auth/login` | Admin login | ❌ |

---

##  Database Schema
```javascript
Feedback {
  title: String (required, max 120)
  description: String (required, min 20)
  category: Enum [Bug, Feature Request, Improvement, Other]
  status: Enum [New, In Review, Resolved]
  submitterName: String (optional)
  submitterEmail: String (optional)
  ai_category: String
  ai_sentiment: String [Positive, Neutral, Negative]
  ai_priority: Number (1–10)
  ai_summary: String
  ai_tags: [String]
  ai_processed: Boolean
  createdAt: Date
  updatedAt: Date
}
```

---

##  What I Would Build Next

Given more time, I would add:
- **Real-time updates** using WebSockets — dashboard auto-refreshes when new feedback arrives
- **Email notifications** — notify admin when high-priority feedback is submitted
- **Analytics charts** — visual graphs for feedback trends over time
- **Docker setup** — single `docker-compose up` to run everything
- **Unit tests** with Jest for all API endpoints
- **User accounts** — allow submitters to track their feedback status

---

##  Admin Credentials (Demo)
```
Email:    admin@feedpulse.com
Password: admin123
```
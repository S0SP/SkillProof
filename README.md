# SkillProof

SkillProof is a multilingual (English/Hindi) mobile-first assessment app for blue-collar trades. It uses AI voice recognition and image analysis to score worker knowledge and sends it to an Assessor dashboard for final approval.

## Requirements
- Node.js v18+
- Groq API Key (for LLM scoring)
- Supabase Account (for PostgreSQL & Image Storage)

## Setup
1. **Clone the repository** and navigate to the `SkillProof` folder.
2. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Configure Environment Variables:**
   In `backend/.env`, include:
   ```env
   PORT=3001
   AI_SECRET_KEY=gsk_your_groq_api_key_here
   ASSESSOR_PASSWORD=skill123
   SUPABASE_URL=https://<your_project_id>.supabase.co
   SUPABASE_SERVICE_KEY=<your_supabase_service_key>
   ```
4. **Database Setup:**
   Run the SQL provided in `supabase_schema.sql` inside your Supabase SQL Editor to create the necessary tables. Create a storage bucket called `proofs` and make it public.

## How to Run Locally
1. Start the backend:
   ```bash
   cd backend
   node server.js
   ```
2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```
   Open the Local network URL shown in the terminal on your mobile device (on the same Wi-Fi) to test the mic/camera!

## Demo Tools & Resetting Data
- **Demo Mode**: On the main Test screen, tap the "SkillProof" logo in the top blue bar exactly **5 times**. It will automatically fill the text box with a perfect Hindi answer to speed up your demonstrations!
- **Seed Data**: If you want to populate the Assessor Dashboard with sample tests (Beginner, Skilled, and Expert levels), you can run:
  ```bash
  cd backend
  node seed_data.js
  ```
  *(Note: this creates fake workers and answers in your Supabase DB. You can reset everything by deleting the rows in your Supabase dashboard.)*
- **Assessor Password**: `skill123`

## Deploying to Production (Live Link)
To deploy this online with HTTPS (required for Microphone and Camera access):

1. **Backend (Render / Heroku / Railway):**
   - Push your code to GitHub.
   - Connect the repo to Render as a "Web Service".
   - Set the Root Directory to `backend` and start command to `node server.js`.
   - Add all 5 `.env` variables in the Render Environment Variables tab.
2. **Frontend (Vercel / Netlify):**
   - Open `frontend/src/App.jsx` and replace all instances of `http://localhost:3001` with your live Render backend URL.
   - Connect the repo to Vercel.
   - Set the Root Directory to `frontend`. It will automatically build and deploy your app with SSL/HTTPS out of the box!

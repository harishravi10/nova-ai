# NOVA AI — Complete Production Deployment Guide

This guide walks you step-by-step through deploying **NOVA AI** to production:
- **Database & Auth & Storage**: Supabase
- **Backend (Python FastAPI)**: Vercel Serverless
- **Frontend (React + Vite)**: Netlify

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:
1. A [GitHub](https://github.com/) account with this repository pushed.
2. A [Supabase](https://supabase.com/) account (Free tier works great).
3. A [Vercel](https://vercel.com/) account.
4. A [Netlify](https://netlify.com/) account.
5. An AI Provider API Key:
   - **Google Gemini API Key** (Recommended: [Google AI Studio](https://aistudio.google.com/app/apikey))
   - OR **OpenAI API Key** ([OpenAI Platform](https://platform.openai.com/api-keys))
   - OR **Groq API Key** ([Groq Console](https://console.groq.com/keys))

---

## 🗄️ Step 1: Set Up Supabase (Database, Auth & Storage)

### 1.1 Create a New Supabase Project
1. Log in to [Supabase](https://app.supabase.com) and click **New project**.
2. Give it a name (e.g. `nova-ai`) and set a strong database password.
3. Choose a region close to your target users and wait ~2 minutes for initialization.

### 1.2 Run Database Migration
1. In your Supabase dashboard, click the **SQL Editor** tab (icon on the left).
2. Click **+ New query**.
3. Open `backend/schema.sql` from your project, copy all contents, and paste it into the editor.
4. Click **Run** (or `Ctrl + Enter`).
5. Verify output shows `Success. No rows returned`.
   *(This creates tables: `profiles`, `conversations`, `messages`, `attachments`, `user_settings`, `token_usage_stats`, RLS policies, automated triggers, and the `chat-attachments` storage bucket).*

### 1.3 Verify Storage Bucket
1. Go to **Storage** in the left menu.
2. You will see the bucket named `chat-attachments` created automatically.
3. If public access is desired for shared image previews, ensure **Public bucket** is checked.

### 1.4 Get Supabase API Credentials
1. Go to **Project Settings** (gear icon at bottom left) -> **API**.
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijkl.supabase.co`)
   - **anon / public key** (Client key for frontend)
   - **service_role key** (Secret backend key; never share publicly!)
   - **JWT Secret** (under JWT Settings)

---

## ⚡ Step 2: Deploy Backend to Vercel (FastAPI Serverless)

### 2.1 Import Repository into Vercel
1. Log into your [Vercel Dashboard](https://vercel.com) and click **Add New...** -> **Project**.
2. Select your Git repository containing NOVA AI.
3. In the configuration screen:
   - **Framework Preset**: `Other`
   - **Root Directory**: Click `Edit` and select `backend`.

### 2.2 Configure Backend Environment Variables in Vercel
In the **Environment Variables** section on Vercel, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `production` | Set environment mode |
| `SUPABASE_URL` | `https://abcdefghijkl.supabase.co` | Your Supabase Project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase secret service role key |
| `SUPABASE_JWT_SECRET` | `your-jwt-secret` | Supabase JWT secret |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
| `OPENAI_API_KEY` | `sk-...` | *(Optional if using Gemini)* |
| `GROQ_API_KEY` | `gsk_...` | *(Optional if using Gemini)* |
| `DEFAULT_MODEL` | `nova-ai` | Default fallback model |

### 2.3 Deploy
1. Click **Deploy**.
2. Once the build finishes (~1 minute), Vercel will give you a production URL:
   `https://nova-ai-backend.vercel.app` (example).
3. Test your backend by visiting in your browser:
   `https://nova-ai-backend.vercel.app/`
   You should see:
   `{"status":"online","service":"NOVA AI API","version":"1.0.0","tagline":"Think. Ask. Create."}`

---

## 🌐 Step 3: Deploy Frontend to Netlify (React + Vite)

### 3.1 Import Repository into Netlify
1. Log into your [Netlify Dashboard](https://app.netlify.com) and click **Add new site** -> **Import an existing project**.
2. Connect your Git provider and select your repository.

### 3.2 Configure Build Settings
Netlify will automatically detect `netlify.toml`, but confirm these settings:
- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`

### 3.3 Set Frontend Environment Variables in Netlify
In **Site configuration** -> **Environment variables**, add:

| Key | Example Value | Notes |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://abcdefghijkl.supabase.co` | Public Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Public Anonymous Key |
| `VITE_API_URL` | `https://nova-ai-backend.vercel.app/api` | **Your Vercel Backend URL + `/api`** |

### 3.4 Deploy
1. Click **Deploy site**.
2. Netlify builds the app using Node 20 and deploys to a custom domain:
   `https://nova-ai-app.netlify.app`.

---

## 🔒 Step 4: Configure CORS & Auth Redirects

### 4.1 Update Supabase Authentication URL
1. In your Supabase Dashboard, go to **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your Netlify URL (e.g. `https://nova-ai-app.netlify.app`).
3. Under **Redirect URLs**, add:
   - `https://nova-ai-app.netlify.app/**`
   - `http://localhost:5173/**`

---

## ✅ Step 5: End-to-End Verification

1. **Visit your Netlify site** (`https://nova-ai-app.netlify.app`).
2. **Sign In / Guest Mode**:
   - Click "Sign In" to create an account with email/password, OR
   - Click "Continue as Guest" to test immediately.
3. **Ask a Question**:
   - Send: `"How does TCP work?"`
   - Verify real-time typewriter streaming response with headings, tables, and code snippets.
4. **Test Model Switcher**:
   - Change model to **NOVA AI Reasoning** and ask: `"Java Binary search implementation"`.
   - Verify response has Java syntax formatting and the 1-click **Copy Code** button.
5. **Test Settings & Analytics**:
   - Click the gear icon at the bottom of the sidebar.
   - Switch to the **Usage & Analytics** tab to see your **Recharts** token usage charts.
6. **Test File Upload**:
   - Click `[ + ]` in the composer and upload a code file or PDF.
   - Ask the AI to summarize or review the file.

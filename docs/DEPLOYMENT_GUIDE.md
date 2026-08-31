# Smart Rental Platform - Production Deployment Guide

This guide walks you through deploying the complete Smart Rental platform (React Frontend, Node.js Backend, and Python FastAPI ML Microservice) to the cloud for free with zero maintenance.

---

## 🚀 Option 1: 1-Click Blueprint Deployment on Render.com (Recommended & Free)

Render supports automatic multi-service deployment directly using the included [`render.yaml`](../render.yaml) file.

### Steps:
1. Go to **[https://render.com](https://render.com)** and sign up / log in with your **GitHub account**.
2. Click **New +** in the top-right corner and select **Blueprint**.
3. Select your repository:  
   **`kupendra267/Smart-Rental-House-Management-and-Discovery-Platform`**
4. Render will automatically detect `render.yaml` and configure:
   - 🎨 **Frontend**: `smart-rental-frontend` (Static React App)
   - 🔌 **Backend**: `smart-rental-backend` (Node.js API Server)
   - 🧠 **AI Service**: `smart-rental-ml` (Python FastAPI Microservice)
5. Click **Apply**. Render will automatically build and deploy all services with live public HTTPS URLs!

---

## ⚡ Option 2: Deploy Frontend on Vercel + Backend on Render

If you prefer using **Vercel** for the React Frontend:

### A. Deploy Backend on Render:
1. Go to **[render.com](https://render.com)** $\rightarrow$ **New Web Service**.
2. Connect `Smart-Rental-House-Management-and-Discovery-Platform`.
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Copy your backend live URL (e.g. `https://smart-rental-backend.onrender.com`).

### B. Deploy Frontend on Vercel:
1. Go to **[https://vercel.com](https://vercel.com)** $\rightarrow$ **Add New Project**.
2. Import `kupendra267/Smart-Rental-House-Management-and-Discovery-Platform`.
3. Set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://smart-rental-backend.onrender.com` (Your Render backend URL)
5. Click **Deploy**. Vercel will build and give you an instant live URL (e.g. `https://smart-rental.vercel.app`).

---

## 🐳 Option 3: Deploy via Docker / VPS (AWS EC2 / DigitalOcean / Linode)

To deploy on any Linux Virtual Private Server (VPS):

```bash
# 1. Clone repository
git clone https://github.com/kupendra267/Smart-Rental-House-Management-and-Discovery-Platform.git
cd Smart-Rental-House-Management-and-Discovery-Platform

# 2. Start all containers with Docker Compose
docker-compose up -d --build
```

All 4 services will run securely in isolated containers:
- Frontend on `http://YOUR_SERVER_IP:5173` (or port 80 via reverse proxy)
- Backend on `http://YOUR_SERVER_IP:5000`
- AI Microservice on `http://YOUR_SERVER_IP:8000`
- PostgreSQL Database on `port 5432`

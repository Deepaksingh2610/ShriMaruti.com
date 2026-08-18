# ShriMaruti.com — Full-Stack E-Commerce Platform 🎁

India's premier online gifting, spiritual & luxury decor platform built with React 18 (Vite) + Node.js (Express) + MongoDB Atlas + Cloudinary.

---

## 🗂 Project Structure

```
shrimaruti/
├── client/          # React 18 (Vite + Tailwind CSS v4) Frontend
├── server/          # Node.js + Express REST API Backend
├── render.yaml      # Render Blueprint deployment configuration
└── .gitignore       # Root git ignore (excludes secrets, node_modules, build outputs)
```

---

## 🚀 Deployment on Render

### Option A: 1-Click Blueprint (Recommended)
1. Push this repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) → **Blueprints** → **New Blueprint Instance**.
3. Select your repository `Deepaksingh2610/ShriMaruti.com`.
4. Fill in the required environment variables prompted by Render.
5. Click **Apply**.

---

### Option B: Manual Service Creation

#### 1. Backend Web Service (Node.js API)
- **Service Type**: `Web Service`
- **Name**: `shrimaruti-api`
- **Region**: Singapore or nearest to your users
- **Branch**: `master` or `main`
- **Root Directory**: `server`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: `Free` or `Starter`

**Required Backend Environment Variables:**
| Variable | Description | Example / Notes |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Web port (Render sets this automatically) | `10000` |
| `CLIENT_URL` | Frontend URL for CORS | `https://your-frontend.onrender.com` |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://...` |
| `JWT_SECRET` | JWT Access Token Secret | Generate strong random string (min 64 chars) |
| `JWT_EXPIRE` | Token expiry | `15m` |
| `REFRESH_TOKEN_SECRET` | Refresh Token Secret | Generate strong random string (min 64 chars) |
| `REFRESH_TOKEN_EXPIRE` | Refresh Token expiry | `7d` |
| `ADMIN_EMAIL` | Auto-seeded Admin Email | `admin@shrimaruti.com` |
| `ADMIN_PASSWORD` | Auto-seeded Admin Password | Strong password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | From Cloudinary Console |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | From Cloudinary Console |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | From Cloudinary Console |
| `BREVO_API_KEY` | Brevo API Key for OTP & Emails | From Brevo Dashboard |
| `BREVO_SENDER_EMAIL` | Verified Brevo Sender Email | e.g. `support@yourdomain.com` |
| `BREVO_SENDER_NAME` | Sender display name | `ShriMaruti` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | From Google Cloud Console |
| `RAZORPAY_KEY_ID` | Razorpay Key ID | From Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret | From Razorpay Dashboard |

---

#### 2. Frontend Static Site (React + Vite)
- **Service Type**: `Static Site`
- **Name**: `shrimaruti-web`
- **Branch**: `master` or `main`
- **Root Directory**: `client`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Required Frontend Environment Variables:**
| Variable | Description | Value |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `https://your-backend-api.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | Same Google Client ID as backend |

> **Note on SPA Routing**: `client/public/_redirects` is already included to ensure React Router paths (e.g. `/admin`, `/products`, `/help-center`) work smoothly on refresh without 404 errors.

---

## ⚡ Local Development Setup

### 1. Prerequisites
- Node.js >= 18
- MongoDB Atlas account or local MongoDB instance
- Cloudinary account

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
cp .env.example .env.local
# Edit .env.local if needed
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🛡 Security & Best Practices Implemented
- ✅ SHA-256 Content-Hash Image Deduplication (prevents duplicate Cloudinary storage consumption)
- ✅ Production CORS allowlist with fallback for local dev
- ✅ Helmet security headers & cookie protection
- ✅ Role-Based Access Control (`admin`, `support`, `user`)
- ✅ Rate limiting on authentication, OTPs, and coupon validations
- ✅ Graceful fallback caching layer for high concurrency (10,000+ users)
- ✅ React Router SPA routing configuration for Render Static Site
- ✅ Comprehensive audit log & centralized error handling

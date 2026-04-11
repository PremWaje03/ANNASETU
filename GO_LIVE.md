# 🚀 ANNASETU LIVE DEPLOYMENT - COMPLETE GUIDE

Your Annasetu project is ready to go live! Follow these steps exactly in order.

---

## 📋 DEPLOYMENT OVERVIEW

**Stack:**
- 🎨 **Frontend:** React + Vite → Deployed to **Vercel**
- 🔧 **Backend:** Spring Boot Java → Deployed to **Railway**
- 💾 **Database:** MySQL → Hosted on **PlanetScale**

**Timeline:** 45-60 minutes total

---

## 🟦 STEP 1: GitHub Repository (5 minutes)

### What you'll do:
Create a GitHub repository and push your code

### Steps:

**1.1** Go to https://github.com/new

**1.2** Fill in:
```
Repository name: annasetu
Description: Food Donation Management System
Visibility: Public
```

**1.3** Click "Create repository" (Do NOT initialize with README)

**1.4** You'll see Quick Setup page. Copy the lines that say:
```
git remote add origin https://github.com/YOUR_USERNAME/annasetu.git
git branch -M main
git push -u origin main
```

**1.5** Open PowerShell and run:
```powershell
cd d:\ANNASETU
git remote add origin https://github.com/YOUR_USERNAME/annasetu.git
git branch -M main
git push -u origin main
```

✅ **Done:** Your code is now on GitHub!

---

## 🟩 STEP 2: PlanetScale Database Setup (10 minutes)

### What you'll do:
Create a MySQL database in the cloud

### Steps:

**2.1** Go to https://planetscale.com

**2.2** Click "Sign up" → Choose "Sign up with GitHub" (easier)

**2.3** Click "Create a new database"
```
Database name: annasetu
Region: US-East (pick closest to you)
```

**2.4** Click "Create Database"

**2.5** You'll see your dashboard. Click the database name "annasetu"

**2.6** Click the green "Connect" button

**2.7** Select "Spring Boot" from the dropdown

**2.8** Copy the entire connection string that looks like:
```
mysql://xxxxx:XXXXXX@aws.connect.psdb.cloud/annasetu?sslAccept=strict
```

**📌 SAVE THIS! You'll need it for Railway**

**2.9** Click on "Branches" tab

**2.10** Click "main branch" → Click blue "Connect" → Select "MySQL CLI"

**2.11** Now you need to import your database schema. Go back to main branch view.

**2.12** You'll see an option to run SQL. Open your terminal:
```powershell
# Option 1: Use the connection string from PlanetScale directly
# (They'll provide a connection command in the GUI)

# Option 2: If you have MySQL CLI installed locally:
mysql -h YOUR_PLANETSCALE_HOST -u YOUR_USERNAME --password
# Then paste the schema
```

**2.13** Go to [database/schema.sql](database/schema.sql) in your project, copy all the content, and paste it in the MySQL CLI or PlanetScale GUI

✅ **Done:** Your database is set up!

---

## 🟨 STEP 3: Railway Backend Deployment (15 minutes)

### What you'll do:
Deploy the Java backend to Railway

### Steps:

**3.1** Go to https://railway.app

**3.2** Click "Start New Project"

**3.3** Select "Deploy from GitHub repo"

**3.4** Choose "Authorize Railway" and connect your GitHub account

**3.5** Select the `annasetu` repository

**3.6** Railway will auto-detect it's a Java/Maven project ✨

**3.7** Wait for build to start (~2-3 minutes)

**3.8** While it builds, set up environment variables:
- Click ⚙️ Settings
- Scroll to "Environment Variables"
- Add these one by one:

```
SPRING_DATASOURCE_URL = mysql://YOUR_PLANETSCALE_CONNECTION_STRING
SPRING_DATASOURCE_USERNAME = (extract from connection string - before @ symbol)
SPRING_DATASOURCE_PASSWORD = (extract from connection string - between : and @)
SPRING_JPA_HIBERNATE_DDL_AUTO = validate
SPRING_PROFILES_ACTIVE = prod
JAVA_TOOL_OPTIONS = -Xmx512m
```

**Example parsing:**
If your PlanetScale string is:
```
mysql://user123:pass456@aws.connect.psdb.cloud/annasetu
```
Then:
- SPRING_DATASOURCE_USERNAME = `user123`
- SPRING_DATASOURCE_PASSWORD = `pass456`
- SPRING_DATASOURCE_URL = `jdbc:mysql://aws.connect.psdb.cloud:3306/annasetu?useSSL=true&serverTimezone=UTC`

**3.9** Railway will deploy automatically

**3.10** When build succeeds, go to "Deploy" tab

**3.11** Copy your Railway URL - it will look like:
```
https://annasetu-backend-prod-xxxxxxx.railway.app
```

**📌 SAVE THIS! You need it for Vercel**

✅ **Done:** Your backend is live!

---

## 🟪 STEP 4: Update Backend CORS for Vercel (5 minutes)

### What you'll do:
Allow your Vercel frontend to talk to Railway backend

### Steps:

**4.1** Open `backend/src/main/java/com/annasetu/config/SecurityConfig.java`

**4.2** Find the CORS configuration section

**4.3** In the `allowedOrigins`, add these:
```java
config.setAllowedOrigins(Arrays.asList(
    "https://annasetu.vercel.app",  // Add this
    "https://*.vercel.app",          // Add this (matches preview deployments)
    "http://localhost:3000"          // This should already exist
));
```

**4.4** Save the file

**4.5** Commit and push:
```powershell
cd d:\ANNASETU
git add .
git commit -m "Configure CORS for Vercel frontend"
git push
```

**4.6** Railway will automatically rebuild with the new CORS settings (wait ~5 minutes)

✅ **Done:** Backend is CORS-enabled!

---

## 🟧 STEP 5: Vercel Frontend Deployment (15 minutes)

### What you'll do:
Deploy the React frontend to Vercel

### Steps:

**5.1** Go to https://vercel.com

**5.2** Click "Sign Up" → "Continue with GitHub"

**5.3** Authorize Vercel to access your GitHub repositories

**5.4** Click "New Project"

**5.5** Select `annasetu` repository

**5.6** Vercel will show project settings:
```
Framework: Vite (auto-selected)
Root Directory: ./frontend
Build Command: npm run build
Output Directory: dist
```

**5.7** Before clicking "Deploy", add Environment Variables:

Click "Environment Variables" section and add:
```
VITE_API_URL = https://YOUR_RAILWAY_URL.railway.app
```

(Use the URL you saved from Step 3.11)

**5.8** Click "Deploy" button

**5.9** Vercel will build and deploy (3-5 minutes)

**5.10** When done, click "Visit" to see your live site!

**5.11** Copy your Vercel URL:
```
https://annasetu.vercel.app
```

✅ **Done:** Your frontend is live!

---

## ✅ STEP 6: Test Everything (10 minutes)

### What you'll do:
Make sure everything works together

### Tests:

**6.1** Test Backend API
```
Open in browser or Postman:
https://YOUR_RAILWAY_URL.railway.app/api/health
```
Should return: `200 OK`

**6.2** Test Frontend
```
Open: https://annasetu.vercel.app
```
Should load your React app

**6.3** Test Login Flow
1. Go to your Vercel URL
2. Try to create an account
3. Fill in details and submit
4. Check if you get logged in
5. Open browser DevTools (F12) → Console
6. Should see no red errors

**6.4** Test Database
1. Log in successfully
2. Go to PlanetScale dashboard
3. Click database
4. Click "Insights" tab
5. Should see connection activity (green bar)

**6.5** Verify API Communication
1. In your app, make a request (like loading donation list)
2. Open DevTools (F12) → Network tab
3. Should see requests to `YOUR_RAILWAY_URL.railway.app/api/...`
4. Status should be `200`

---

## 🎉 YOU'RE LIVE!

**Your Live URLs:**

Frontend: https://annasetu.vercel.app

Backend API: https://YOUR_RAILWAY_URL.railway.app/api

**Share with world:**
```
Check out Annasetu - Food Donation Management System!
Live at: https://annasetu.vercel.app
```

---

## 📱 Monitoring & Maintenance

### Check Logs

**Railway Backend Logs:**
1. Go to https://railway.app
2. Select your backend service
3. Click "Logs" tab
4. See real-time logs

**Vercel Frontend Logs:**
1. Go to https://vercel.com
2. Select annasetu project
3. Click "Deployments" tab
4. See build/deployment history

**PlanetScale Database:**
1. Go to https://planetscale.com
2. Click your database
3. Click "Insights"
4. See query performance

---

## 🔧 Auto-Deployments

Once set up, deployments are automatic:

✨ **Push to GitHub** → **Auto-deploys everywhere**
- Commit to `main` branch
- Pushed to GitHub
- Railway rebuilds backend
- Vercel rebuilds frontend
- Live in 5-10 minutes

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Frontend loads but can't login | Check VITE_API_URL env var in Vercel matches Railway URL exactly |
| CORS error in console | Backend CORS config might not be redeplored yet. Wait 5 min and refresh |
| Database connection error | Check PlanetScale connection string is in Railway env vars (with jdbc: prefix) |
| Railway build fails | Check Java version is 17 in pom.xml |
| Vercel shows 404 on routes | React router might not be configured for SPA. Check vite.config.js |

For detailed troubleshooting, see: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## 📖 Additional Resources

- [Full Deployment Guide](DEPLOYMENT_GUIDE.md) - Detailed setup for all platforms
- [Quick Start](QUICK_START.md) - Quick reference checklist
- [README.md](README.md) - Project overview

---

**Questions?** Check the detailed guides above or review the original DEPLOYMENT_GUIDE.md file!

Good luck! 🚀

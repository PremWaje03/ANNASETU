# 🚀 ANNASETU LIVE DEPLOYMENT - STEP-BY-STEP EXECUTION

**GitHub:** ✅ DONE - Code pushed to https://github.com/PremWaje03/ANNASETU

---

## 🟩 STEP 2: PlanetScale Database Setup (10 minutes)

### What to do:
1. Go to **https://planetscale.com**

2. Click "Sign up" → Select "Sign up with GitHub"

3. Authorize with your GitHub account (PremWaje03)

4. Click "Create a new database"
   ```
   Database name: annasetu
   Region: US-East (or closest to you)
   ```

5. Click "Create Database"

6. Once created, click the green **"Connect"** button

7. Select **"Spring Boot"** from the dropdown menu

8. Copy the connection string (looks like):
   ```
   mysql://xxxxx:PASSWORD@aws.connect.psdb.cloud/annasetu?sslAccept=strict
   ```
   
   **⚠️ SAVE THIS SOMEWHERE - You'll need it for Railway!**

9. Import the database schema:
   - Go back to your database dashboard
   - Look for "Branches" section
   - You'll see an option to run SQL queries
   - Open the file: `database/schema.sql` from your Annasetu project
   - Copy all SQL content and paste it in PlanetScale's SQL editor
   - Click "Execute"

10. Verify: You should see tables created in PlanetScale

**📌 Save your connection string - You need it for next step!**

---

## 🟨 STEP 3: Railway Backend Deployment (15 minutes)

### What to do:

1. Go to **https://railway.app**

2. Click "Start New Project"

3. Select **"Deploy from GitHub repo"**

4. Click "Authorize Railway"
   - Connect to your GitHub account
   - It will ask for permissions - Click "Authorize"

5. Select repository: **PremWaje03/ANNASETU**

6. Railway will auto-detect Java/Maven project ✨
   - **Wait for build to start** (shows progress)

7. **While it builds**, set environment variables:
   - Click on your service in Railway
   - Go to **"Settings"** tab
   - Scroll to **"Environment Variables"**
   - Click **"Add Variable"** and add these ONE BY ONE:

   ```
   Variable Name: SPRING_DATASOURCE_URL
   Value: (Your PlanetScale connection string from Step 2)
   
   Variable Name: SPRING_DATASOURCE_USERNAME
   Value: (Extract from connection string - the part BEFORE the @)
   Example: If your string is "mysql://user123:pass@...", then use "user123"
   
   Variable Name: SPRING_DATASOURCE_PASSWORD
   Value: (Extract from connection string - the part BETWEEN : and @)
   Example: If your string is "mysql://user123:pass123@...", then use "pass123"
   
   Variable Name: SPRING_JPA_HIBERNATE_DDL_AUTO
   Value: validate
   
   Variable Name: SPRING_PROFILES_ACTIVE
   Value: prod
   
   Variable Name: JAVA_TOOL_OPTIONS
   Value: -Xmx512m
   ```

8. Click "Deploy" and wait for build to complete (5-10 minutes)

9. Once deployed, go to **"Deploy"** tab and copy your Railway URL:
   ```
   Example: https://annasetu-backend-prod-xxxxxx.railway.app
   ```

   **📌 SAVE THIS URL - You need it for Vercel!**

10. Test it works by opening in browser:
    ```
    https://YOUR_RAILWAY_URL.railway.app/api/health
    ```
    Should show `200 OK` or `availability: UP`

---

## 🟪 STEP 4: Update Backend CORS for Vercel (Automatic)

This is already done in your code! ✅

The `SecurityConfig.java` is configured to allow:
- `https://*.vercel.app` (your frontend)
- `http://localhost:3000` (for local testing)

No action needed - Railway deployment already includes this.

---

## 🟧 STEP 5: Vercel Frontend Deployment (15 minutes)

### What to do:

1. Go to **https://vercel.com**

2. Click "Sign Up" → Select "Continue with GitHub"

3. Click "Authorize" to let Vercel access your repos

4. After authorizing, click **"New Project"**

5. Select **"ANNASETU"** repository

6. Vercel will show project settings:
   ```
   Framework: Vite (✓ correct)
   Root Directory: ./frontend (✓ correct)
   Build Command: npm run build (✓ correct)
   Output Directory: dist (✓ correct)
   ```

7. **BEFORE clicking Deploy** - Add Environment Variables:
   - Click on "Environment Variables" section
   - Add this variable:
     ```
     Name: VITE_API_URL
     Value: https://YOUR_RAILWAY_URL.railway.app
     (Use the URL you saved from Step 3.9)
     ```

8. Click **"Deploy"** button

9. Wait for build/deployment (~3-5 minutes)

10. Click **"Visit"** or the deployment URL to see your live site!

11. Your Vercel URL will be:
    ```
    https://annasetu.vercel.app
    ```
    (or custom domain if you configured one)

---

## ✅ STEP 6: Test Everything (10 minutes)

### Test Backend API
1. Open in your browser:
   ```
   https://YOUR_RAILWAY_URL.railway.app/api/health
   ```
   ✅ Should return `200 OK`

### Test Frontend
1. Go to:
   ```
   https://annasetu.vercel.app
   ```
   ✅ Should load your React app

### Test Login Flow
1. Click "Sign Up" or "Login"
2. Create a test account
3. Fill in details and submit
4. Should successfully log in
5. Open DevTools (F12) → Check Console tab
   ✅ Should see NO red errors

### Test Database Connection
1. After logging in, go to PlanetScale dashboard
2. Click your database
3. Click "Insights" tab
4. ✅ Should see green bars showing active connections

---

## 🎉 SUCCESS!

When all tests pass, you're LIVE! 🚀

**Your Production URLs:**
```
Frontend: https://annasetu.vercel.app
Backend API: https://YOUR_RAILWAY_URL.railway.app/api
Database: PlanetScale (connected via Railway)
```

---

## 📊 Auto-Deployment

From now on, when you push code to GitHub:
1. Railway will auto-build backend (5 min)
2. Vercel will auto-build frontend (3-5 min)
3. Everything updates automatically!

Just do:
```powershell
git add .
git commit -m "Your message"
git push
```

---

## 🆘 If Something Goes Wrong

| Issue | Fix |
|-------|-----|
| Railway build fails | Check pom.xml Java version is 17 |
| Connection refused error | Verify PlanetScale connection string is correct in Railway env vars |
| "Cannot GET /" on Vercel | Check VITE_API_URL is complete in Vercel env vars |
| CORS error in browser console | May need to wait 5 min for Railway to redeploy with new config |
| Database shows no tables | Re-run schema.sql in PlanetScale SQL editor |


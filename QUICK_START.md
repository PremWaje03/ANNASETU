# Quick Deployment Checklist for Annasetu

## ✅ What's Ready
- ✅ Git repository initialized locally
- ✅ All project files committed
- ✅ DEPLOYMENT_GUIDE.md created with detailed steps

---

## 📋 Next Steps (In Order)

### **1. CREATE GitHub Repository** (5 minutes)
```
1. Go to https://github.com/new
2. Repository name: annasetu
3. Description: Food Donation Management System
4. Choose: Public
5. Click "Create repository"
6. Copy the repository URL (e.g., https://github.com/YOUR_USERNAME/annasetu.git)
```

### **2. PUSH Code to GitHub** (1 minute)
```powershell
cd d:\ANNASETU
git remote add origin https://github.com/YOUR_USERNAME/annasetu.git
git branch -M main
git push -u origin main
```

### **3. CREATE PlanetScale Database** (5 minutes)
```
1. Go to https://planetscale.com
2. Sign up with GitHub
3. Create database named "annasetu"
4. Click "Connect" > Select "Spring Boot"
5. Copy the connection string (save it!)
6. Import schema: Upload database/schema.sql in PlanetScale GUI
```

### **4. DEPLOY Backend to Railway** (10 minutes)
```
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" > "Deploy from GitHub repo"
4. Select your annasetu repository
5. Railway will auto-detect Spring Boot
6. Add Environment Variables:
   - SPRING_DATASOURCE_URL=<your PlanetScale connection string>
   - SPRING_DATASOURCE_USERNAME=<from connection string>
   - SPRING_DATASOURCE_PASSWORD=<from connection string>
   - SPRING_JPA_HIBERNATE_DDL_AUTO=validate
7. Wait for build/deploy (~5-10 min)
8. Copy your Railway URL (e.g., annasetu-backend-*.railway.app)
```

### **5. UPDATE Backend CORS Settings** (2 minutes)
```java
File: backend/src/main/java/com/annasetu/config/SecurityConfig.java

In the CORS configuration, add your Vercel URL:
config.setAllowedOrigins(Arrays.asList(
    "https://annasetu.vercel.app",  // Add this line
    "http://localhost:3000"
));
```

Then commit and push:
```powershell
cd d:\ANNASETU
git add .
git commit -m "Update CORS for Vercel deployment"
git push
```

### **6. DEPLOY Frontend to Vercel** (10 minutes)
```
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Select your annasetu repository
5. Framework: Vite
6. Root Directory: ./frontend
7. Build Command: npm run build
8. Output Directory: dist
9. Add Environment Variable:
   - VITE_API_URL=https://<your-railway-url>.railway.app
10. Click "Deploy"
11. Wait for deployment (~2-3 min)
12. Copy your Vercel URL (e.g., annasetu.vercel.app)
```

---

## 🎉 After Deployment

### Test Everything Works:
1. **Backend API:**
   ```
   https://<your-railway-url>.railway.app/api/health
   ```
   Should return 200 OK

2. **Frontend:**
   ```
   https://annasetu.vercel.app
   ```
   Should load the React app

3. **Test login flow:**
   - Try signing up / logging in
   - Check browser console (F12) for errors
   - Verify data is saved in PlanetScale

---

## 📊 Live URLs After Deployment

- **Frontend (Vercel):** https://annasetu.vercel.app
- **Backend (Railway):** https://<railway-url>.railway.app/api
- **Database (PlanetScale):** Accessible via connection string

---

## 💡 Pro Tips

1. **Auto-Deploy on Push:** Vercel & Railway auto-deploy when you push to GitHub main branch
2. **Rollback if Needed:** Both platforms keep deployment history
3. **Environment Specific Variables:** You can set different variables for production/preview
4. **Monitoring:** Check Railway/Vercel dashboards for logs and performance metrics

---

## 🆘 Need Help?

Refer to the detailed DEPLOYMENT_GUIDE.md in the root directory for:
- Troubleshooting guide
- Detailed environment variables
- CORS configuration
- Database setup instructions

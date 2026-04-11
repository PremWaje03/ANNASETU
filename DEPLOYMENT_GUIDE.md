# Annasetu Live Deployment Guide
## Vercel + Railway + PlanetScale

Complete step-by-step guide to deploy Annasetu using modern cloud platforms.

---

## **Phase 1: GitHub Setup** ⏳

### Step 1.1: Initialize Git Repository
```bash
cd d:\ANNASETU
git init
git add .
git commit -m "Initial commit: Annasetu - Food Donation Management System"
```

### Step 1.2: Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Repository name: `annasetu`
3. Description: "Food Donation Management System"
4. Choose: Public (for easy linking with Vercel/Railway)
5. Click "Create repository"

### Step 1.3: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/annasetu.git
git branch -M main
git push -u origin main
```

**Status:** [ ] Complete

---

## **Phase 2: Database Setup (PlanetScale)** ⏳

### Step 2.1: Create PlanetScale Account
1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub (easier integration)
3. Create organization

### Step 2.2: Create Database
1. Click "Create a database"
2. Name: `annasetu`
3. Region: Choose closest to your users (US-East recommended)
4. Create branch: `main`

### Step 2.3: Get Connection String
1. From dashboard, click database `annasetu`
2. Click "Connect"
3. Select "Spring Boot" from dropdown
4. Copy the connection URL (format: `mysql://user:password@host/annasetu`)

**Save this connection string!**

### Step 2.4: Create Database Schema
```bash
# Option 1: Use PlanetScale GUI to upload schema
# Go to PlanetScale > Your database > Import SQL > Upload database/schema.sql

# Option 2: Use MySQL CLI locally (if installed)
mysql -h YOUR_PLANETSCALE_HOST -u YOUR_USERNAME --password
SOURCE /path/to/database/schema.sql;
```

**Status:** [ ] Complete

---

## **Phase 3: Backend Deployment (Railway)** ⏳

### Step 3.1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Connect GitHub account

### Step 3.2: Deploy Backend from GitHub
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect to your `annasetu` repository
4. Choose service: Create new service
5. Runtime: Java (auto-detected from pom.xml)

### Step 3.3: Configure Environment Variables in Railway
Add these variables:

```
SPRING_DATASOURCE_URL=your_planetscale_connection_string
SPRING_DATASOURCE_USERNAME=extracted_from_connection_string
SPRING_DATASOURCE_PASSWORD=extracted_from_connection_string
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT=org.hibernate.dialect.MySQL8Dialect
SPRING_PROFILES_ACTIVE=prod
SERVER_SERVLET_CONTEXT_PATH=/api
JAVA_TOOL_OPTIONS=-Xmx512m
```

**Note:** For PlanetScale, the connection URL format is:
```
jdbc:mysql://[username]:[password]@[host]/[database]?useSSL=true&serverTimezone=UTC
```

### Step 3.4: Build & Deploy
1. Railway will auto-build from pom.xml
2. Build command: `mvn clean package -DskipTests`
3. Start command: `java -jar target/backend-1.0.0.jar`
4. Wait for deployment completion (5-10 minutes)
5. Copy the Railway *.railway.app URL (e.g., `https://annasetu-backend-prod.railway.app`)

**Backend URL:** 

**Status:** [ ] Complete

---

## **Phase 4: Frontend Deployment (Vercel)** ⏳

### Step 4.1: Prepare Frontend for Production
Update [frontend/src/services/api.js](../frontend/src/services/api.js):

```javascript
// Import axios and setup base URL
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8081';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Step 4.2: Update Vite Config for Backend Communication
Update [frontend/vite.config.js](../frontend/vite.config.js):

```javascript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      }
    }
  }
})
```

### Step 4.3: Create .gitignore for Frontend (if not exists)
```
node_modules/
dist/
.env.local
.env.*.local
.DS_Store
*.log
*.pem
```

### Step 4.4: Create Vercel Configuration
Create [vercel.json](../vercel.json) in root directory:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "env": {
    "VITE_API_URL": "@annasetu_api_url"
  }
}
```

### Step 4.5: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "New Project"
4. Select your `annasetu` repository
5. Framework Preset: Vite
6. Root Directory: `./frontend`
7. Build Command: `npm run build`
8. Output Directory: `dist`

### Step 4.6: Add Environment Variables to Vercel
In Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add:
   - Name: `VITE_API_URL`
   - Value: `https://annasetu-backend-prod.railway.app` (your Railway URL)
   - Environments: Production, Preview, Development
3. Click Save & Redeploy

### Step 4.7: Configure CORS on Backend
Update [backend/src/main/java/com/annasetu/config/SecurityConfig.java](../backend/src/main/java/com/annasetu/config/SecurityConfig.java):

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(Arrays.asList(
                    "https://annasetu.vercel.app",
                    "https://*.vercel.app",
                    "http://localhost:3000"
                ));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("*"));
                config.setAllowCredentials(true);
                return config;
            }))
            .csrf(csrf -> csrf.disable())
            // ... rest of security config
            .build();
        
        return http.build();
    }
}
```

**Status:** [ ] Complete

---

## **Phase 5: Testing & Verification** ⏳

### Step 5.1: Test Backend API
```bash
# Replace YOUR_RAILWAY_URL with your Railway deployment URL
curl -X GET https://YOUR_RAILWAY_URL/api/health
```

### Step 5.2: Test Frontend
1. Visit your Vercel URL: `https://annasetu.vercel.app`
2. Try login functionality
3. Check browser console for errors (F12)
4. Verify API calls reach your Railway backend

### Step 5.3: Database Verification
1. Log in to PlanetScale dashboard
2. Check "Insights" tab for connection activity
3. Verify data is being inserted/read

**Status:** [ ] Complete

---

## **Phase 6: Post-Deployment Configurations** ⏳

### Step 6.1: Configure Custom Domain (Optional)
**For Vercel:**
1. Go to Project Settings > Domains
2. Add your custom domain (e.g., annasetu.com)
3. Update DNS records at your domain registrar

**For Railway:**
1. Go to Railway dashboard > Your backend service
2. Settings > Custom Domain
3. Add domain for backend API

### Step 6.2: Set Up Monitoring & Logging
**Vercel:** Built-in analytics at vercel.com/analytics

**Railway:** 
- Go to your service
- View logs in real-time
- Set alerts for high memory/CPU

**PlanetScale:**
- Check Insights tab for metrics
- Monitor query performance

### Step 6.3: Enable Automatic Deployments
1. Both Vercel and Railway: Already enabled from GitHub
2. Commits to `main` branch → Auto-deploy to production
3. Commits to other branches → Auto-deploy to preview/staging

---

## **Troubleshooting Guide**

### Frontend Issues
| Issue | Solution |
|-------|----------|
| "Failed to fetch from API" | Check VITE_API_URL env var matches Railway URL |
| CORS errors | Update SecurityConfig.java with Vercel URL |
| 404 on routes | Check vite.config.js has SPA fallback |

### Backend Issues
| Issue | Solution |
|-------|----------|
| "Connection refused" to database | Check PlanetScale connection string, whitelist IPs |
| Build fails on Railway | Check pom.xml has correct Java version (17) |
| Slow startup | Increase Railway runtime memory or use P2 plan |

### Database Issues
| Issue | Solution |
|-------|----------|
| "Unknown database" error | Run schema.sql in PlanetScale before deploying |
| Connection timeout | Try connecting locally first with MySQL CLI |

---

## **Environment Variables Summary**

### Railway Backend (.env or Railway Dashboard)
```
SPRING_DATASOURCE_URL=jdbc:mysql://user:pass@host/annasetu
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=pass
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
SERVER_PORT=8080
```

### Vercel Frontend (Environment Variables)
```
VITE_API_URL=https://annasetu-backend-prod.railway.app
``

---

## **Deployment Checklist**

- [ ] GitHub repository created and code pushed
- [ ] PlanetScale database created with schema imported
- [ ] Railway backend deployed with env vars configured
- [ ] Vercel frontend deployed with env vars configured
- [ ] CORS configured on backend for Vercel domain
- [ ] Backend API responding at Railway URL
- [ ] Frontend accessible at Vercel URL
- [ ] Database connectivity verified
- [ ] Login/authentication tested end-to-end
- [ ] Custom domain configured (optional)

---

## **Production URLs (Save These!)**

- **Frontend:** https://annasetu.vercel.app
- **Backend:** https://YOUR_RAILWAY_URL (will be provided after deployment)
- **Database:** PlanetScale dashboard connection info (saved in notes)


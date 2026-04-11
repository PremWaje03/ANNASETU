# अन्नसेतु (Annasetu) - Food Donation Management System

Production-grade full-stack application connecting donors, NGOs, and volunteers with smart matching, live tracking, and real-time alerts.

## Project Structure

- `backend/` - Spring Boot API (JWT, MySQL, WebSocket, scheduler, analytics)
- `frontend/` - React + Vite UI (dark glassmorphism theme, charts, maps, live notifications)
- `database/schema.sql` - MySQL schema + compatibility alter statements

## Backend Setup

### Prerequisites

1. Java 17+
2. Maven 3.9+
3. MySQL 8+

### Configure Database

1. Run schema:
   ```sql
   SOURCE /absolute/path/to/database/schema.sql;
   ```
2. Update credentials in `backend/src/main/resources/application.properties`:
   - `spring.datasource.username`
   - `spring.datasource.password`

### Run Backend

```bash
cd backend
mvn spring-boot:run
```

Backend URL: `http://localhost:8081`

## Frontend Setup

### Prerequisites

1. Node.js 18+
2. npm 9+

### Configure Environment

```bash
cd frontend
cp .env.example .env
```

Update `.env`:

- `VITE_API_BASE_URL=http://localhost:8081`
- `VITE_WS_BASE_URL=http://localhost:8081`
- `VITE_GOOGLE_MAPS_API_KEY=YOUR_REAL_KEY`

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## Core APIs

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Donations

- `POST /api/donations`
- `GET /api/donations`
- `GET /api/donations/{id}`
- `GET /api/donations/nearby?latitude=&longitude=&radiusKm=`
- `GET /api/donations/nearest?latitude=&longitude=&limit=`
- `GET /api/donations/search?foodType=&location=&status=`
- `GET /api/donations/stats`

### Requests

- `POST /api/requests/accept`
- `PUT /api/requests/status`
- `GET /api/requests/my`

### Dashboard + Profile

- `GET /api/dashboard/stats`
- `GET /api/users/profile`
- `PUT /api/users/location`

### Upload

- `POST /api/upload` (multipart field name: `file`)

### Feedback

- `POST /api/feedback`
- `GET /api/feedback`

### Notifications

- `GET /api/notifications`
- `PUT /api/notifications/{id}/read`
- WebSocket endpoint: `/ws`

## Implemented Advanced Features

1. Smart nearest matching (Haversine)
2. Best-match badge on frontend
3. Expiry urgency detection + countdown timer
4. Scheduled expiry-alert notifications (`@Scheduled`)
5. Role-based dashboard stats
6. Donation analytics (weekly + status split)
7. Food image upload + card preview rendering
8. Advanced notification bell + dropdown + mark as read
9. Search and filter by food type/location/status
10. Simulated live tracking between volunteer and donor
11. Profile page with activity summary and location update
12. JWT expiry auto-logout + protected route handling

## Google Maps Checklist

1. Enable APIs in Google Cloud:
   - Maps JavaScript API
2. Put valid key in `frontend/.env`
3. Restart frontend after `.env` changes

If map shows `Oops! Something went wrong`, your key is missing/invalid/restricted.

## WebSocket Test Flow

1. Login with NGO/VOLUNTEER account in one browser tab.
2. Login as DONOR in another tab.
3. Create donation as donor.
4. Verify NGO/VOLUNTEER receives realtime notification.
5. Accept request and update to `PICKED` then `DELIVERED`.
6. Verify donor receives realtime status notifications.
7. Create a donation expiring within 1 hour and verify expiry alerts.

## Security Notes

- BCrypt password hashing
- JWT stateless auth
- 401/403 interceptor-driven auto logout on frontend
- CORS and WebSocket origins configurable via properties
- Upload path exposed through `/uploads/**`

## Suggested Next Upgrades

1. Cloud object storage for images (S3/GCS) with signed URLs
2. Refresh token + rotating token sessions
3. Flyway migrations for production DB lifecycle
4. Automated tests (Spring integration + React component/E2E)
5. Observability stack (Actuator + metrics + centralized logs)

<p align="center">
  <img src="https://img.shields.io/badge/🌃-AfterHour-000000?style=for-the-badge&labelColor=1a1d2e&color=6c63ff" alt="AfterHour" />
</p>

<h1 align="center">AfterHour</h1>
<h3 align="center">AI‑Powered Urban Food Rescue & Logistics Platform</h3>

<p align="center">
  <em>Redistributing surplus food from restaurants and hotels to NGOs and shelters through real‑time dispatch and intelligent routing.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-4.x-010101?style=flat-square&logo=socket.io&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white" alt="Leaflet" />
  <img src="https://img.shields.io/badge/Google_OAuth-2.0-4285F4?style=flat-square&logo=google&logoColor=white" alt="Google OAuth" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
  <img src="https://img.shields.io/badge/status-MVP_Complete-blueviolet?style=flat-square" alt="Status" />
</p>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [User Flows](#-user-flows)
- [Authentication Flow](#-authentication-flow)
- [Delivery Lifecycle](#-delivery-lifecycle)
- [User Roles](#-user-roles)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Non‑Functional Requirements](#-non-functional-requirements)
- [Success Metrics](#-success-metrics)
- [Risks & Mitigations](#-risks--mitigations)
- [License](#-license)

---

## 🔴 Problem Statement

| Problem | Impact |
|---------|--------|
| Restaurants & institutions discard large amounts of surplus food daily. | ~68 million tonnes of food wasted in India annually. |
| NGOs lack a real‑time view of available food and rely on manual coordination. | Delayed response, missed donations. |
| Volunteer drivers have no optimized routes. | Higher travel time, increased carbon footprint. |

**AfterHour** solves this by creating a live digital bridge between surplus food and the people who need it most.

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔐 **Dual Authentication** | Email/password + Google OAuth with JWT sessions. |
| 2 | 👥 **Role‑Based Dashboards** | Tailored views for Donor, NGO, Driver, and Admin. |
| 3 | 🗺️ **Live Map (Leaflet + CartoDB)** | Real‑time markers for all participants with dark/light tile switching. |
| 4 | 📦 **Food Listing CRUD** | Donors create listings; NGOs claim; drivers accept for delivery. |
| 5 | 🤖 **AI‑Powered Parsing** | Google Gemini AI parses natural‑language food descriptions into structured data. |
| 6 | 🚗 **Delivery Routing** | Polyline route from pickup → drop‑off visible to all parties. |
| 7 | ⚡ **Real‑time Updates** | Socket.io pushes listing status, driver location, and notifications instantly. |
| 8 | 📊 **Analytics Dashboard** | Impact metrics (meals saved, CO₂ reduced) with Recharts visualizations. |
| 9 | 🌙 **Dark Mode** | Full theme toggle with CSS custom properties. |
| 10 | 🛡️ **Security** | Helmet, CORS, rate limiting, bcrypt hashing, input validation. |

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Frontend — React + Vite"]
        A[Landing Page] --> B[Auth Pages]
        B --> C[Donor Dashboard]
        B --> D[NGO Dashboard]
        B --> E[Driver Dashboard]
        C --> F[Leaflet Map + CartoDB Tiles]
        D --> F
        E --> F
        C --> G[Analytics — Recharts]
    end

    subgraph Server["⚙️ Backend — Node.js + Express"]
        H[REST API Routes] --> I[Controllers]
        I --> J[Services Layer]
        J --> K[(MongoDB Atlas)]
        L[Socket.io Server] --> M[Real‑time Events]
        I --> N[Middleware]
        N --> N1[JWT Auth]
        N --> N2[RBAC]
        N --> N3[Rate Limiter]
        J --> O[Gemini AI Service]
    end

    subgraph External["🌐 External Services"]
        P[Google OAuth 2.0]
        Q[CartoDB Tile Server]
        R[Google Gemini AI]
    end

    Client <-->|REST API| Server
    Client <-->|WebSocket| L
    B -->|OAuth Token| P
    F -->|Map Tiles| Q
    O -->|AI Parse| R
```

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| ![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white) | UI library |
| ![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white) | Build tool & dev server |
| ![CSS](https://img.shields.io/badge/Vanilla_CSS-3-1572B6?style=flat-square&logo=css3&logoColor=white) | Styling with CSS custom properties |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?style=flat-square&logo=framer&logoColor=white) | Animations & transitions |
| ![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white) | Interactive maps |
| ![CartoDB](https://img.shields.io/badge/CartoDB-Tiles-2E3C43?style=flat-square&logo=carto&logoColor=white) | Map tile provider (dark + light basemaps) |
| ![Recharts](https://img.shields.io/badge/Recharts-3-FF6384?style=flat-square&logo=chartdotjs&logoColor=white) | Data visualization charts |
| ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=flat-square&logo=reactrouter&logoColor=white) | Client‑side routing |
| ![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?style=flat-square&logo=axios&logoColor=white) | HTTP client |
| ![Socket.io Client](https://img.shields.io/badge/Socket.io_Client-4-010101?style=flat-square&logo=socket.io&logoColor=white) | Real‑time client |
| ![Google OAuth](https://img.shields.io/badge/@react--oauth/google-0.13-4285F4?style=flat-square&logo=google&logoColor=white) | Google Sign‑In |
| ![React Icons](https://img.shields.io/badge/React_Icons-5-E91E63?style=flat-square&logo=react&logoColor=white) | Icon library |
| ![React Hot Toast](https://img.shields.io/badge/React_Hot_Toast-2-FF4154?style=flat-square&logo=react&logoColor=white) | Toast notifications |

### Backend

| Technology | Purpose |
|-----------|---------|
| ![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white) | JavaScript runtime |
| ![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white) | Web framework |
| ![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-8-47A248?style=flat-square&logo=mongodb&logoColor=white) | NoSQL database |
| ![Mongoose](https://img.shields.io/badge/Mongoose-8-880000?style=flat-square&logo=mongoose&logoColor=white) | ODM for MongoDB |
| ![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io&logoColor=white) | Real‑time engine |
| ![JWT](https://img.shields.io/badge/JWT-9-000000?style=flat-square&logo=jsonwebtokens&logoColor=white) | Token‑based auth |
| ![bcrypt](https://img.shields.io/badge/bcryptjs-2.4-003B57?style=flat-square&logo=letsencrypt&logoColor=white) | Password hashing (12 salt rounds) |
| ![Helmet](https://img.shields.io/badge/Helmet-7-333333?style=flat-square&logo=helmet&logoColor=white) | HTTP security headers |
| ![Google Auth Library](https://img.shields.io/badge/google--auth--library-10-4285F4?style=flat-square&logo=google&logoColor=white) | Server‑side OAuth verification |
| ![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=flat-square&logo=googlegemini&logoColor=white) | AI food description parsing |
| ![Morgan](https://img.shields.io/badge/Morgan-1.10-2D3748?style=flat-square&logo=node.js&logoColor=white) | HTTP request logging |
| ![Express Validator](https://img.shields.io/badge/Express_Validator-7-E8E8E8?style=flat-square&logo=express&logoColor=black) | Input validation |
| ![Express Rate Limit](https://img.shields.io/badge/Rate_Limiter-7-FF6B6B?style=flat-square&logo=express&logoColor=white) | API rate limiting |

---

## 📁 Project Structure

```
AfterHourr/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   ├── env.js                # Environment config
│   │   └── socket.js             # Socket.io initialization
│   ├── controllers/
│   │   ├── authController.js     # Login, register, Google OAuth
│   │   ├── donationController.js # Listing CRUD & claim flow
│   │   ├── ngoController.js      # NGO‑specific operations
│   │   ├── driverController.js   # Driver dispatch & delivery
│   │   ├── aiController.js       # Gemini AI integration
│   │   └── analyticsController.js# Impact metrics
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── rbac.js               # Role‑based access control
│   │   ├── rateLimiter.js        # API rate limiting
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── User.js               # User schema (all roles)
│   │   ├── Donation.js           # Food listing schema
│   │   ├── Delivery.js           # Delivery tracking schema
│   │   ├── Notification.js       # Push notification schema
│   │   └── Route.js              # Route/path schema
│   ├── routes/                   # Express route definitions
│   ├── services/
│   │   ├── geminiService.js      # Google Gemini AI integration
│   │   ├── matchingService.js    # NGO ↔ Donation matching
│   │   ├── dispatchService.js    # Driver dispatch logic
│   │   ├── routingService.js     # Route calculation
│   │   └── notificationService.js# Real‑time notifications
│   ├── utils/
│   │   ├── haversine.js          # Distance calculation
│   │   ├── generateToken.js      # JWT token generation
│   │   └── validators.js         # Input validation rules
│   ├── seed/                     # Database seeding scripts
│   └── server.js                 # Express + Socket.io entry point
│
├── frontend/
│   └── src/
│       ├── animations/           # Framer Motion variants
│       ├── components/
│       │   ├── common/           # Shared UI components
│       │   │   ├── GeospatialMap.jsx    # Leaflet + CartoDB map
│       │   │   ├── Sidebar.jsx          # Navigation sidebar
│       │   │   ├── TopHUD.jsx           # Top bar with notifications
│       │   │   ├── GlassCard.jsx        # Glassmorphism card
│       │   │   ├── MetricCard.jsx       # Stat card
│       │   │   ├── StatusBadge.jsx      # Status indicator
│       │   │   ├── FloatingDock.jsx     # Floating action bar
│       │   │   ├── AddressAutocomplete.jsx  # Location picker
│       │   │   └── LoadingState.jsx     # Loading skeleton
│       ├── context/
│       │   ├── AuthContext.jsx   # Auth state + Google OAuth
│       │   ├── SocketContext.jsx # Socket.io connection
│       │   └── ThemeContext.jsx  # Dark/light mode toggle
│       ├── layouts/
│       │   ├── AuthLayout.jsx    # Login/Register wrapper
│       │   └── DashboardLayout.jsx # Dashboard wrapper
│       ├── pages/
│       │   ├── Landing.jsx       # Public landing page
│       │   ├── Login.jsx         # Login (email + Google)
│       │   ├── Register.jsx      # Register (email + Google)
│       │   ├── DonorDashboard.jsx
│       │   ├── NGODashboard.jsx
│       │   ├── DriverDashboard.jsx
│       │   ├── Listings.jsx      # All food listings
│       │   ├── Deliveries.jsx    # Active deliveries
│       │   ├── LiveMap.jsx       # Full‑screen live map
│       │   ├── Analytics.jsx     # Impact dashboard
│       │   ├── Settings.jsx      # User settings
│       │   └── Network.jsx       # User network
│       └── services/
│           └── api.js            # Axios API layer
```

---

## 🗄️ Database Schema

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role "donor | ngo | driver | admin"
        String phone
        Point location "2dsphere indexed"
        String address
        String city
        Boolean isVerified
        Boolean isActive
        Number capacity "NGO only"
        Number currentLoad "NGO only"
        String vehicleType "Driver only"
        Boolean isOnline "Driver only"
        Number completedDeliveries "Driver only"
        Number rating "Driver only"
    }

    DONATION {
        ObjectId _id PK
        ObjectId donor FK
        Array items "name, category, qty, unit, shelfLife"
        Number totalServings
        String rawDescription
        Boolean aiParsed
        String status "pending → matched → in_transit → delivered"
        Point pickupLocation "2dsphere indexed"
        String pickupAddress
        Object pickupWindow "start, end"
        ObjectId matchedNGO FK
        ObjectId assignedDriver FK
        Number carbonSaved
    }

    DELIVERY {
        ObjectId _id PK
        ObjectId donation FK
        ObjectId route FK
        ObjectId driver FK
        ObjectId donor FK
        ObjectId ngo FK
        String status "assigned → picked_up → in_transit → delivered"
        Date pickupTime
        Date deliveryTime
        Number distance
        Number duration
        String verificationCode
        Object feedback "rating, comment"
        Number carbonSaved
        Number mealsDelivered
    }

    NOTIFICATION {
        ObjectId _id PK
        String type
        String message
        Boolean read
    }

    ROUTE {
        ObjectId _id PK
        Array waypoints
        Number totalDistance
        Number totalDuration
    }

    USER ||--o{ DONATION : "creates (donor)"
    USER ||--o{ DONATION : "claims (ngo)"
    USER ||--o{ DELIVERY : "delivers (driver)"
    DONATION ||--o| DELIVERY : "fulfilled by"
    DELIVERY }o--|| ROUTE : "follows"
    USER ||--o{ NOTIFICATION : "receives"
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/auth/register` | Register with email/password |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/auth/login` | Login with email/password |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/auth/google/login` | Login with Google OAuth |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/auth/google/register` | Register with Google OAuth |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/auth/me` | Get current user profile |

### Donations

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/donations` | Create food listing |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/donations` | Get all listings |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/donations/my` | Get donor's own listings |
| ![PUT](https://img.shields.io/badge/PUT-FCA130?style=flat-square) | `/api/donations/:id` | Update listing |
| ![DELETE](https://img.shields.io/badge/DELETE-F93E3E?style=flat-square) | `/api/donations/:id` | Delete listing |

### NGO

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/ngo/available` | Get nearby available donations |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/ngo/claim/:id` | Claim a donation |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/ngo/claims` | Get NGO's claimed donations |

### Driver

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/driver/available` | Get available pickups |
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/driver/accept/:id` | Accept a delivery |
| ![PUT](https://img.shields.io/badge/PUT-FCA130?style=flat-square) | `/api/driver/status/:id` | Update delivery status |
| ![PUT](https://img.shields.io/badge/PUT-FCA130?style=flat-square) | `/api/driver/location` | Update driver location |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/driver/deliveries` | Get delivery history |

### AI & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| ![POST](https://img.shields.io/badge/POST-49CC90?style=flat-square) | `/api/ai/parse` | AI‑parse food description |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/analytics/dashboard` | Get impact metrics |
| ![GET](https://img.shields.io/badge/GET-61AFFE?style=flat-square) | `/api/health` | Health check |

---

## 🔄 User Flows

### Donation Lifecycle — End‑to‑End Flow

```mermaid
flowchart LR
    A([🧑‍🍳 Donor]) -->|Posts surplus food| B[Create Listing]
    B -->|AI parses description| C{Status: Pending}
    C -->|NGO browses nearby| D([🏢 NGO])
    D -->|Claims listing| E{Status: Matched}
    E -->|Driver sees pickup| F([🚗 Driver])
    F -->|Accepts delivery| G{Status: Pickup Assigned}
    G -->|Arrives at donor| H{Status: Arrived}
    H -->|Picks up food| I{Status: In Transit}
    I -->|Delivers to NGO| J{Status: Delivered}
    J -->|Impact tracked| K[📊 Analytics Updated]

    style A fill:#4CAF50,color:#fff
    style D fill:#2196F3,color:#fff
    style F fill:#FF9800,color:#fff
    style J fill:#9C27B0,color:#fff
    style K fill:#607D8B,color:#fff
```

---

## 🔐 Authentication Flow

### Email + Password Login

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant API as Express API
    participant DB as MongoDB

    User->>Frontend: Enter email & password
    Frontend->>API: POST /api/auth/login
    API->>DB: Find user by email
    DB-->>API: User document
    API->>API: bcrypt.compare(password)
    alt Valid credentials
        API->>API: Generate JWT token
        API-->>Frontend: 200 { token, user }
        Frontend->>Frontend: Store token in localStorage
        Frontend-->>User: Redirect to Dashboard
    else Invalid credentials
        API-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error toast
    end
```

### Google OAuth Login

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React Frontend
    participant Google as Google OAuth
    participant API as Express API
    participant DB as MongoDB

    User->>Frontend: Click "Continue with Google"
    Frontend->>Google: Open consent screen
    Google-->>Frontend: ID Token (credential)
    Frontend->>API: POST /api/auth/google/login { credential }
    API->>Google: Verify ID token (OAuth2Client)
    Google-->>API: { email, name, picture }
    API->>DB: Find user by email
    alt User exists
        API->>API: Generate JWT
        API-->>Frontend: 200 { token, user }
        Frontend-->>User: Redirect to Dashboard
    else User not found
        API-->>Frontend: 404 "Please register first"
        Frontend-->>User: Show registration prompt
    end
```

---

## 📦 Delivery Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: Donor creates listing

    Pending --> Matched: NGO claims
    Pending --> Expired: Pickup window passes
    Pending --> Cancelled: Donor cancels

    Matched --> PickupAssigned: Driver accepts
    Matched --> Pending: NGO unclaims

    PickupAssigned --> Arrived: Driver at pickup
    Arrived --> InTransit: Food picked up
    InTransit --> Delivered: Dropped at NGO

    Delivered --> [*]: ✅ Complete

    Expired --> [*]
    Cancelled --> [*]

    note right of Delivered
        Carbon saved & meals
        delivered are calculated
        and added to analytics
    end note
```

---

## 👥 User Roles

| Role | Dashboard | Key Capabilities |
|------|-----------|-----------------|
| ![Donor](https://img.shields.io/badge/🧑‍🍳_Donor-4CAF50?style=flat-square) | Control Center | AI food logging, listing management, impact metrics, live tracking |
| ![NGO](https://img.shields.io/badge/🏢_NGO-2196F3?style=flat-square) | Resource Hub | Nearby donations feed, one‑click claim, capacity management |
| ![Driver](https://img.shields.io/badge/🚗_Driver-FF9800?style=flat-square) | Dispatch | Route timeline, pickup verification, delivery history |
| ![Admin](https://img.shields.io/badge/🛡️_Admin-9C27B0?style=flat-square) | Admin Panel | User management, listing oversight, system analytics |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | 18+ |
| npm | 9+ |
| MongoDB Atlas | Free tier works |
| Google Cloud Console | OAuth Client ID |

### 1. Clone & Install

```bash
git clone https://github.com/your-username/AfterHourr.git
cd AfterHourr

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Configure Environment

See [Environment Variables](#-environment-variables) below.

### 3. Seed Database

```bash
cd backend
npm run seed
```

**Demo accounts** (password: `password123`):

| Role | Email |
|------|-------|
| 🧑‍🍳 Donor | `taj@demo.com` |
| 🏢 NGO | `roti@demo.com` |
| 🚗 Driver | `vikram@demo.com` |

### 4. Run

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5174** in your browser.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | ✅ |
| `JWT_SECRET` | Secret for signing JWT tokens | ✅ |
| `JWT_EXPIRE` | Token expiry (e.g., `7d`) | ✅ |
| `PORT` | Server port (default `5001`) | ✅ |
| `CLIENT_URL` | Frontend URL (e.g., `http://localhost:5174`) | ✅ |
| `NODE_ENV` | `development` or `production` | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ✅ |
| `GROQ_API_KEY` | Groq API key (optional) | ❌ |
| `OPENAI_API_KEY` | OpenAI API key (optional) | ❌ |

### Frontend (`frontend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:5001/api`) | ✅ |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ |
| `VITE_MAPBOX_TOKEN` | Mapbox token (optional) | ❌ |

---

## 📐 Non‑Functional Requirements

| Category | Requirement |
|----------|-------------|
| ![Performance](https://img.shields.io/badge/⚡_Performance-orange?style=flat-square) | API latency ≤ 300 ms; map updates ≤ 1 s |
| ![Security](https://img.shields.io/badge/🔒_Security-red?style=flat-square) | HTTPS, JWT, bcrypt (12 salt rounds), Helmet, input validation, rate limiting |
| ![Usability](https://img.shields.io/badge/🎨_Usability-blue?style=flat-square) | Mobile‑first responsive design, dark mode toggle, WCAG AA contrast |
| ![Reliability](https://img.shields.io/badge/🟢_Reliability-green?style=flat-square) | 99% uptime target, graceful error handling |
| ![Scalability](https://img.shields.io/badge/📈_Scalability-purple?style=flat-square) | Stateless backend, horizontally scalable, 2dsphere geo‑indexing |

---

## 📊 Success Metrics

```mermaid
mindmap
  root((AfterHour KPIs))
    Adoption
      100+ active donors in 30 days
      30+ NGOs in 30 days
    Engagement
      Listing to claim ≤ 5 min
    Retention
      70% return within 7 days
    Reliability
      Less than 2% crash rate
      Less than 500 ms API latency
    Satisfaction
      4.2+ star UI/UX rating
```

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 🔴 Google OAuth misconfiguration | Users blocked from signing in | Verify client ID & redirect URIs; restart servers after `.env` changes |
| 🟡 Real‑time map lag | Poor UX, stale driver locations | Socket.io heartbeat ≤ 5 s; fallback polling mechanism |
| 🟡 Data privacy (user locations) | Legal compliance issues | Store only necessary data; anonymize where possible; consent modal |
| 🟠 Scaling beyond MVP | Performance degradation | Containerize services; plan horizontal scaling early |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  <strong>Built with ❤️ to fight food waste</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Made_with-MERN_Stack-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="Made with MERN" />
  <img src="https://img.shields.io/badge/Powered_by-Google_Gemini_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Powered by Gemini" />
  <img src="https://img.shields.io/badge/Maps_by-CartoDB_+_Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white" alt="Maps by Leaflet" />
</p>

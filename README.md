# Taxi Booking System

A full-stack taxi booking application with real-time fare estimation, vehicle management, and admin dashboard.

## 🏗️ Architecture

### Overview
This application follows a **monolithic architecture** with clear separation of concerns:

- **Frontend**: React SPA with modern UI components
- **Backend**: Node.js/Express REST API
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT-based admin authentication
- **Deployment**: Separate client/server with CORS enabled

### Tech Stack

#### Frontend
- **React 19** - Modern React with concurrent features
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

#### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework with async/await support
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Winston** - Logging framework
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

#### Database Schema
- **admins**: Admin user management
- **vehicles**: Vehicle inventory with pricing
- **bookings**: Ride booking records

### Architectural Decisions

1. **Monolithic Structure**: Single codebase for easier development and deployment
2. **RESTful API**: Standard HTTP methods with JSON responses
3. **JWT Authentication**: Stateless auth for admin operations
4. **Connection Pooling**: Efficient database connections with `pg` library
5. **Environment-based Config**: Flexible deployment across environments
6. **Middleware Chain**: Request validation, auth, logging, and error handling
7. **UUID Primary Keys**: Globally unique identifiers for distributed systems
8. **Database Triggers**: Automatic timestamp updates
9. **Rate Limiting**: Protection against abuse
10. **Input Validation**: Server-side validation with express-validator

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (cloud like Neon)
- npm 

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taxi-app
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**
   Create `.env` file in `server/` directory:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/taxi_db

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Server
   PORT=4000
   NODE_ENV=development
   ```

5. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate

   # Seed with sample data
   npm run db:seed
   ```

6. **Start Development Servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on: http://localhost:4000

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on: http://localhost:5173

## 📋 Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing

### Optional
- `PORT`: Server port (default: 4000)
- `NODE_ENV`: Environment mode (development/production)
- `JWT_EXPIRES_IN`: Token expiration time (default: 7d)

## 🔗 API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Bookings (Public)
- `GET /api/bookings/estimate` - Fare estimation
- `POST /api/bookings` - Create booking

### Bookings (Admin Protected)
- `GET /api/bookings` - List all bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/status` - Update booking status

### Vehicles (Admin Protected)
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### System
- `GET /api/health` - Health check

## 🗄️ Database Schema

### Admins Table
```sql
CREATE TABLE admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Vehicles Table
```sql
CREATE TABLE vehicles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  type         VARCHAR(50) NOT NULL,
  plate_number VARCHAR(20) NOT NULL UNIQUE,
  capacity     INTEGER NOT NULL DEFAULT 4,
  base_fare    NUMERIC(10,2) NOT NULL DEFAULT 0,
  per_km_rate  NUMERIC(10,2) NOT NULL DEFAULT 0,
  status       VARCHAR(20) NOT NULL DEFAULT 'available',
  image_url    TEXT,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Bookings Table
```sql
CREATE TABLE bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref      VARCHAR(20) NOT NULL UNIQUE,
  customer_name    VARCHAR(100) NOT NULL,
  customer_phone   VARCHAR(20) NOT NULL,
  customer_email   VARCHAR(150),
  vehicle_id       UUID NOT NULL REFERENCES vehicles(id),
  pickup_location  TEXT NOT NULL,
  pickup_lat       NUMERIC(10,7),
  pickup_lng       NUMERIC(10,7),
  drop_location    TEXT NOT NULL,
  drop_lat         NUMERIC(10,7),
  drop_lng         NUMERIC(10,7),
  distance_km      NUMERIC(10,2) NOT NULL DEFAULT 0,
  fare             NUMERIC(10,2) NOT NULL DEFAULT 0,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending',
  scheduled_at     TIMESTAMP WITH TIME ZONE,
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🏃 Running the Application

### Development Mode
```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

### Production Build
```bash
# Build frontend
cd client && npm run build

# Start backend
cd server && npm start
```

## 🔐 Default Admin Credentials

- **Email**: admin@taxi.com
- **Password**: Admin@123

## 📁 Project Structure

```
taxi-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API service functions
│   │   └── utils/         # Helper utilities
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Express middlewares
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utilities
│   │   ├── config/        # Configuration
│   │   └── db/            # Database setup
│   ├── package.json
│   └── logs/              # Application logs
└── README.md
```


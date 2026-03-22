# Scatch

A full-stack authentication system built with **Node.js/Express** and **React**, featuring access/refresh token rotation, email verification, password recovery, and Google OAuth 2.0 integration.

## Tech Stack

### Backend
- **Express.js v5** - Web framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Dual token authentication (access + refresh tokens in httpOnly cookies)
- **bcrypt** - Password hashing
- **Nodemailer** - Email service (Gmail SMTP)
- **Google OAuth 2.0** - Social login
- **Cloudinary** - Image storage
- **Multer** - File uploads

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **React Router v7** - Client-side routing
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **Axios** - HTTP client (with token refresh interceptor)
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Features

- User registration with email & password
- Email verification via 6-digit OTP code
- Login with credentials or Google OAuth
- Forgot password & reset password flow
- Access token (15min) + refresh token (7d) rotation
- Refresh token stored as SHA256 hash in DB for revocation
- Automatic silent token refresh via Axios interceptor
- Password strength meter (frontend) + minimum 8 char validation (backend)
- Protected routes (auth required + email verified)
- Role-based access control (user/admin)
- Auth provider separation (local vs Google accounts)
- Generic error messages to prevent user enumeration
- Responsive dark-themed UI with animations

## Authentication Flow (Detailed)

### 1. Registration

```
User fills signup form
        │
        ▼
POST /user/register
        │
        ├── Validate fields (username, email, password)
        ├── Check password >= 8 characters
        ├── Check if email already exists
        ├── Hash password with bcrypt (10 rounds)
        ├── Generate 6-digit OTP verification code
        ├── Create user in DB (isVerified: false, authProvider: "local")
        ├── Generate access token (15min) + refresh token (7d)
        │       ├── Access token → httpOnly cookie
        │       └── Refresh token → httpOnly cookie (scoped to /user/refresh) + SHA256 hash stored in DB
        ├── Send OTP to user's email via Gmail SMTP
        └── Redirect to /verify-email page
```

### 2. Email Verification

```
User enters 6-digit OTP code
        │
        ▼
POST /user/verify-email
        │
        ├── Find user by verificationToken where expiry > now
        ├── If not found → "Invalid or expired code"
        ├── Set isVerified: true
        ├── Clear verificationToken and verificationTokenExpiresAt
        ├── Send welcome email
        └── Redirect to dashboard
```

### 3. Login (Email/Password)

```
User enters email + password
        │
        ▼
POST /user/login
        │
        ├── Find user by email
        │       └── Not found → "Invalid email or password" (generic to prevent enumeration)
        ├── Check authProvider !== "google"
        │       └── Is Google → "This account uses Google sign-in"
        ├── Compare password with bcrypt
        │       └── Wrong → "Invalid email or password" (same generic message)
        ├── Check isVerified === true
        │       └── Not verified → "Please verify your email first"
        ├── Generate access token (15min) + refresh token (7d)
        ├── Update lastLogin timestamp
        └── Return user data (password excluded)
```

### 4. Google OAuth Login

```
User clicks "Sign in with Google"
        │
        ▼
Google OAuth consent screen (auth-code flow)
        │
        ▼
POST /user/google-login { code }
        │
        ├── Exchange auth code for Google tokens
        ├── Fetch user profile from Google API
        ├── Find user by email
        │       ├── Exists with authProvider: "local" → "Account already exists. Please login with email and password."
        │       ├── Exists with authProvider: "google" → proceed to login
        │       └── Not found → Create new user (authProvider: "google", isVerified: true, no password)
        ├── Generate access token + refresh token
        ├── Update lastLogin
        └── Return user data
```

### 5. Token Refresh (Silent, Automatic)

```
Any API call returns 401 (access token expired)
        │
        ▼
Axios interceptor catches the 401
        │
        ├── Skips if URL is /login, /register, or /refresh (prevents loops)
        ├── If another refresh is already in progress → queue this request
        │
        ▼
POST /user/refresh (refresh token cookie sent automatically, scoped to this path)
        │
        ├── Verify refresh token JWT with JWT_REFRESH_SECRET
        ├── Hash the token with SHA256
        ├── Compare hash with user's stored refreshToken in DB
        │       └── Mismatch → token reuse detected → revoke all tokens for this user
        ├── Generate NEW access token + NEW refresh token (rotation)
        │       └── Old refresh token is replaced in DB
        ├── Process queued requests
        └── Retry the original failed request with new access token
```

### 6. Logout

```
User clicks logout
        │
        ▼
POST /user/logout
        │
        ├── Decode access token with jwt.decode() (not verify — works even if expired)
        ├── Clear refreshToken from user's DB record → instant session revocation
        ├── Clear accessToken cookie
        ├── Clear refreshToken cookie (with path: "/user/refresh")
        └── Clear frontend state (user, authenticated)
```

### 7. Forgot Password

```
User enters email on forgot password page
        │
        ▼
POST /user/forgot-password
        │
        ├── Find user by email
        ├── If not found OR authProvider is "google"
        │       └── Return same success message (prevents email enumeration)
        ├── Generate random 20-byte hex token
        ├── Store SHA256 hash of token in DB (resetPasswordToken)
        ├── Set expiry to 1 hour (resetPasswordExpiresAt)
        ├── Send email with reset link: CLIENT_URL/reset-password/{raw-token}
        └── Return: "If an account exists with this email, a reset link has been sent"
```

### 8. Reset Password

```
User clicks reset link in email → lands on /reset-password/:token
        │
        ▼
POST /user/reset-password/:token { password }
        │
        ├── Hash the URL token with SHA256
        ├── Find user where resetPasswordToken matches AND expiry > now
        │       └── Not found → "Invalid or expired reset token"
        ├── Check authProvider !== "google"
        ├── Validate password >= 8 characters
        ├── Hash new password with bcrypt
        ├── Clear resetPasswordToken and resetPasswordExpiresAt
        ├── Send password reset success email
        └── Redirect to login page
```

### 9. Auth Check (Page Load / Refresh)

```
App mounts (useEffect in App.jsx)
        │
        ▼
GET /user/check-auth (isUser middleware)
        │
        ├── Middleware: Read accessToken cookie
        │       ├── Missing → 401 → interceptor tries refresh
        │       ├── Expired → 401 → interceptor tries refresh
        │       └── Valid → extract userId, attach to req
        ├── Find user by userId (exclude password)
        ├── Return user data
        └── Frontend sets authenticated: true, user state
```

## Security Measures

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcrypt with 10 salt rounds |
| Access token | JWT, 15-minute expiry, httpOnly cookie |
| Refresh token | JWT, 7-day expiry, httpOnly cookie, scoped to `/user/refresh` path |
| Refresh token storage | SHA256 hash in DB (raw token never stored) |
| Token rotation | New refresh token issued on every refresh (old one invalidated) |
| Token reuse detection | If old refresh token is reused, all tokens for that user are revoked |
| Separate JWT secrets | `JWT_ACCESS_SECRET` for access tokens, `JWT_REFRESH_SECRET` for refresh tokens |
| Session revocation | Logout clears refresh token from DB using `jwt.decode()` (works even with expired access token) |
| User enumeration prevention | Login returns generic "Invalid email or password" for both wrong email and wrong password |
| Forgot password enumeration | Always returns same message regardless of whether email exists |
| Auth provider separation | Local users can't login via Google and vice versa |
| Password validation | Minimum 8 characters enforced on backend (register + reset) |
| Cookie security | `secure: true` in production, `sameSite: "none"` (prod) / `"lax"` (dev) |
| CORS | Restricted to frontend origin with credentials |
| Error messages | Generic "Internal Server Error" in production (no stack traces leaked) |

## Project Structure

```
Scatch/
├── backend/
│   ├── config/           # DB, Google OAuth, Cloudinary configs
│   ├── controllers/      # Route handlers (user, product)
│   ├── models/           # Mongoose schemas (User, Product)
│   ├── routes/           # Express route definitions
│   ├── middlewares/       # Auth middleware (isUser, isAdmin)
│   ├── mailtrap/         # Email config, templates & senders
│   ├── utils/            # Token generation, verification codes
│   └── index.js          # App entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context for auth state
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API endpoint constants
│   │   ├── utils/        # Helper functions
│   │   ├── App.jsx       # Routes & protected route logic
│   │   └── main.jsx      # Entry point
│   └── index.html
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Gmail account (for sending emails)
- Google Cloud Console project (for OAuth)

### 1. Clone the repository

```bash
git clone https://github.com/Ritiktomar02/Scatch.git
cd Scatch
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
NODE_ENV=development
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_gmail_app_password

CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

Start the backend:

```bash
npm run dev
```

The server runs on `http://localhost:8000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_BASE_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend:

```bash
npm run dev
```

The app runs on `http://localhost:5173`.

## API Endpoints

| Method | Endpoint                      | Description              | Auth Required |
|--------|-------------------------------|--------------------------|---------------|
| POST   | `/user/register`              | Register new user        | No            |
| POST   | `/user/login`                 | Login with credentials   | No            |
| POST   | `/user/logout`                | Logout user              | No            |
| POST   | `/user/verify-email`          | Verify email with OTP    | No            |
| POST   | `/user/forgot-password`       | Request password reset   | No            |
| POST   | `/user/reset-password/:token` | Reset password           | No            |
| POST   | `/user/google-login`          | Google OAuth login       | No            |
| POST   | `/user/refresh`               | Refresh access token     | No            |
| GET    | `/user/check-auth`            | Check auth status        | Yes           |

## Scripts

### Backend
| Command       | Description                 |
|---------------|-----------------------------|
| `npm run dev` | Start server with nodemon   |

### Frontend
| Command           | Description              |
|-------------------|--------------------------|
| `npm run dev`     | Start Vite dev server    |
| `npm run build`   | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`    | Run ESLint               |

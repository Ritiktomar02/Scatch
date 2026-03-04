# Scatch

A full-stack authentication system built with **Node.js/Express** and **React**, featuring email verification, password recovery, and Google OAuth 2.0 integration.

## Tech Stack

### Backend
- **Express.js v5** - Web framework
- **MongoDB + Mongoose** - Database & ODM
- **JWT** - Token-based authentication (httpOnly cookies)
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
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Features

- User registration with email & password
- Email verification via 6-digit OTP code
- Login with credentials or Google OAuth
- Forgot password & reset password flow
- JWT-based session management with httpOnly cookies
- Password strength meter
- Protected routes (auth required)
- Role-based access control (user/admin)
- Responsive dark-themed UI with animations

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
JWT_SECRET=your_jwt_secret

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

| Method | Endpoint                    | Description              | Auth Required |
|--------|-----------------------------|--------------------------|---------------|
| POST   | `/user/register`            | Register new user        | No            |
| POST   | `/user/login`               | Login with credentials   | No            |
| POST   | `/user/logout`              | Logout user              | No            |
| POST   | `/user/verify-email`        | Verify email with OTP    | No            |
| POST   | `/user/forgot-password`     | Request password reset   | No            |
| POST   | `/user/reset-password/:token` | Reset password         | No            |
| POST   | `/user/google-login`        | Google OAuth login       | No            |
| GET    | `/user/check-auth`          | Check auth status        | Yes           |

## Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWT tokens stored in **httpOnly** cookies (7-day expiry)
- Verification codes expire in **24 hours**
- Password reset tokens are **SHA256-hashed** and expire in **1 hour**
- CORS restricted to frontend origin
- Secure cookie flags enabled in production

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

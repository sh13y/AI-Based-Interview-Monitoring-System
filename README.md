# Modern Matrix - Login & Signup System

Complete implementation of authentication system for the AI-Based Automated Interview Monitoring System.

## Project Structure

```
modern-matrix/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routes/auth.py   # Authentication endpoints
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── schemas.py       # Pydantic validation
│   │   ├── main.py          # FastAPI app
│   │   ├── config.py        # Configuration
│   │   ├── database.py      # DB connection
│   │   └── utils/           # Security, lockout, email
│   ├── venv/                # Python virtual environment
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variables template
│   └── .env                 # Environment variables (create this)
│
└── frontend/                # React frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── VerifyEmail.jsx
    │   ├── components/
    │   │   └── FormComponents.jsx
    │   ├── services/
    │   │   └── authService.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── node_modules/
    ├── .env.local
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

## Setup Instructions

### Backend Setup

1. **Create MySQL Database**
   ```sql
   CREATE DATABASE modern_matrix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Create .env file** in `backend/` directory:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your settings:
   - `DATABASE_URL`: MySQL connection string
   - `JWT_SECRET_KEY`: Random 32+ character key
   - `SMTP_*`: Gmail or other email service credentials

3. **Install dependencies**:
   ```bash
   cd backend
   venv\Scripts\pip install -r requirements.txt
   ```

4. **Run FastAPI server**:
   ```bash
   venv\Scripts\python -m uvicorn app.main:app --reload
   ```
   Server runs at: `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **.env.local** is already configured with `VITE_API_URL=http://localhost:8000`

3. **Run React dev server**:
   ```bash
   npm run dev
   ```
   Frontend runs at: `http://localhost:5173`

## Features Implemented

### Authentication
✅ User registration (signup)
✅ Email verification (with secure tokens)
✅ User login
✅ password strength validation
✅ 3-strike lockout (15-min cooldown)
✅ JWT token management
✅ Profile picture upload (Base64 encoding)

### Backend Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/verify-email/{token}` - Verify email
- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user profile
- `GET /health` - Health check
- `GET /` - API root

### Frontend Pages
- **Login Page** - Dark theme with sage green accents
- **Signup Page** - 2-column layout (Personal Info + Account Security)
- **Email Verification** - Email verification status page

### Form Validation
- Client-side: React Hook Form + custom validators
- Server-side: Pydantic schemas + FastAPI validation
- Password strength: uppercase, number, special char, 8+ chars
- Email format validation
- User ID uniqueness checking
- Confirm password matching

### Security
- bcrypt password hashing
- JWT tokens (30-min access, 7-day refresh)
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- Rate limiting ready for login endpoint
- Secure email tokens (10-min expiry)
- Account lockout on 3 failed attempts

## Testing

### Manual Testing with Postman/Thunder Client

1. **Test Signup**:
   ```
   POST http://localhost:8000/auth/signup
   {
     "first_name": "John",
     "last_name": "Doe",
     "user_id": "john_doe123",
     "email": "john@example.com",
     "password": "SecurePass123!",
     "confirm_password": "SecurePass123!"
   }
   ```

2. **Verify Email**:
   ```
   POST http://localhost:8000/auth/verify-email/{token_from_email}
   ```

3. **Test Login**:
   ```
   POST http://localhost:8000/auth/login
   {
     "user_id": "john_doe123",
     "password": "SecurePass123!"
   }
   ```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://root:@localhost:3306/modern_matrix_db
JWT_SECRET_KEY=generate_32_char_random_string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SENDER_EMAIL=your_email@gmail.com

FRONTEND_URL=http://localhost:5173
VERIFICATION_TOKEN_EXPIRE_MINUTES=10
LOCKOUT_DURATION_MINUTES=15
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:8000
```

## Database Schema

### Users Table
- user_id (UUID, PK)
- first_name, last_name
- user_id_field (unique)
- email (unique)
- password_hash
- profile_picture_base64 (optional)
- is_verified (default: false)
- is_locked (default: false)
- locked_until (optional)
- created_at, updated_at

### Login_Attempts Table
- attempt_id (auto-increment)
- user_id (FK)
- attempt_timestamp
- success (boolean)
- ip_address

### Email_Verifications Table
- verification_id (UUID, PK)
- user_id (FK)
- token (unique)
- created_at, expires_at
- is_used (default: false)

## Next Steps

1. ✅ Complete login & signup implementation
2. Test all features end-to-end
3. Create dashboard page
4. Add password reset functionality
5. Implement refresh token logic
6. Add admin user management
7. Integrate with AI evaluation engine
8. Deploy to production

## Troubleshooting

### "Email not verified" error on login
- User hasn't verified their email yet
- Check spam folder for verification email
- Recreate account if verification link expired

### "Account locked" error
- User exceeded 3 failed login attempts
- Account automatically unlocks after 15 minutes
- Or admin can manually unlock via database

### CORS errors
- Ensure backend is running on port 8000
- Frontend URL must be in CORS allowed list
- Check .env files for correct URLs

### Database connection error
- Verify XAMPP MySQL is running
- Check DATABASE_URL in .env file
- Ensure database `modern_matrix_db` exists

## Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + React Hook Form
- **Backend**: FastAPI + SQLAlchemy + PyJWT + bcrypt
- **Database**: MySQL 8.0
- **Email**: SMTP (Gmail or similar)
- **Auth**: JWT tokens

## Created: April 15, 2026

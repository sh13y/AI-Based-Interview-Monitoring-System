# Modern Matrix - Complete Setup Guide

## Prerequisites
- Python 3.9+ installed
- Node.js 16+ installed
- XAMPP with MySQL running (already installed)
- Git installed
- Code editor (VS Code recommended)

---

## Step 1: Database Setup

### 1.1 Start XAMPP MySQL
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL
3. Click "Admin" to open phpMyAdmin (http://localhost/phpmyadmin)

### 1.2 Create Database
1. In phpMyAdmin, go to SQL tab
2. Copy and paste contents of `database_init.sql`
3. Click "Go" to execute

**OR use MySQL CLI:**
```bash
mysql -u root < database_init.sql
```

### 1.3 Verify Database
In phpMyAdmin, you should see:
- Database: `modern_matrix_db`
- Tables: `users`, `login_attempts`, `email_verifications`

---

## Step 2: Backend Setup

### 2.1 Create .env File
1. Navigate to `backend/` folder
2. Copy `.env.example` to `.env`
3. Edit `.env` with your settings:

```env
# Database (XAMPP)
DATABASE_URL=mysql+pymysql://root:@localhost:3306/modern_matrix_db

# JWT (Generate a random 32+ char string)
JWT_SECRET_KEY=your_super_secret_key_min_32_chars_change_in_production_NOW
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (Gmail Example)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SENDER_EMAIL=your_email@gmail.com

FRONTEND_URL=http://localhost:5173
VERIFICATION_TOKEN_EXPIRE_MINUTES=10
LOCKOUT_DURATION_MINUTES=15
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App Passwords
3. Generate an app password and use that in SMTP_PASSWORD

### 2.2 Install Dependencies
```bash
cd backend
venv\Scripts\pip install -r requirements.txt
```

### 2.3 Run FastAPI Server
```bash
cd backend
venv\Scripts\python -m uvicorn app.main:app --reload
```

Expected output:
```
Uvicorn running on http://127.0.0.1:8000
Press CTRL+C to quit
```

**API Documentation**: http://localhost:8000/docs

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies
```bash
cd frontend
npm install
```

### 3.2 Check .env.local
`.env.local` already has:
```env
VITE_API_URL=http://localhost:8000
```

### 3.3 Run React Dev Server
```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v... ready in ... ms

➜  Local:   http://localhost:5173/
```

---

## Step 4: Test the Application

### 4.1 Test Signup
1. Go to http://localhost:5173
2. Click "Create account"
3. Fill in the form:
   - First Name: John
   - Last Name: Doe
   - User ID: john_doe123
   - Email: your_email@gmail.com (must be real)
   - Password: SecurePass123!
   - Confirm: SecurePass123!
   - Upload a profile picture
   - Check "Terms & Privacy"
4. Click "Sign Up"
5. Check your email for verification link
6. Click the verification link

### 4.2 Test Login
1. Go back to http://localhost:5173/login
2. Enter User ID/Email: john_doe123 (or your email)
3. Enter Password: SecurePass123!
4. Click "Sign In"
5. Should redirect to dashboard (placeholder page)

### 4.3 Test 3-Strike Lockout
1. Go to login page
2. Enter correct User ID but wrong password 3 times
3. On 3rd attempt, you should see: "Account locked. Please try again in 15 minutes"
4. Wait 15 minutes or edit database to unlock manually

---

## Step 5: Manual API Testing (Optional)

### Using Postman or Thunder Client

**Test Signup:**
```
POST http://localhost:8000/auth/signup
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "user_id": "jane_smith123",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

**Test Login:**
```
POST http://localhost:8000/auth/login
Content-Type: application/json

{
  "user_id": "jane_smith123",
  "password": "SecurePass123!"
}
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user_id": "...",
  "email": "jane@example.com"
}
```

**Test Get Profile:**
```
GET http://localhost:8000/auth/me
Authorization: Bearer {access_token}
```

---

## Troubleshooting

### "Connection refused" Error
- Make sure XAMPP MySQL is running
- Check DATABASE_URL in .env file
- Verify database `modern_matrix_db` exists

### "Email sending failed"
- Check SMTP credentials in .env
- For Gmail: Use App Password (not regular password)
- Check if 2FA is enabled on Gmail
- Firewall might be blocking SMTP port 587

### "Module not found" Error
- Backend: Run `venv\Scripts\pip install -r requirements.txt`
- Frontend: Run `npm install`

### "CORS error" In Browser Console
- Set VITE_API_URL=http://localhost:8000 in frontend/.env.local
- Make sure FastAPI server is running on port 8000
- Check if both services are running (backend and frontend)

### "Email not verifying"
- Click the link sent in verification email
- Check spam/junk folder
- Link is only valid for 10 minutes
- Create a new account if link expired

### "Account locked" Can't Login
- Wait 15 minutes for auto-unlock
- OR manually unlock in database:
  ```sql
  UPDATE users SET is_locked = FALSE, locked_until = NULL WHERE email = 'your_email@gmail.com';
  ```

---

## File Locations

```
c:/Users/kgimh/Desktop/modern-matrix/
├── backend/
│   ├── app/
│   ├── venv/
│   ├── requirements.txt
│   ├── .env (YOU CREATE THIS)
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── .env.local (already created)
│   ├── package.json
│   └── node_modules/
├── database_init.sql (run this in phpMyAdmin)
└── README.md
```

---

## Common Commands

### Backend
```bash
# Activate venv
cd backend
venv\Scripts\activate

# Run server
python -m uvicorn app.main:app --reload

# Run server on different port
python -m uvicorn app.main:app --reload --port 8001

# Deactivate venv
deactivate
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database
```bash
# Access MySQL
mysql -u root

# View database
USE modern_matrix_db;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM login_attempts;
```

---

## Next Steps

After everything is working:
1. Test all authentication flows
2. Create admin dashboard
3. Add password reset functionality
4. Implement refresh token logic
5. Create user management interface
6. Integrate with AI evaluation engine

---

## Support

If you encounter issues:
1. Check the error message carefully
2. Review the Troubleshooting section
3. Verify all .env files are configured correctly
4. Ensure XAMPP MySQL is running
5. Make sure ports 8000 (API) and 5173 (Frontend) are available

---

Created: April 15, 2026

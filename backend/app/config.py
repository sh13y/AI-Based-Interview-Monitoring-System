import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/modern_matrix_db")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_super_secret_key_min_32_chars_change_in_production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "")

# Frontend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Token Expiry
VERIFICATION_TOKEN_EXPIRE_MINUTES = int(os.getenv("VERIFICATION_TOKEN_EXPIRE_MINUTES", "10"))
LOCKOUT_DURATION_MINUTES = int(os.getenv("LOCKOUT_DURATION_MINUTES", "15"))

# Password Validation
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128

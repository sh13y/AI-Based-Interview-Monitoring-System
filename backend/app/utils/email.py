import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import SMTP_SERVER, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SENDER_EMAIL


async def send_verification_email(to_email: str, verification_link: str) -> bool:
    """
    Send email verification link to user.
    Returns True if successful, False otherwise.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[DEV MODE] Would send verification email to {to_email}")
        print(f"[DEV MODE] Verification link: {verification_link}")
        return True

    try:
        # Create email message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Verify Your Modern Matrix Account"
        message["From"] = SENDER_EMAIL
        message["To"] = to_email

        # Plain text version
        text = f"""
Hello,

Please verify your email address to complete your Modern Matrix account registration.

Click the link below to verify your email:
{verification_link}

This link will expire in 10 minutes.

If you didn't create this account, please ignore this email.

Best regards,
Modern Matrix Team
        """

        # HTML version
        html = f"""
<html>
  <body style="font-family: Arial, sans-serif; margin: 20px;">
    <h2 style="color: #333;">Verify Your Email</h2>
    <p>Hello,</p>
    <p>Please verify your email address to complete your Modern Matrix account registration.</p>
    <p>
      <a href="{verification_link}" style="display: inline-block; padding: 10px 20px; background-color: #a8b87d; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
    </p>
    <p><small>This link will expire in 10 minutes.</small></p>
    <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
    <p style="color: #999; font-size: 11px;">Modern Matrix Team</p>
  </body>
</html>
        """

        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)

        # Send email via SMTP
        async with aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT) as smtp:
            await smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            await smtp.send_message(message)

        return True

    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False


async def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """
    Send password reset link to user.
    Returns True if successful, False otherwise.
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[DEV MODE] Would send password reset email to {to_email}")
        print(f"[DEV MODE] Reset link: {reset_link}")
        return True

    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = "Reset Your Modern Matrix Password"
        message["From"] = SENDER_EMAIL
        message["To"] = to_email

        text = f"""
Hello,

You requested to reset your password for your Modern Matrix account.

Click the link below to reset your password:
{reset_link}

This link will expire in 10 minutes.

If you didn't request a password reset, please ignore this email.

Best regards,
Modern Matrix Team
        """

        html = f"""
<html>
  <body style="font-family: Arial, sans-serif; margin: 20px;">
    <h2 style="color: #333;">Reset Your Password</h2>
    <p>Hello,</p>
    <p>You requested to reset your password for your Modern Matrix account.</p>
    <p>
      <a href="{reset_link}" style="display: inline-block; padding: 10px 20px; background-color: #a8b87d; color: white; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
    </p>
    <p><small>This link will expire in 10 minutes.</small></p>
    <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    <p style="color: #999; font-size: 11px;">Modern Matrix Team</p>
  </body>
</html>
        """

        part1 = MIMEText(text, "plain")
        part2 = MIMEText(html, "html")
        message.attach(part1)
        message.attach(part2)

        async with aiosmtplib.SMTP(hostname=SMTP_SERVER, port=SMTP_PORT) as smtp:
            await smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            await smtp.send_message(message)

        return True

    except Exception as e:
        print(f"Error sending password reset email: {str(e)}")
        return False

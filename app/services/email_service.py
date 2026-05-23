import smtplib
from email.mime.text import MIMEText

from app.core.config import settings


def send_reset_otp_email(to_email: str, otp: str):

    body = f"""
Hello,

Your CMO.AI password reset verification code is:

{otp}

This code expires in 10 minutes.

If you did not request this, please ignore this email.

CMO.AI Team
"""

    msg = MIMEText(body)

    msg["Subject"] = "CMO.AI Password Reset Code"
    msg["From"] = f"CMO.AI <{settings.EMAILS_FROM_EMAIL}>"
    msg["To"] = to_email

    smtp = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)

    smtp.ehlo()
    smtp.starttls()
    smtp.ehlo()

    smtp.login(
        settings.SMTP_USERNAME,
        settings.SMTP_PASSWORD
    )

    smtp.send_message(msg)
    smtp.quit()
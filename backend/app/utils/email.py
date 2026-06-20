import resend
import os

resend.api_key = os.environ.get("RESEND_API_KEY")

def send_verification_email(email: str, token: str):
    verify_url = f"https://expense-flow-bvi6.vercel.app/verify-email?token={token}"
    
    if not resend.api_key:
        print(f"MOCK EMAIL: Would send verification email to {email} with url {verify_url}")
        return True
        
    try:
        r = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": email,
            "subject": "Verify your ExpenseFlow account",
            "html": f"<p>Welcome to ExpenseFlow! Please <a href='{verify_url}'>click here to verify your email</a>.</p>"
        })
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False

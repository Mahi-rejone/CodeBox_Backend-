import {resend} from "../lib/resend";
import VerificationEmail from "../emails/VerificationEmail";

interface SendVerificationEmailProps {
  email: string;
  username: string;
  otp: string;
}

interface SendVerificationEmailResponse {
  success: boolean;
  message: string;
}

export async function sendVerificationEmail({
  email,
  username,
  otp
}: SendVerificationEmailProps): Promise<SendVerificationEmailResponse> {
  try {
    await resend.emails.send({
      from: "BloodFlow <support@bloodflow.sayemtech.com>",
      to: email,
      subject: "BloodFlow: Verify your email address",
      react: VerificationEmail({ username, otp }),
    });
    return { success: true, message: "Verification email sent successfully" };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return { success: false, message: "Failed to send verification email" };
  }
}
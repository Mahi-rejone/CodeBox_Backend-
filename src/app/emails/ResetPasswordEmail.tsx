import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Preview,
} from "react-email";

interface ResetPasswordEmailProps {
  username: string;
  resetLink: string;
}

export default function ResetPasswordEmail({
  username,
  resetLink,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your BloodFlow password</Preview>
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f8fafc" }}>
        <Container
          style={{
            backgroundColor: "#ffffff",
            padding: "32px",
            borderRadius: "12px",
            maxWidth: "480px",
          }}
        >
          <Heading style={{ color: "#111827", fontSize: "20px" }}>
            Reset your password
          </Heading>
          <Text style={{ color: "#6b7280", fontSize: "14px" }}>
            Hi {username}, we received a request to reset your BloodFlow
            password. This link expires in 1 hour.
          </Text>
          <Button
            href={resetLink}
            style={{
              backgroundColor: "#dc2626",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              textDecoration: "none",
            }}
          >
            Reset Password
          </Button>
          <Text
            style={{ color: "#9ca3af", fontSize: "12px", marginTop: "24px" }}
          >
            If you didn't request this, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

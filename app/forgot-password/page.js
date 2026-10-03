import AuthShell from "@/components/AuthShell";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" description="Enter your account email and Findmatch will send a secure recovery link." alternate={{ text: "Remembered your password?", label: "Log in", href: "/login" }}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}

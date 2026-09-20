import AuthShell from "@/components/AuthShell";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" description="Your recovery link has been verified. Set a new password to secure your FindMatch account." alternate={{ text: "Need a new recovery link?", label: "Start again", href: "/forgot-password" }}>
      <ResetPasswordForm />
    </AuthShell>
  );
}

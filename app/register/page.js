import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" description="Create an account to report items, review Possible Matches, and use secure Claim Verification." alternate={{ text: "Already have an account?", label: "Log in", href: "/login" }}>
      <RegisterForm />
    </AuthShell>
  );
}

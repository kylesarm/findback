import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/RegisterForm";

export const metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" description="Use your campus details to join the FindBack community." alternate={{ text: "Already have an account?", label: "Log in", href: "/login" }}>
      <RegisterForm />
    </AuthShell>
  );
}

import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next = typeof params?.next === "string" ? params.next : "/dashboard";
  const message = typeof params?.message === "string" ? params.message : "";

  return (
    <AuthShell title="Welcome back" description="Log in to manage reports, review Possible Matches, and track Claim Verification." alternate={{ text: "New to FindMatch?", label: "Create an account", href: "/register" }}>
      <LoginForm next={next} message={message} />
    </AuthShell>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginScreen } from "@/components/LoginScreen";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <LoginScreen
        onLoginSuccess={() => {
          navigate({ to: "/" });
        }}
      />
    </div>
  );
}

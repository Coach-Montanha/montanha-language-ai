import { createFileRoute, useNavigate } from "@tanstack/react-router";
import LoginScreen from "@/components/LoginScreen";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();

  return (
    <LoginScreen
      onLoginSuccess={(session) => {
        console.log("Logged in successfully:", session);
        navigate({ to: "/" });
      }}
    />
  );
}

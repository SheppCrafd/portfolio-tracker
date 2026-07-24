import { useEffect } from "react";
import LoginScreen from "@/components/auth/LoginScreen";

export default function LoginPage() {
  useEffect(() => {
    document.title = "Sign in | Vaea";
  }, []);

  return <LoginScreen />;
}

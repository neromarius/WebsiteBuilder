import { useParams } from "wouter";
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";

export default function Auth() {
  const params = useParams<{ type: string }>();
  const isLogin = params.type === "login";
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>
    </div>
  );
}

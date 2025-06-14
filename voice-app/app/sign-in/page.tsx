import AuthForm from "@/components/auth/auth-form";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <AuthForm type="sign-in" />
    </div>
  );
} 
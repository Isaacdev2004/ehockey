// src/app/(auth-pages)/login/page.tsx
import { AuthCard } from "@/components/ui/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <AuthCard
        title="Welcome back"
        description="Enter your email to sign in to your account"
      >
        <LoginForm />
      </AuthCard>
    </div>
  )
}
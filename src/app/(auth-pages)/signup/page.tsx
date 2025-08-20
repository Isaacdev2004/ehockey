// src/app/(auth-pages)/register/page.tsx
import { AuthCard } from "@/components/ui/auth-card"
import { RegisterForm } from "@/components/auth/signup-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Register",
  description: "Create a new account",
}

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <AuthCard
        title="Create an account"
        description="Enter your email below to create your account"
      >
        <RegisterForm />
      </AuthCard>
    </div>
  )
}
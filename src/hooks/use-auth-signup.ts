// src/hooks/use-auth-register.ts
import { useToast } from "@/hooks/use-toast"
import { RegisterFormData } from "@/lib/validations/auth"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface UseAuthRegister {
  isLoading: boolean
  register: (data: RegisterFormData) => Promise<void>
}

export function useAuthRegister(): UseAuthRegister {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function register(data: RegisterFormData) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast({
        variant: "default",
        title: "Success",
        description: "You have successfully registered.",
      })

      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, register }
}
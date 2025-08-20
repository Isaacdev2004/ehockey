// src/app/(protected-pages)/layout.tsx
"use client";

import { useProtectedRoute } from "@/hooks/use-protected-route";
import { Loader } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useProtectedRoute();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
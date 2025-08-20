'use client'

import { useSidebar } from "@/components/ui/sidebar"
import { useEffect } from "react"

export function MobileSidebarBackdrop() {
  const { open, setOpen } = useSidebar()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-30 lg:hidden"
      onClick={() => setOpen(false)}
    />
  )
}

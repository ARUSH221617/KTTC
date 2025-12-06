"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"

interface AdminShellProps {
  children: React.ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex min-h-screen relative">
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col fixed inset-y-0 z-50 transition-all duration-300",
          isCollapsed ? "w-[80px]" : "w-64"
        )}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          isCollapsed ? "md:pl-[80px]" : "md:pl-64"
        )}
      >
        <header className="md:hidden flex items-center h-16 border-b px-4 shrink-0 bg-background">
          <MobileNav />
          <div className="ml-4 font-semibold">KTTC Admin</div>
        </header>
        <main className="flex-1 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  )
}

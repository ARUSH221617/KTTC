"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Award,
  Mail,
  MessageSquare,
  LogOut,
  Settings,
  Image,
  Bot
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname.startsWith("/admin/users"),
    },
    {
      label: "Courses",
      icon: GraduationCap,
      href: "/admin/courses",
      active: pathname.startsWith("/admin/courses"),
    },
    {
      label: "Certificates",
      icon: Award,
      href: "/admin/certificates",
      active: pathname.startsWith("/admin/certificates"),
    },
    {
      label: "Contacts",
      icon: Mail,
      href: "/admin/contacts",
      active: pathname.startsWith("/admin/contacts"),
    },
    {
      label: "Testimonials",
      icon: MessageSquare,
      href: "/admin/testimonials",
      active: pathname.startsWith("/admin/testimonials"),
    },
    {
      label: "Media",
      icon: Image,
      href: "/admin/media",
      active: pathname.startsWith("/admin/media"),
    },
    {
      label: "AI Agent Chat",
      icon: Bot,
      href: "/admin/ai-agent-chat",
      active: pathname.startsWith("/admin/ai-agent-chat"),
    },
  ];

  return (
    <div className={cn("pb-12 h-full border-r bg-background", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            KTTC Admin
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
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
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

export function Sidebar({ className, isCollapsed = false, toggleCollapse }: SidebarProps) {
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
      label: "Blog",
      icon: BookOpen,
      href: "/admin/blog",
      active: pathname.startsWith("/admin/blog"),
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
      label: "AI Agent",
      icon: MessageSquare,
      href: "/chat",
      active: pathname.startsWith("/chat"),
    },
  ];

  return (
    <div className={cn("pb-12 h-full border-r bg-background flex flex-col justify-between", className)}>
      <div className="space-y-4 py-4">
        <div className={cn("px-3 py-2 transition-all", isCollapsed ? "px-2" : "px-3")}>
          <div className="flex items-center justify-between mb-2 px-2 h-9">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold tracking-tight whitespace-nowrap overflow-hidden">
                KTTC Admin
              </h2>
            )}
             {/* Only show toggle button if toggleCollapse is provided (Desktop) */}
            {toggleCollapse && (
                 <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-6 w-6", isCollapsed ? "mx-auto" : "ml-auto")}
                    onClick={toggleCollapse}
                  >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
            )}
          </div>

          <div className="space-y-1">
            {routes.map((route) => {
               const isActive = route.active;

               if (isCollapsed) {
                 return (
                   <Tooltip key={route.href} delayDuration={0}>
                     <TooltipTrigger asChild>
                       <Button
                         variant={isActive ? "secondary" : "ghost"}
                         className="w-full justify-center px-2"
                         asChild
                       >
                         <Link href={route.href}>
                           <route.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                           <span className="sr-only">{route.label}</span>
                         </Link>
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent side="right">
                       {route.label}
                     </TooltipContent>
                   </Tooltip>
                 )
               }

               return (
                  <Button
                    key={route.href}
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href={route.href}>
                      <route.icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </Link>
                  </Button>
               )
            })}
          </div>
        </div>
      </div>

      <div className="px-3 py-4">
         <div className={cn("px-3 py-2 transition-all", isCollapsed ? "px-2" : "px-3")}>
             {isCollapsed ? (
                 <Tooltip delayDuration={0}>
                     <TooltipTrigger asChild>
                         <Button
                             variant="ghost"
                             className="w-full justify-center px-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                             onClick={() => signOut({ callbackUrl: "/" })}
                         >
                             <LogOut className="h-4 w-4" />
                             <span className="sr-only">Sign out</span>
                         </Button>
                     </TooltipTrigger>
                     <TooltipContent side="right">
                         Sign out
                     </TooltipContent>
                 </Tooltip>
             ) : (
                 <Button
                     variant="ghost"
                     className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                     onClick={() => signOut({ callbackUrl: "/" })}
                 >
                     <LogOut className="mr-2 h-4 w-4" />
                     Sign out
                 </Button>
             )}
         </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard } from "lucide-react";

export function MainNav({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  // Simple nav — just Dashboard for now
  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
  ];

  return (
    <nav className={cn("flex items-center space-x-4 lg:space-x-6", className)} {...props}>
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white mr-4">
        <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center">
          <FileText className="text-white" size={18} />
        </div>
        VisaDoc
      </Link>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-white flex items-center gap-2",
            route.active ? "text-white" : "text-zinc-400"
          )}
        >
          <route.icon size={16} />
          {route.label}
        </Link>
      ))}
    </nav>
  );
}

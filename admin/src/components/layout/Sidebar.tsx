"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  FileText, 
  ShieldCheck, 
  FileSignature, 
  LayoutDashboard 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Users", href: "/users", icon: Users },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Verifications", href: "/verifications", icon: ShieldCheck },
  { name: "DS-160 Forms", href: "/ds160", icon: FileSignature },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-[#e2e8f0] bg-white text-[#0f172a]">
      <div className="flex h-16 shrink-0 items-center border-b border-[#e2e8f0] px-6">
        <span className="text-xl font-bold tracking-tight text-[#16a34a]">
          Admin<span className="text-[#0f172a]">DocHub</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#f0fdf4] text-[#16a34a]"
                    : "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                    isActive ? "text-[#16a34a]" : "text-[#94a3b8] group-hover:text-[#475569]"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

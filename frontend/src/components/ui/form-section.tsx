"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
}

export function FormSection({
  id,
  title,
  description,
  children,
  badge,
  defaultOpen = false,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div id={id} className="border border-zinc-800 rounded-xl bg-zinc-900/20 overflow-hidden transition-all duration-300 hover:border-zinc-700/50">
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-zinc-200 flex items-center gap-3">
            {title}
            {badge && (
              <span className="text-[10px] font-medium bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                {badge}
              </span>
            )}
          </h3>
          {description && <p className="text-xs text-zinc-500">{description}</p>}
        </div>
        <div className={cn("text-zinc-500 transition-transform duration-300", isOpen && "rotate-180")}>
          <ChevronDown size={18} />
        </div>
      </div>
      
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 border-t border-zinc-800/50 bg-black/20">
          {children}
        </div>
      </div>
    </div>
  );
}

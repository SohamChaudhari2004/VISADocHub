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
    <div id={id} className="border border-border rounded-xl bg-muted/20 overflow-hidden transition-all duration-300 hover:border-border/50">
      <div
        className="flex items-center justify-between p-4 cursor-pointer bg-muted/40 hover:bg-muted/60 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-3">
            {title}
            {badge && (
              <span className="text-[10px] font-medium bg-muted text-text-secondary px-2 py-0.5 rounded-full border border-border">
                {badge}
              </span>
            )}
          </h3>
          {description && <p className="text-xs text-text-secondary">{description}</p>}
        </div>
        <div className={cn("text-text-secondary transition-transform duration-300", isOpen && "rotate-180")}>
          <ChevronDown size={18} />
        </div>
      </div>
      
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 border-t border-border/50 bg-background/20">
          {children}
        </div>
      </div>
    </div>
  );
}

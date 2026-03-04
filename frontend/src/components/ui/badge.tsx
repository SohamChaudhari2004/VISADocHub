import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-text-secondary",
        success: "border-green-800 bg-green-950 text-green-400",
        warning: "border-yellow-800 bg-yellow-950 text-yellow-400",
        destructive: "border-red-800 bg-red-950 text-red-400",
        outline: "border-border text-text-secondary",
        secondary: "border-zinc-600 bg-muted/50 text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

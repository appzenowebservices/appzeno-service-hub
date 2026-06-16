import { cn } from "../../../../utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "danger" | "warning" | "neutral" | "accent";
  size?:    "sm" | "md";
  className?: string;
}

export default function Badge({ children, variant = "primary", size = "md", className }: BadgeProps) {
  const variants = {
    primary: "bg-primary-100 text-primary-700",
    success: "bg-success-light text-success-dark",
    danger:  "bg-danger-light text-danger-dark",
    warning: "bg-warning-light text-warning-dark",
    neutral: "bg-neutral-200 text-neutral-700",
    accent:  "bg-accent-light text-accent-dark",
  };
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-medium", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

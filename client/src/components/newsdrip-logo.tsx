import { cn } from "@/lib/utils";

interface NewsDripLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export function NewsDripLogo({ size = "md", className, showText = true }: NewsDripLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const textSizeClasses = {
    sm: "text-lg font-bold",
    md: "text-2xl font-bold",
    lg: "text-3xl font-bold", 
    xl: "text-5xl font-bold"
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Lightning bolt logo */}
      <div className={cn(
        "rounded-full bg-primary flex items-center justify-center shadow-lg",
        sizeClasses[size]
      )}>
        <svg 
          className={cn("text-white fill-current", iconSizeClasses[size])}
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" fill="currentColor"/>
        </svg>
      </div>
      
      {/* Brand text */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn("text-foreground tracking-tight", textSizeClasses[size])}>
            NewsDrip
          </span>
          <span className="text-muted-foreground text-sm font-medium -mt-1">
            The Gist. No Fluff.
          </span>
        </div>
      )}
    </div>
  );
}

export function LightningIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("fill-current", className)}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" fill="currentColor"/>
    </svg>
  );
}
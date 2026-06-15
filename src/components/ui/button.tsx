import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-500/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-navy-700 text-white hover:bg-navy-800",
        ocean: "bg-ocean-500 text-white shadow-sm shadow-ocean-900/20 hover:bg-ocean-600 hover:shadow-premium",
        premium:
          "bg-gradient-to-r from-ocean-500 via-ocean-600 to-navy-800 text-white shadow-premium hover:shadow-premium-lg hover:brightness-110",
        glass:
          "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:border-white/50 hover:bg-white/20",
        outline: "border border-navy-200 bg-white hover:bg-navy-50 text-navy-800 hover:shadow-sm",
        ghost: "hover:bg-navy-50 text-navy-800",
        destructive: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

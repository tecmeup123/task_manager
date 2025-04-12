import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { User, CircleUser, UserCircle } from "lucide-react"

const avatarIconComponents = {
  user: User,
  circleUser: CircleUser,
  userCircle: UserCircle,
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    avatarColor?: string;
    avatarShape?: "circle" | "square";
    avatarBackground?: "solid" | "gradient";
  }
>(
  ({ className, avatarColor = "#6366F1", avatarShape = "circle", avatarBackground = "gradient", ...props }, ref) => (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden",
        avatarShape === "square" ? "rounded-md" : "rounded-full",
        className
      )}
      {...props}
    />
  )
)
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
    avatarColor?: string;
    avatarBackground?: "solid" | "gradient";
    avatarIcon?: keyof typeof avatarIconComponents;
  }
>(({ className, avatarColor = "#6366F1", avatarBackground = "gradient", avatarIcon = "user", ...props }, ref) => {
  const IconComponent = avatarIconComponents[avatarIcon] || User;
  
  const bgStyle = avatarBackground === "gradient" 
    ? { background: `linear-gradient(135deg, ${avatarColor}, ${adjustColorBrightness(avatarColor, -20)})` } 
    : { backgroundColor: avatarColor };
  
  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center",
        className
      )}
      style={bgStyle}
      {...props}
    >
      <IconComponent className="h-6 w-6 text-white" />
    </AvatarPrimitive.Fallback>
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number) {
  // Parse the hex color
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);

  // Adjust brightness
  r = Math.min(255, Math.max(0, r + (r * percent / 100)));
  g = Math.min(255, Math.max(0, g + (g * percent / 100)));
  b = Math.min(255, Math.max(0, b + (b * percent / 100)));

  // Convert back to hex
  const rHex = Math.round(r).toString(16).padStart(2, '0');
  const gHex = Math.round(g).toString(16).padStart(2, '0');
  const bHex = Math.round(b).toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

export { Avatar, AvatarImage, AvatarFallback }
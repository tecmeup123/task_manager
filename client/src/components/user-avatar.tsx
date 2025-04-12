import { cn } from "@/lib/utils";
import { User, UserCircle, UserCog, Shield, Star, Heart, Smile, Camera, 
  Music, BookOpen, Coffee, Zap, Award, Gift, Sun } from "lucide-react";
import { CSSProperties } from "react";

export type AvatarShape = "circle" | "square" | "hexagon" | "rounded";
export type AvatarBackground = "solid" | "gradient" | "pattern";

export interface UserAvatarProps {
  username?: string;
  fullName?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  avatarColor?: string;
  avatarShape?: AvatarShape;
  avatarIcon?: string;
  avatarBackground?: AvatarBackground;
  className?: string;
}

export function UserAvatar({
  username = "",
  fullName,
  size = "md",
  avatarColor = "#6366F1",
  avatarShape = "circle",
  avatarIcon = "user",
  avatarBackground = "gradient",
  className,
}: UserAvatarProps) {
  const displayName = fullName || username;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "??";

  // Size mappings
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-base",
    xl: "h-24 w-24 text-lg",
  };

  // Shape mappings
  const shapeClasses = {
    circle: "rounded-full",
    square: "rounded-none",
    hexagon: "clip-path-hexagon",
    rounded: "rounded-lg",
  };

  // Icon mappings
  const iconMap: Record<string, React.ReactNode> = {
    user: <User className="h-full w-full p-1.5" />,
    userCircle: <UserCircle className="h-full w-full p-1.5" />,
    userCog: <UserCog className="h-full w-full p-1.5" />,
    shield: <Shield className="h-full w-full p-1.5" />,
    star: <Star className="h-full w-full p-1.5" />,
    heart: <Heart className="h-full w-full p-1.5" />,
    smile: <Smile className="h-full w-full p-1.5" />,
    camera: <Camera className="h-full w-full p-1.5" />,
    music: <Music className="h-full w-full p-1.5" />,
    book: <BookOpen className="h-full w-full p-1.5" />,
    coffee: <Coffee className="h-full w-full p-1.5" />,
    zap: <Zap className="h-full w-full p-1.5" />,
    award: <Award className="h-full w-full p-1.5" />,
    gift: <Gift className="h-full w-full p-1.5" />,
    sun: <Sun className="h-full w-full p-1.5" />,
  };

  // Background styles
  const getBackgroundStyle = (): CSSProperties => {
    switch (avatarBackground) {
      case "solid":
        return { backgroundColor: avatarColor };
      case "gradient":
        return {
          background: `linear-gradient(135deg, ${avatarColor}, ${adjustColor(
            avatarColor,
            40
          )})`,
        };
      case "pattern":
        return {
          backgroundColor: avatarColor,
          backgroundImage: `radial-gradient(circle, ${adjustColor(
            avatarColor,
            40
          )} 10%, transparent 10%), radial-gradient(circle, ${adjustColor(
            avatarColor,
            40
          )} 10%, transparent 10%)`,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        };
      default:
        return { backgroundColor: avatarColor };
    }
  };

  // Helper function to adjust color brightness
  function adjustColor(color: string, amount: number): string {
    // Strip the hash if it exists
    color = color.replace("#", "");
    
    // Parse the colors
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // Adjust each color
    const adjustR = Math.min(255, Math.max(0, r + amount));
    const adjustG = Math.min(255, Math.max(0, g + amount));
    const adjustB = Math.min(255, Math.max(0, b + amount));
    
    // Convert back to hex
    return `#${adjustR.toString(16).padStart(2, '0')}${adjustG.toString(16).padStart(2, '0')}${adjustB.toString(16).padStart(2, '0')}`;
  }

  // Custom style for hexagon shape
  const customStyles = avatarShape === "hexagon" 
    ? { clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" } 
    : {};

  return (
    <div
      className={cn(
        "flex items-center justify-center text-white font-medium relative",
        sizeClasses[size],
        shapeClasses[avatarShape],
        className
      )}
      style={{ 
        ...getBackgroundStyle(), 
        ...customStyles 
      }}
    >
      {avatarIcon && iconMap[avatarIcon] ? iconMap[avatarIcon] : initials}
    </div>
  );
}